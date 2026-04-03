<?php
declare(strict_types=1);

date_default_timezone_set('Africa/Accra');

const MEDSERVE_ROLE_PERMISSIONS = [
    'super_admin' => ['*'],
    'admin' => [
        'dashboard.view',
        'products.view', 'products.create', 'products.update', 'products.delete',
        'categories.view', 'categories.create', 'categories.update', 'categories.delete',
        'orders.view', 'orders.update',
        'prescriptions.view', 'prescriptions.update',
        'customers.view',
        'inventory.view',
        'content.view', 'content.update',
        'reports.view',
        'users.view',
    ],
    'manager' => [
        'dashboard.view',
        'products.view', 'products.create', 'products.update',
        'categories.view', 'categories.create', 'categories.update',
        'orders.view', 'orders.update',
        'prescriptions.view',
        'customers.view',
        'inventory.view',
        'reports.view',
    ],
    'editor' => ['content.view', 'content.update', 'categories.view', 'products.view'],
    'support_staff' => ['dashboard.view', 'orders.view', 'customers.view', 'prescriptions.view'],
    'finance_manager' => ['dashboard.view', 'orders.view', 'orders.update', 'reports.view'],
    'content_manager' => ['content.view', 'content.update', 'categories.view', 'products.view'],
    'pharmacist' => ['dashboard.view', 'prescriptions.view', 'prescriptions.update', 'notes.view', 'notes.create'],
    'customer' => ['account.view', 'orders.create', 'orders.view_own', 'prescriptions.create', 'prescriptions.view_own', 'addresses.manage', 'profile.manage'],
];

function medserve_storage_path(string $path = ''): string
{
    $base = __DIR__ . DIRECTORY_SEPARATOR . 'storage';
    if (!is_dir($base)) {
        mkdir($base, 0777, true);
    }

    return $path === '' ? $base : $base . DIRECTORY_SEPARATOR . $path;
}

function medserve_now(): string
{
    return (new DateTimeImmutable('now', new DateTimeZone('Africa/Accra')))->format('Y-m-d H:i:s');
}

function medserve_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function medserve_upload_path(string $type): string
{
    $path = medserve_storage_path('uploads' . DIRECTORY_SEPARATOR . $type);
    if (!is_dir($path)) {
        mkdir($path, 0777, true);
    }
    return $path;
}

function medserve_rate_limit_path(): string
{
    $path = medserve_storage_path('rate-limit');
    if (!is_dir($path)) {
        mkdir($path, 0777, true);
    }
    return $path;
}

function medserve_set_security_headers(): void
{
    header('X-Frame-Options: DENY');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()');
    header("Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self' http://127.0.0.1:8000 http://127.0.0.1:8080; frame-ancestors 'none'; base-uri 'self'; form-action 'self';");
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    }
}

function medserve_start_session(): void
{
    $sessionPath = medserve_storage_path('sessions');
    if (!is_dir($sessionPath)) {
        mkdir($sessionPath, 0777, true);
    }

    session_save_path($sessionPath);
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    ]);

    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }

    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
}

function medserve_slugify(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    return trim($value, '-') ?: 'item';
}

function medserve_normalize_text(?string $value, int $maxLength = 5000): string
{
    $value = trim((string) $value);
    $value = preg_replace('/\s+/', ' ', $value) ?? $value;
    if (mb_strlen($value) > $maxLength) {
        medserve_json(['error' => 'One of the submitted fields is too long. Please shorten it and try again.'], 422);
    }
    return $value;
}

function medserve_body(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_contains($contentType, 'application/json')) {
        $raw = file_get_contents('php://input');
        if (!$raw) {
            return [];
        }
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    return $_POST;
}

function medserve_require_csrf(): void
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
        return;
    }

    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    if (in_array($path, ['/api/auth/login', '/api/auth/register'], true)) {
        return;
    }

    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
        medserve_json(['error' => 'Your session could not be verified. Refresh the page and try again.'], 419);
    }
}

function medserve_record_login_attempt(string $email, bool $success): void
{
    $key = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . '|' . strtolower($email));
    $path = medserve_rate_limit_path() . DIRECTORY_SEPARATOR . $key . '.json';
    $state = ['count' => 0, 'reset_at' => time() + 900];
    if (is_file($path)) {
        $decoded = json_decode((string) file_get_contents($path), true);
        if (is_array($decoded)) {
            $state = $decoded;
        }
    }

    if ($success) {
        @unlink($path);
        return;
    }

    if (($state['reset_at'] ?? 0) < time()) {
        $state = ['count' => 0, 'reset_at' => time() + 900];
    }
    $state['count'] = ($state['count'] ?? 0) + 1;
    file_put_contents($path, json_encode($state));
}

function medserve_guard_login_attempt(string $email): void
{
    $key = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . '|' . strtolower($email));
    $path = medserve_rate_limit_path() . DIRECTORY_SEPARATOR . $key . '.json';
    if (!is_file($path)) {
        return;
    }
    $state = json_decode((string) file_get_contents($path), true);
    if (!is_array($state)) {
        return;
    }
    if (($state['reset_at'] ?? 0) < time()) {
        @unlink($path);
        return;
    }
    if (($state['count'] ?? 0) >= 5) {
        medserve_json(['error' => 'Too many login attempts. Please wait a few minutes before trying again.'], 429);
    }
}

function medserve_query_all(PDO $pdo, string $sql, array $params = []): array
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function medserve_query_one(PDO $pdo, string $sql, array $params = []): ?array
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function medserve_file_url(?string $relativePath): ?string
{
    if (!$relativePath) {
        return null;
    }

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? '127.0.0.1:8000';
    return "{$scheme}://{$host}/files/{$relativePath}";
}

function medserve_current_user(PDO $pdo): ?array
{
    $userId = $_SESSION['user_id'] ?? null;
    if (!$userId) {
        return null;
    }

    $user = medserve_query_one(
        $pdo,
        'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = :id',
        [':id' => $userId]
    );

    if (!$user) {
        unset($_SESSION['user_id']);
        return null;
    }

    $user['permissions'] = medserve_permissions_for_role($user['role']);
    return $user;
}

function medserve_permissions_for_role(string $role): array
{
    return MEDSERVE_ROLE_PERMISSIONS[$role] ?? [];
}

function medserve_has_permission(array $user, string $permission): bool
{
    $permissions = medserve_permissions_for_role($user['role']);
    return in_array('*', $permissions, true) || in_array($permission, $permissions, true);
}

function medserve_require_auth(PDO $pdo): array
{
    $user = medserve_current_user($pdo);
    if (!$user) {
        medserve_json(['error' => 'Authentication required.'], 401);
    }
    return $user;
}

function medserve_require_permission(PDO $pdo, string $permission): array
{
    $user = medserve_require_auth($pdo);
    if (!medserve_has_permission($user, $permission)) {
        medserve_json(['error' => 'You do not have permission to access this area.'], 403);
    }
    return $user;
}

function medserve_parse_tags(?string $json): array
{
    if (!$json) {
        return [];
    }
    $decoded = json_decode($json, true);
    return is_array($decoded) ? array_values($decoded) : [];
}

function medserve_format_category(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'description' => $row['description'],
        'heroText' => $row['hero_text'] ?? null,
        'productCount' => isset($row['product_count']) ? (int) $row['product_count'] : 0,
        'sortOrder' => (int) ($row['sort_order'] ?? 0),
        'isActive' => (bool) ($row['is_active'] ?? 1),
    ];
}

function medserve_format_product(array $row): array
{
    $stockQuantity = (int) $row['stock_quantity'];
    return [
        'id' => (int) $row['id'],
        'categoryId' => $row['category_id'] ? (int) $row['category_id'] : null,
        'categoryName' => $row['category_name'] ?? null,
        'categorySlug' => $row['category_slug'] ?? null,
        'name' => $row['name'],
        'slug' => $row['slug'],
        'sku' => $row['sku'],
        'brand' => $row['brand'],
        'description' => $row['description'],
        'usageGuidance' => $row['usage_guidance'],
        'warnings' => $row['warnings'],
        'dosageForm' => $row['dosage_form'] ?? null,
        'packSize' => $row['pack_size'] ?? null,
        'tags' => medserve_parse_tags($row['tags_json'] ?? '[]'),
        'price' => (float) $row['price'],
        'comparePrice' => $row['compare_price'] !== null ? (float) $row['compare_price'] : null,
        'imageUrl' => $row['image_url'] ? medserve_file_url($row['image_url']) : null,
        'prescriptionRequired' => (bool) $row['prescription_required'],
        'stockQuantity' => $stockQuantity,
        'stockStatus' => $stockQuantity <= 0 ? 'Out of Stock' : ($stockQuantity < 12 ? 'Low Stock' : 'In Stock'),
        'isActive' => (bool) $row['is_active'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
    ];
}

function medserve_format_prescription(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'reference' => $row['reference'],
        'userId' => (int) $row['user_id'],
        'patientName' => $row['patient_name'],
        'phone' => $row['phone'],
        'fileUrl' => $row['file_path'] ? medserve_file_url($row['file_path']) : null,
        'notes' => $row['notes'],
        'fulfilmentType' => $row['fulfilment_type'],
        'status' => $row['status'],
        'pharmacistNotes' => $row['pharmacist_notes'],
        'clarificationMessage' => $row['clarification_message'],
        'reviewedByName' => trim(($row['reviewer_first_name'] ?? '') . ' ' . ($row['reviewer_last_name'] ?? '')),
        'reviewedAt' => $row['reviewed_at'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
        'customerName' => trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')),
    ];
}

function medserve_format_order(array $row, PDO $pdo): array
{
    $items = medserve_query_all($pdo, 'SELECT * FROM order_items WHERE order_id = :order_id', [':order_id' => $row['id']]);
    return [
        'id' => (int) $row['id'],
        'orderNumber' => $row['order_number'],
        'status' => $row['status'],
        'fulfilmentType' => $row['fulfilment_type'],
        'subtotal' => (float) $row['subtotal'],
        'deliveryFee' => (float) $row['delivery_fee'],
        'total' => (float) $row['total'],
        'phone' => $row['phone'],
        'notes' => $row['notes'],
        'deliveryAddress' => $row['delivery_address_snapshot'] ? json_decode($row['delivery_address_snapshot'], true) : null,
        'customerName' => trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')),
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
        'items' => array_map(static fn(array $item) => [
            'id' => (int) $item['id'],
            'productId' => $item['product_id'] ? (int) $item['product_id'] : null,
            'productName' => $item['product_name'],
            'quantity' => (int) $item['quantity'],
            'unitPrice' => (float) $item['unit_price'],
            'totalPrice' => (float) $item['total_price'],
        ], $items),
    ];
}

function medserve_cms(PDO $pdo, string $key): array
{
    $row = medserve_query_one($pdo, 'SELECT value_json FROM cms_sections WHERE section_key = :key', [':key' => $key]);
    return $row ? (json_decode($row['value_json'], true) ?? []) : [];
}

function medserve_revision_keys(): array
{
    return ['public', 'customer', 'pharmacist', 'admin'];
}

function medserve_ensure_revisions(PDO $pdo): void
{
    $stmt = $pdo->prepare('INSERT OR IGNORE INTO system_revisions (revision_key, revision, updated_at) VALUES (:revision_key, 0, :updated_at)');
    $timestamp = medserve_now();
    foreach (medserve_revision_keys() as $key) {
        $stmt->execute([
            ':revision_key' => $key,
            ':updated_at' => $timestamp,
        ]);
    }
}

function medserve_get_revisions(PDO $pdo): array
{
    medserve_ensure_revisions($pdo);
    $rows = medserve_query_all($pdo, 'SELECT revision_key, revision, updated_at FROM system_revisions');
    $revisions = [];

    foreach ($rows as $row) {
        $revisions[$row['revision_key']] = [
            'revision' => (int) $row['revision'],
            'updatedAt' => $row['updated_at'],
        ];
    }

    foreach (medserve_revision_keys() as $key) {
        $revisions[$key] ??= [
            'revision' => 0,
            'updatedAt' => medserve_now(),
        ];
    }

    return $revisions;
}

function medserve_bump_revisions(PDO $pdo, array $keys): void
{
    medserve_ensure_revisions($pdo);
    $stmt = $pdo->prepare('UPDATE system_revisions SET revision = revision + 1, updated_at = :updated_at WHERE revision_key = :revision_key');
    $timestamp = medserve_now();

    foreach (array_unique($keys) as $key) {
        if (!in_array($key, medserve_revision_keys(), true)) {
            continue;
        }

        $stmt->execute([
            ':updated_at' => $timestamp,
            ':revision_key' => $key,
        ]);
    }
}

function medserve_save_upload(string $field, string $type): ?string
{
    if (!isset($_FILES[$field]) || ($_FILES[$field]['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ($_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
        medserve_json(['error' => 'Upload could not be completed right now. Please try again.'], 422);
    }

    $allowed = [
        'prescriptions' => ['pdf' => 'application/pdf', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png'],
        'product-images' => ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'],
    ];
    $extension = strtolower(pathinfo($_FILES[$field]['name'] ?? 'file', PATHINFO_EXTENSION));
    $mime = mime_content_type($_FILES[$field]['tmp_name']) ?: '';
    $maxSize = $type === 'prescriptions' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;

    if (!isset($allowed[$type][$extension]) || $allowed[$type][$extension] !== $mime) {
        medserve_json(['error' => 'That file type is not allowed. Please upload a supported file format.'], 422);
    }
    if (($_FILES[$field]['size'] ?? 0) > $maxSize) {
        medserve_json(['error' => 'The selected file is too large. Please choose a smaller file and try again.'], 422);
    }

    $filename = bin2hex(random_bytes(18)) . '.' . $extension;
    $relativePath = $type . '/' . $filename;
    $destination = medserve_upload_path($type) . DIRECTORY_SEPARATOR . $filename;

    if (!move_uploaded_file($_FILES[$field]['tmp_name'], $destination)) {
        medserve_json(['error' => 'Upload could not be saved right now. Please try again.'], 500);
    }

    return $relativePath;
}

function medserve_db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $pdo = new PDO('sqlite:' . medserve_storage_path('medserve.sqlite'));
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA foreign_keys = ON;');

    return $pdo;
}
