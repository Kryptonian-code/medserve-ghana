<?php
declare(strict_types=1);

require_once __DIR__ . '/init.php';

$path = medserve_request_path();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($path === '/api/dashboard/admin' && $method === 'GET') {
    medserve_require_permission($medservePdo, 'dashboard.view');

    $summary = [
        'orders' => (int) $medservePdo->query('SELECT COUNT(*) FROM orders')->fetchColumn(),
        'revenue' => (float) $medservePdo->query("SELECT COALESCE(SUM(total), 0) FROM orders WHERE status IN ('Pending', 'Paid', 'Processing', 'Dispatched', 'Delivered', 'Awaiting Prescription Review')")->fetchColumn(),
        'awaitingReview' => (int) $medservePdo->query("SELECT COUNT(*) FROM prescriptions WHERE status IN ('Submitted', 'Under Review', 'Needs Clarification')")->fetchColumn(),
        'lowStock' => (int) $medservePdo->query('SELECT COUNT(*) FROM products WHERE stock_quantity BETWEEN 1 AND 11')->fetchColumn(),
    ];
    $recentOrders = medserve_query_all($medservePdo, 'SELECT o.*, u.first_name, u.last_name FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC LIMIT 5');
    $recentPrescriptions = medserve_query_all($medservePdo, 'SELECT p.*, u.first_name, u.last_name, reviewer.first_name AS reviewer_first_name, reviewer.last_name AS reviewer_last_name FROM prescriptions p JOIN users u ON u.id = p.user_id LEFT JOIN users reviewer ON reviewer.id = p.reviewed_by ORDER BY p.created_at DESC LIMIT 5');
    $topCategories = medserve_query_all($medservePdo, 'SELECT c.name, COUNT(p.id) AS total_products FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id ORDER BY total_products DESC LIMIT 5');
    $inventoryAlerts = medserve_query_all($medservePdo, 'SELECT name, stock_quantity FROM products ORDER BY stock_quantity ASC LIMIT 5');
    $recentCustomers = medserve_query_all($medservePdo, "SELECT first_name, last_name, email, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC LIMIT 5");

    medserve_json([
        'summary' => $summary,
        'recentOrders' => array_map(fn(array $row) => medserve_format_order($row, $medservePdo), $recentOrders),
        'recentPrescriptions' => array_map('medserve_format_prescription', $recentPrescriptions),
        'topCategories' => $topCategories,
        'inventoryAlerts' => $inventoryAlerts,
        'recentCustomers' => $recentCustomers,
        'notices' => [
            'Prescription uploads received after 4:00 PM will be reviewed on the next working day.',
            'One product is currently below the preferred stock threshold and needs replenishment planning.',
        ],
    ]);
}

if ($path === '/api/admin/products' && $method === 'GET') {
    medserve_require_permission($medservePdo, 'products.view');
    $search = trim((string) ($_GET['search'] ?? ''));
    $sql = 'SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE 1=1';
    $params = [];
    if ($search !== '') {
        $sql .= ' AND (p.name LIKE :search OR p.brand LIKE :search OR p.sku LIKE :search)';
        $params[':search'] = '%' . $search . '%';
    }
    $sql .= ' ORDER BY p.updated_at DESC';
    medserve_json(['products' => array_map('medserve_format_product', medserve_query_all($medservePdo, $sql, $params))]);
}

if ($path === '/api/admin/products' && $method === 'POST') {
    medserve_require_permission($medservePdo, 'products.create');
    $body = $_POST ?: medserve_body();
    $name = trim((string) ($body['name'] ?? ''));
    if ($name === '') {
        medserve_json(['error' => 'Product name cannot be empty.'], 422);
    }

    $stmt = $medservePdo->prepare('INSERT INTO products (category_id, name, slug, sku, brand, description, usage_guidance, warnings, dosage_form, pack_size, tags_json, price, compare_price, image_url, prescription_required, stock_quantity, is_active, created_at, updated_at) VALUES (:category_id, :name, :slug, :sku, :brand, :description, :usage_guidance, :warnings, :dosage_form, :pack_size, :tags_json, :price, :compare_price, :image_url, :prescription_required, :stock_quantity, :is_active, :created_at, :updated_at)');
    $timestamp = medserve_now();
    $stmt->execute([
        ':category_id' => !empty($body['categoryId']) ? (int) $body['categoryId'] : null,
        ':name' => $name,
        ':slug' => medserve_slugify((string) ($body['slug'] ?? $name)),
        ':sku' => trim((string) ($body['sku'] ?? ('MSG-' . random_int(1000, 9999)))),
        ':brand' => trim((string) ($body['brand'] ?? 'MedServe Ghana')),
        ':description' => trim((string) ($body['description'] ?? '')),
        ':usage_guidance' => trim((string) ($body['usageGuidance'] ?? '')),
        ':warnings' => trim((string) ($body['warnings'] ?? '')),
        ':dosage_form' => trim((string) ($body['dosageForm'] ?? '')),
        ':pack_size' => trim((string) ($body['packSize'] ?? '')),
        ':tags_json' => json_encode(array_filter(array_map('trim', explode(',', (string) ($body['tags'] ?? ''))))),
        ':price' => (float) ($body['price'] ?? 0),
        ':compare_price' => !empty($body['comparePrice']) ? (float) $body['comparePrice'] : null,
        ':image_url' => medserve_save_upload('image', 'product-images'),
        ':prescription_required' => !empty($body['prescriptionRequired']) ? 1 : 0,
        ':stock_quantity' => (int) ($body['stockQuantity'] ?? 0),
        ':is_active' => !isset($body['isActive']) || !empty($body['isActive']) ? 1 : 0,
        ':created_at' => $timestamp,
        ':updated_at' => $timestamp,
    ]);

    medserve_json(['message' => 'Product added successfully.'], 201);
}

if (preg_match('#^/api/admin/products/(\d+)$#', $path, $matches) && $method === 'PUT') {
    medserve_require_permission($medservePdo, 'products.update');
    $body = medserve_body();
    $existing = medserve_query_one($medservePdo, 'SELECT * FROM products WHERE id = :id', [':id' => (int) $matches[1]]);
    if (!$existing) {
        medserve_json(['error' => 'Product not found.'], 404);
    }

    $stmt = $medservePdo->prepare('UPDATE products SET category_id = :category_id, name = :name, slug = :slug, sku = :sku, brand = :brand, description = :description, usage_guidance = :usage_guidance, warnings = :warnings, dosage_form = :dosage_form, pack_size = :pack_size, tags_json = :tags_json, price = :price, compare_price = :compare_price, prescription_required = :prescription_required, stock_quantity = :stock_quantity, is_active = :is_active, updated_at = :updated_at WHERE id = :id');
    $stmt->execute([
        ':category_id' => !empty($body['categoryId']) ? (int) $body['categoryId'] : null,
        ':name' => trim((string) ($body['name'] ?? $existing['name'])),
        ':slug' => medserve_slugify((string) ($body['slug'] ?? $body['name'] ?? $existing['slug'])),
        ':sku' => trim((string) ($body['sku'] ?? $existing['sku'])),
        ':brand' => trim((string) ($body['brand'] ?? $existing['brand'])),
        ':description' => trim((string) ($body['description'] ?? $existing['description'])),
        ':usage_guidance' => trim((string) ($body['usageGuidance'] ?? $existing['usage_guidance'])),
        ':warnings' => trim((string) ($body['warnings'] ?? $existing['warnings'])),
        ':dosage_form' => trim((string) ($body['dosageForm'] ?? $existing['dosage_form'])),
        ':pack_size' => trim((string) ($body['packSize'] ?? $existing['pack_size'])),
        ':tags_json' => json_encode(array_filter(array_map('trim', explode(',', (string) ($body['tags'] ?? implode(', ', medserve_parse_tags($existing['tags_json']))))))),
        ':price' => (float) ($body['price'] ?? $existing['price']),
        ':compare_price' => isset($body['comparePrice']) && $body['comparePrice'] !== '' ? (float) $body['comparePrice'] : $existing['compare_price'],
        ':prescription_required' => !empty($body['prescriptionRequired']) ? 1 : 0,
        ':stock_quantity' => (int) ($body['stockQuantity'] ?? $existing['stock_quantity']),
        ':is_active' => !isset($body['isActive']) || !empty($body['isActive']) ? 1 : 0,
        ':updated_at' => medserve_now(),
        ':id' => (int) $matches[1],
    ]);

    medserve_json(['message' => 'Product updated successfully.']);
}

if (preg_match('#^/api/admin/products/(\d+)$#', $path, $matches) && $method === 'DELETE') {
    medserve_require_permission($medservePdo, 'products.delete');
    $medservePdo->prepare('DELETE FROM products WHERE id = :id')->execute([':id' => (int) $matches[1]]);
    medserve_json(['message' => 'Product deleted successfully.']);
}

if ($path === '/api/admin/categories' && $method === 'GET') {
    medserve_require_permission($medservePdo, 'categories.view');
    $rows = medserve_query_all($medservePdo, 'SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id ORDER BY c.sort_order ASC');
    medserve_json(['categories' => array_map('medserve_format_category', $rows)]);
}

if ($path === '/api/admin/categories' && $method === 'POST') {
    medserve_require_permission($medservePdo, 'categories.create');
    $body = medserve_body();
    $name = trim((string) ($body['name'] ?? ''));
    if ($name === '') {
        medserve_json(['error' => 'Category name cannot be empty.'], 422);
    }

    $stmt = $medservePdo->prepare('INSERT INTO categories (name, slug, description, hero_text, sort_order, is_active, created_at, updated_at) VALUES (:name, :slug, :description, :hero_text, :sort_order, :is_active, :created_at, :updated_at)');
    $timestamp = medserve_now();
    $stmt->execute([
        ':name' => $name,
        ':slug' => medserve_slugify((string) ($body['slug'] ?? $name)),
        ':description' => trim((string) ($body['description'] ?? '')),
        ':hero_text' => trim((string) ($body['heroText'] ?? '')),
        ':sort_order' => (int) ($body['sortOrder'] ?? 0),
        ':is_active' => !isset($body['isActive']) || !empty($body['isActive']) ? 1 : 0,
        ':created_at' => $timestamp,
        ':updated_at' => $timestamp,
    ]);

    medserve_json(['message' => 'Category published successfully.'], 201);
}

if (preg_match('#^/api/admin/categories/(\d+)$#', $path, $matches) && $method === 'PUT') {
    medserve_require_permission($medservePdo, 'categories.update');
    $body = medserve_body();
    $stmt = $medservePdo->prepare('UPDATE categories SET name = :name, slug = :slug, description = :description, hero_text = :hero_text, sort_order = :sort_order, is_active = :is_active, updated_at = :updated_at WHERE id = :id');
    $stmt->execute([
        ':name' => trim((string) ($body['name'] ?? '')),
        ':slug' => medserve_slugify((string) ($body['slug'] ?? $body['name'] ?? 'category')),
        ':description' => trim((string) ($body['description'] ?? '')),
        ':hero_text' => trim((string) ($body['heroText'] ?? '')),
        ':sort_order' => (int) ($body['sortOrder'] ?? 0),
        ':is_active' => !isset($body['isActive']) || !empty($body['isActive']) ? 1 : 0,
        ':updated_at' => medserve_now(),
        ':id' => (int) $matches[1],
    ]);

    medserve_json(['message' => 'Category updated successfully.']);
}

if (preg_match('#^/api/admin/categories/(\d+)$#', $path, $matches) && $method === 'DELETE') {
    medserve_require_permission($medservePdo, 'categories.delete');
    $medservePdo->prepare('DELETE FROM categories WHERE id = :id')->execute([':id' => (int) $matches[1]]);
    medserve_json(['message' => 'Category deleted successfully.']);
}

if ($path === '/api/admin/orders' && $method === 'GET') {
    medserve_require_permission($medservePdo, 'orders.view');
    $search = trim((string) ($_GET['search'] ?? ''));
    $status = trim((string) ($_GET['status'] ?? ''));
    $sql = 'SELECT o.*, u.first_name, u.last_name FROM orders o JOIN users u ON u.id = o.user_id WHERE 1=1';
    $params = [];
    if ($search !== '') {
        $sql .= ' AND (o.order_number LIKE :search OR u.first_name LIKE :search OR u.last_name LIKE :search)';
        $params[':search'] = '%' . $search . '%';
    }
    if ($status !== '' && $status !== 'all') {
        $sql .= ' AND o.status = :status';
        $params[':status'] = $status;
    }
    $sql .= ' ORDER BY o.created_at DESC';
    medserve_json(['orders' => array_map(fn(array $row) => medserve_format_order($row, $medservePdo), medserve_query_all($medservePdo, $sql, $params))]);
}

if (preg_match('#^/api/admin/orders/(\d+)$#', $path, $matches) && $method === 'PUT') {
    medserve_require_permission($medservePdo, 'orders.update');
    $body = medserve_body();
    $medservePdo->prepare('UPDATE orders SET status = :status, updated_at = :updated_at WHERE id = :id')->execute([
        ':status' => trim((string) ($body['status'] ?? 'Pending')),
        ':updated_at' => medserve_now(),
        ':id' => (int) $matches[1],
    ]);
    medserve_json(['message' => 'Order status updated successfully.']);
}

if ($path === '/api/admin/prescriptions' && $method === 'GET') {
    medserve_require_permission($medservePdo, 'prescriptions.view');
    $rows = medserve_query_all($medservePdo, 'SELECT p.*, u.first_name, u.last_name, reviewer.first_name AS reviewer_first_name, reviewer.last_name AS reviewer_last_name FROM prescriptions p JOIN users u ON u.id = p.user_id LEFT JOIN users reviewer ON reviewer.id = p.reviewed_by ORDER BY p.created_at DESC');
    medserve_json(['prescriptions' => array_map('medserve_format_prescription', $rows)]);
}

if (preg_match('#^/api/admin/prescriptions/(\d+)$#', $path, $matches) && $method === 'PUT') {
    medserve_require_permission($medservePdo, 'prescriptions.update');
    $body = medserve_body();
    $medservePdo->prepare('UPDATE prescriptions SET status = :status, pharmacist_notes = :pharmacist_notes, clarification_message = :clarification_message, updated_at = :updated_at WHERE id = :id')->execute([
        ':status' => trim((string) ($body['status'] ?? 'Under Review')),
        ':pharmacist_notes' => trim((string) ($body['pharmacistNotes'] ?? '')),
        ':clarification_message' => trim((string) ($body['clarificationMessage'] ?? '')),
        ':updated_at' => medserve_now(),
        ':id' => (int) $matches[1],
    ]);
    medserve_json(['message' => 'Prescription updated successfully.']);
}

if ($path === '/api/admin/customers' && $method === 'GET') {
    medserve_require_permission($medservePdo, 'customers.view');
    $search = trim((string) ($_GET['search'] ?? ''));
    $sql = "SELECT id, first_name, last_name, email, phone, created_at FROM users WHERE role = 'customer'";
    $params = [];
    if ($search !== '') {
        $sql .= ' AND (first_name LIKE :search OR last_name LIKE :search OR email LIKE :search)';
        $params[':search'] = '%' . $search . '%';
    }
    $sql .= ' ORDER BY created_at DESC';
    medserve_json(['customers' => medserve_query_all($medservePdo, $sql, $params)]);
}

if ($path === '/api/admin/inventory' && $method === 'GET') {
    medserve_require_permission($medservePdo, 'inventory.view');
    $rows = medserve_query_all($medservePdo, 'SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.stock_quantity ASC, p.name ASC');
    medserve_json(['inventory' => array_map('medserve_format_product', $rows)]);
}

if ($path === '/api/admin/content' && $method === 'GET') {
    medserve_require_permission($medservePdo, 'content.view');
    $rows = medserve_query_all($medservePdo, 'SELECT section_key, value_json, updated_at FROM cms_sections ORDER BY section_key ASC');
    medserve_json(['sections' => array_map(static fn(array $row) => [
        'key' => $row['section_key'],
        'value' => json_decode($row['value_json'], true) ?? [],
        'updatedAt' => $row['updated_at'],
    ], $rows)]);
}

if (preg_match('#^/api/admin/content/([^/]+)$#', $path, $matches) && $method === 'PUT') {
    medserve_require_permission($medservePdo, 'content.update');
    $body = medserve_body();
    $existing = medserve_query_one($medservePdo, 'SELECT id FROM cms_sections WHERE section_key = :section_key', [':section_key' => $matches[1]]);
    $sql = $existing
        ? 'UPDATE cms_sections SET value_json = :value_json, updated_at = :updated_at WHERE section_key = :section_key'
        : 'INSERT INTO cms_sections (section_key, value_json, updated_at) VALUES (:section_key, :value_json, :updated_at)';
    $medservePdo->prepare($sql)->execute([
        ':value_json' => json_encode($body['value'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ':updated_at' => medserve_now(),
        ':section_key' => $matches[1],
    ]);
    medserve_json(['message' => 'Content updated successfully.']);
}

if ($path === '/api/admin/users' && $method === 'GET') {
    medserve_require_permission($medservePdo, 'users.view');
    medserve_json(['users' => medserve_query_all($medservePdo, 'SELECT id, first_name, last_name, email, phone, role, created_at FROM users ORDER BY role ASC, created_at DESC')]);
}

if ($path === '/api/admin/reports' && $method === 'GET') {
    medserve_require_permission($medservePdo, 'reports.view');
    medserve_json([
        'orderStatuses' => medserve_query_all($medservePdo, 'SELECT status, COUNT(*) AS total FROM orders GROUP BY status ORDER BY total DESC'),
        'prescriptionStatuses' => medserve_query_all($medservePdo, 'SELECT status, COUNT(*) AS total FROM prescriptions GROUP BY status ORDER BY total DESC'),
    ]);
}
