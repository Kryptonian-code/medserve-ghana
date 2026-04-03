<?php
declare(strict_types=1);

require_once __DIR__ . '/init.php';

$path = medserve_request_path();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($path === '/api/auth/session' && $method === 'GET') {
    medserve_json(['user' => medserve_current_user($medservePdo), 'csrfToken' => $_SESSION['csrf_token'] ?? '']);
}

if ($path === '/api/auth/register' && $method === 'POST') {
    $body = medserve_body();
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');
    $firstName = trim((string) ($body['firstName'] ?? ''));
    $lastName = trim((string) ($body['lastName'] ?? ''));
    $phone = trim((string) ($body['phone'] ?? ''));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        medserve_json(['error' => 'Please enter a valid email address.'], 422);
    }
    if ($firstName === '' || $lastName === '') {
        medserve_json(['error' => 'Please enter your full name before creating your account.'], 422);
    }
    if (strlen($password) < 8) {
        medserve_json(['error' => 'Password must be at least 8 characters long.'], 422);
    }
    if (medserve_query_one($medservePdo, 'SELECT id FROM users WHERE email = :email', [':email' => $email])) {
        medserve_json(['error' => 'An account with that email address already exists.'], 409);
    }

    $stmt = $medservePdo->prepare('INSERT INTO users (email, password_hash, first_name, last_name, phone, role, created_at, updated_at) VALUES (:email, :password_hash, :first_name, :last_name, :phone, :role, :created_at, :updated_at)');
    $timestamp = medserve_now();
    $stmt->execute([
        ':email' => $email,
        ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ':first_name' => $firstName,
        ':last_name' => $lastName,
        ':phone' => $phone,
        ':role' => 'customer',
        ':created_at' => $timestamp,
        ':updated_at' => $timestamp,
    ]);

    $_SESSION['user_id'] = (int) $medservePdo->lastInsertId();
    session_regenerate_id(true);
    medserve_json(['message' => 'Account created successfully.', 'user' => medserve_current_user($medservePdo), 'csrfToken' => $_SESSION['csrf_token'] ?? ''], 201);
}

if ($path === '/api/auth/login' && $method === 'POST') {
    $body = medserve_body();
    $email = strtolower(trim((string) ($body['email'] ?? '')));
    $password = (string) ($body['password'] ?? '');

    medserve_guard_login_attempt($email);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        medserve_json(['error' => 'Please enter a valid email address.'], 422);
    }

    $user = medserve_query_one($medservePdo, 'SELECT * FROM users WHERE email = :email', [':email' => $email]);
    if (!$user || !password_verify($password, $user['password_hash'])) {
        medserve_record_login_attempt($email, false);
        medserve_json(['error' => 'Email address or password is incorrect.'], 401);
    }

    $_SESSION['user_id'] = (int) $user['id'];
    session_regenerate_id(true);
    medserve_record_login_attempt($email, true);
    medserve_json(['message' => 'Signed in successfully.', 'user' => medserve_current_user($medservePdo), 'csrfToken' => $_SESSION['csrf_token'] ?? '']);
}

if ($path === '/api/auth/logout' && $method === 'POST') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool) ($params['secure'] ?? false), (bool) ($params['httponly'] ?? false));
    }
    session_destroy();
    medserve_json(['message' => 'Signed out successfully.']);
}

if ($path === '/api/dashboard/customer' && $method === 'GET') {
    $user = medserve_require_auth($medservePdo);
    $orders = medserve_query_all($medservePdo, 'SELECT o.*, u.first_name, u.last_name FROM orders o JOIN users u ON u.id = o.user_id WHERE o.user_id = :user_id ORDER BY o.created_at DESC LIMIT 4', [':user_id' => $user['id']]);
    $prescriptions = medserve_query_all($medservePdo, 'SELECT p.*, reviewer.first_name AS reviewer_first_name, reviewer.last_name AS reviewer_last_name FROM prescriptions p LEFT JOIN users reviewer ON reviewer.id = p.reviewed_by WHERE p.user_id = :user_id ORDER BY p.created_at DESC LIMIT 4', [':user_id' => $user['id']]);
    $addresses = medserve_query_all($medservePdo, 'SELECT * FROM addresses WHERE user_id = :user_id ORDER BY is_default DESC, created_at DESC', [':user_id' => $user['id']]);
    $suggested = medserve_query_all($medservePdo, 'SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.is_active = 1 ORDER BY p.created_at DESC LIMIT 4');

    medserve_json([
        'summary' => [
            'totalOrders' => count($orders),
            'openPrescriptions' => count(array_filter($prescriptions, static fn(array $row) => in_array($row['status'], ['Submitted', 'Under Review', 'Needs Clarification'], true))),
            'savedAddresses' => count($addresses),
        ],
        'orders' => array_map(fn(array $row) => medserve_format_order($row, $medservePdo), $orders),
        'prescriptions' => array_map('medserve_format_prescription', $prescriptions),
        'addresses' => $addresses,
        'suggestedProducts' => array_map('medserve_format_product', $suggested),
    ]);
}

if ($path === '/api/account/orders' && $method === 'GET') {
    $user = medserve_require_auth($medservePdo);
    $rows = medserve_query_all($medservePdo, 'SELECT o.*, u.first_name, u.last_name FROM orders o JOIN users u ON u.id = o.user_id WHERE o.user_id = :user_id ORDER BY o.created_at DESC', [':user_id' => $user['id']]);
    medserve_json(['orders' => array_map(fn(array $row) => medserve_format_order($row, $medservePdo), $rows)]);
}

if ($path === '/api/account/prescriptions' && $method === 'GET') {
    $user = medserve_require_auth($medservePdo);
    $rows = medserve_query_all($medservePdo, 'SELECT p.*, reviewer.first_name AS reviewer_first_name, reviewer.last_name AS reviewer_last_name FROM prescriptions p LEFT JOIN users reviewer ON reviewer.id = p.reviewed_by WHERE p.user_id = :user_id ORDER BY p.created_at DESC', [':user_id' => $user['id']]);
    medserve_json(['prescriptions' => array_map('medserve_format_prescription', $rows)]);
}

if ($path === '/api/account/profile' && $method === 'GET') {
    medserve_json(['user' => medserve_require_auth($medservePdo)]);
}

if ($path === '/api/account/profile' && $method === 'PUT') {
    $user = medserve_require_auth($medservePdo);
    $body = medserve_body();

    $firstName = trim((string) ($body['firstName'] ?? ''));
    $lastName = trim((string) ($body['lastName'] ?? ''));
    if ($firstName === '' || $lastName === '') {
        medserve_json(['error' => 'Please enter your full name before saving changes.'], 422);
    }

    $stmt = $medservePdo->prepare('UPDATE users SET first_name = :first_name, last_name = :last_name, phone = :phone, updated_at = :updated_at WHERE id = :id');
    $stmt->execute([
        ':first_name' => $firstName,
        ':last_name' => $lastName,
        ':phone' => trim((string) ($body['phone'] ?? '')),
        ':updated_at' => medserve_now(),
        ':id' => $user['id'],
    ]);

    medserve_bump_revisions($medservePdo, ['customer']);
    medserve_json(['message' => 'Changes saved successfully.', 'user' => medserve_current_user($medservePdo)]);
}

if ($path === '/api/account/addresses' && $method === 'GET') {
    $user = medserve_require_auth($medservePdo);
    $rows = medserve_query_all($medservePdo, 'SELECT * FROM addresses WHERE user_id = :user_id ORDER BY is_default DESC, created_at DESC', [':user_id' => $user['id']]);
    medserve_json(['addresses' => $rows]);
}

if ($path === '/api/account/addresses' && $method === 'POST') {
    $user = medserve_require_auth($medservePdo);
    $body = medserve_body();

    $recipientName = trim((string) ($body['recipientName'] ?? ''));
    $phone = trim((string) ($body['phone'] ?? ''));
    $line1 = trim((string) ($body['line1'] ?? ''));
    $area = trim((string) ($body['area'] ?? ''));
    if ($recipientName === '' || $phone === '' || $line1 === '' || $area === '') {
        medserve_json(['error' => 'Please complete the delivery address before saving.'], 422);
    }

    $isDefault = !empty($body['isDefault']) ? 1 : 0;
    if ($isDefault === 1) {
        $medservePdo->prepare('UPDATE addresses SET is_default = 0 WHERE user_id = :user_id')->execute([':user_id' => $user['id']]);
    }

    $stmt = $medservePdo->prepare('INSERT INTO addresses (user_id, label, recipient_name, phone, line1, line2, area, city, landmark, is_default, created_at, updated_at) VALUES (:user_id, :label, :recipient_name, :phone, :line1, :line2, :area, :city, :landmark, :is_default, :created_at, :updated_at)');
    $timestamp = medserve_now();
    $stmt->execute([
        ':user_id' => $user['id'],
        ':label' => trim((string) ($body['label'] ?? 'Address')) ?: 'Address',
        ':recipient_name' => $recipientName,
        ':phone' => $phone,
        ':line1' => $line1,
        ':line2' => trim((string) ($body['line2'] ?? '')),
        ':area' => $area,
        ':city' => trim((string) ($body['city'] ?? 'Accra')),
        ':landmark' => trim((string) ($body['landmark'] ?? '')),
        ':is_default' => $isDefault,
        ':created_at' => $timestamp,
        ':updated_at' => $timestamp,
    ]);

    medserve_bump_revisions($medservePdo, ['customer']);
    medserve_json(['message' => 'Address saved successfully.'], 201);
}

if (preg_match('#^/api/account/addresses/(\d+)$#', $path, $matches) && $method === 'PUT') {
    $user = medserve_require_auth($medservePdo);
    $body = medserve_body();
    $id = (int) $matches[1];
    $address = medserve_query_one($medservePdo, 'SELECT * FROM addresses WHERE id = :id AND user_id = :user_id', [':id' => $id, ':user_id' => $user['id']]);
    if (!$address) {
        medserve_json(['error' => 'Address not found.'], 404);
    }

    $isDefault = !empty($body['isDefault']) ? 1 : 0;
    if ($isDefault === 1) {
        $medservePdo->prepare('UPDATE addresses SET is_default = 0 WHERE user_id = :user_id')->execute([':user_id' => $user['id']]);
    }

    $stmt = $medservePdo->prepare('UPDATE addresses SET label = :label, recipient_name = :recipient_name, phone = :phone, line1 = :line1, line2 = :line2, area = :area, city = :city, landmark = :landmark, is_default = :is_default, updated_at = :updated_at WHERE id = :id');
    $stmt->execute([
        ':label' => trim((string) ($body['label'] ?? 'Address')) ?: 'Address',
        ':recipient_name' => trim((string) ($body['recipientName'] ?? '')),
        ':phone' => trim((string) ($body['phone'] ?? '')),
        ':line1' => trim((string) ($body['line1'] ?? '')),
        ':line2' => trim((string) ($body['line2'] ?? '')),
        ':area' => trim((string) ($body['area'] ?? '')),
        ':city' => trim((string) ($body['city'] ?? 'Accra')),
        ':landmark' => trim((string) ($body['landmark'] ?? '')),
        ':is_default' => $isDefault,
        ':updated_at' => medserve_now(),
        ':id' => $id,
    ]);

    medserve_bump_revisions($medservePdo, ['customer']);
    medserve_json(['message' => 'Address updated successfully.']);
}

if (preg_match('#^/api/account/addresses/(\d+)$#', $path, $matches) && $method === 'DELETE') {
    $user = medserve_require_auth($medservePdo);
    $medservePdo->prepare('DELETE FROM addresses WHERE id = :id AND user_id = :user_id')->execute([':id' => (int) $matches[1], ':user_id' => $user['id']]);
    medserve_bump_revisions($medservePdo, ['customer']);
    medserve_json(['message' => 'Address deleted successfully.']);
}

if ($path === '/api/orders' && $method === 'POST') {
    $user = medserve_require_auth($medservePdo);
    $body = medserve_body();
    $items = $body['items'] ?? [];
    if (!is_array($items) || count($items) === 0) {
        medserve_json(['error' => 'Add at least one item before placing your order.'], 422);
    }

    $phone = trim((string) ($body['phone'] ?? ''));
    if ($phone === '') {
        medserve_json(['error' => 'Phone number is required.'], 422);
    }

    $subtotal = 0.0;
    $lineItems = [];
    foreach ($items as $item) {
        $productId = (int) ($item['id'] ?? 0);
        $quantity = max(1, (int) ($item['quantity'] ?? 1));
        $product = medserve_query_one($medservePdo, 'SELECT * FROM products WHERE id = :id', [':id' => $productId]);
        if (!$product) {
            medserve_json(['error' => 'One of the selected products could not be found.'], 404);
        }

        $total = $quantity * (float) $product['price'];
        $subtotal += $total;
        $lineItems[] = [$product, $quantity, $total];
    }

    $fulfilmentType = ($body['fulfilmentType'] ?? 'delivery') === 'pickup' ? 'pickup' : 'delivery';
    $deliveryFee = $fulfilmentType === 'delivery' ? ($subtotal >= 100 ? 0 : 15) : 0;
    $containsPrescription = array_reduce($lineItems, static fn(bool $carry, array $line) => $carry || (bool) $line[0]['prescription_required'], false);
    $status = $containsPrescription ? 'Awaiting Prescription Review' : 'Pending';

    $orderStmt = $medservePdo->prepare('INSERT INTO orders (order_number, user_id, status, fulfilment_type, subtotal, delivery_fee, total, delivery_address_snapshot, phone, notes, created_at, updated_at) VALUES (:order_number, :user_id, :status, :fulfilment_type, :subtotal, :delivery_fee, :total, :delivery_address_snapshot, :phone, :notes, :created_at, :updated_at)');
    $timestamp = medserve_now();
    $orderStmt->execute([
        ':order_number' => 'MSG-' . date('ymd') . '-' . random_int(100, 999),
        ':user_id' => $user['id'],
        ':status' => $status,
        ':fulfilment_type' => $fulfilmentType,
        ':subtotal' => $subtotal,
        ':delivery_fee' => $deliveryFee,
        ':total' => $subtotal + $deliveryFee,
        ':delivery_address_snapshot' => json_encode($body['address'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ':phone' => $phone,
        ':notes' => trim((string) ($body['notes'] ?? '')),
        ':created_at' => $timestamp,
        ':updated_at' => $timestamp,
    ]);

    $orderId = (int) $medservePdo->lastInsertId();
    $itemStmt = $medservePdo->prepare('INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES (:order_id, :product_id, :product_name, :quantity, :unit_price, :total_price)');
    foreach ($lineItems as [$product, $quantity, $total]) {
        $itemStmt->execute([
            ':order_id' => $orderId,
            ':product_id' => $product['id'],
            ':product_name' => $product['name'],
            ':quantity' => $quantity,
            ':unit_price' => $product['price'],
            ':total_price' => $total,
        ]);
    }

    medserve_bump_revisions($medservePdo, ['customer', 'admin']);
    medserve_json(['message' => 'Order placed successfully.', 'orderId' => $orderId], 201);
}

if ($path === '/api/prescriptions' && $method === 'POST') {
    $user = medserve_require_auth($medservePdo);
    $patientName = trim((string) ($_POST['patientName'] ?? ''));
    $phone = trim((string) ($_POST['phone'] ?? ''));
    if ($patientName === '') {
        medserve_json(['error' => 'Patient name is required.'], 422);
    }
    if ($phone === '') {
        medserve_json(['error' => 'Phone number is required.'], 422);
    }

    $filePath = medserve_save_upload('file', 'prescriptions');
    if (!$filePath) {
        medserve_json(['error' => 'Please upload a prescription file before submitting.'], 422);
    }

    $stmt = $medservePdo->prepare('INSERT INTO prescriptions (reference, user_id, patient_name, phone, file_path, notes, fulfilment_type, status, created_at, updated_at) VALUES (:reference, :user_id, :patient_name, :phone, :file_path, :notes, :fulfilment_type, :status, :created_at, :updated_at)');
    $timestamp = medserve_now();
    $stmt->execute([
        ':reference' => 'RX-' . date('ymd') . '-' . random_int(100, 999),
        ':user_id' => $user['id'],
        ':patient_name' => $patientName,
        ':phone' => $phone,
        ':file_path' => $filePath,
        ':notes' => trim((string) ($_POST['notes'] ?? '')),
        ':fulfilment_type' => ($_POST['fulfilmentType'] ?? 'delivery') === 'pickup' ? 'pickup' : 'delivery',
        ':status' => 'Submitted',
        ':created_at' => $timestamp,
        ':updated_at' => $timestamp,
    ]);

    medserve_bump_revisions($medservePdo, ['customer', 'pharmacist', 'admin']);
    medserve_json(['message' => 'Prescription submitted successfully.'], 201);
}
