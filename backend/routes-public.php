<?php
declare(strict_types=1);

require_once __DIR__ . '/init.php';

$path = medserve_request_path();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if (str_starts_with($path, '/files/')) {
    $relative = substr($path, 7);
    $fullPath = medserve_storage_path('uploads' . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relative));
    if (!is_file($fullPath)) {
        http_response_code(404);
        exit('File not found');
    }

    header('Content-Type: ' . (mime_content_type($fullPath) ?: 'application/octet-stream'));
    readfile($fullPath);
    exit;
}

if ($path === '/api/sync/revisions' && $method === 'GET') {
    medserve_json([
        'revisions' => medserve_get_revisions($medservePdo),
        'serverTime' => medserve_now(),
    ]);
}

if ($path === '/api/bootstrap' && $method === 'GET') {
    $categories = medserve_query_all($medservePdo, 'SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1 GROUP BY c.id ORDER BY c.sort_order ASC');
    $featured = medserve_query_all($medservePdo, 'SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.is_active = 1 ORDER BY p.stock_quantity DESC, p.created_at DESC LIMIT 6');

    medserve_json([
        'user' => medserve_current_user($medservePdo),
        'csrfToken' => $_SESSION['csrf_token'] ?? '',
        'site' => medserve_cms($medservePdo, 'site'),
        'navigation' => medserve_cms($medservePdo, 'navigation'),
        'seo' => medserve_cms($medservePdo, 'seo'),
        'systemText' => medserve_cms($medservePdo, 'system-text'),
        'homepage' => medserve_cms($medservePdo, 'homepage'),
        'faq' => medserve_cms($medservePdo, 'faq'),
        'categories' => array_map('medserve_format_category', $categories),
        'featuredProducts' => array_map('medserve_format_product', $featured),
    ]);
}

if ($path === '/api/categories' && $method === 'GET') {
    $rows = medserve_query_all($medservePdo, 'SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1 GROUP BY c.id ORDER BY c.sort_order ASC');
    medserve_json(['categories' => array_map('medserve_format_category', $rows)]);
}

if ($path === '/api/products' && $method === 'GET') {
    $search = trim((string) ($_GET['search'] ?? ''));
    $category = trim((string) ($_GET['category'] ?? ''));
    $availability = trim((string) ($_GET['availability'] ?? ''));
    $prescription = trim((string) ($_GET['prescription'] ?? ''));
    $sort = trim((string) ($_GET['sort'] ?? 'relevance'));

    $sql = 'SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.is_active = 1';
    $params = [];

    if ($search !== '') {
        $sql .= ' AND (p.name LIKE :search OR p.brand LIKE :search OR p.description LIKE :search)';
        $params[':search'] = '%' . $search . '%';
    }
    if ($category !== '' && $category !== 'all') {
        $sql .= ' AND c.slug = :category';
        $params[':category'] = $category;
    }
    if ($availability === 'in-stock') {
        $sql .= ' AND p.stock_quantity > 0';
    } elseif ($availability === 'low-stock') {
        $sql .= ' AND p.stock_quantity BETWEEN 1 AND 11';
    }
    if ($prescription === 'required') {
        $sql .= ' AND p.prescription_required = 1';
    } elseif ($prescription === 'otc') {
        $sql .= ' AND p.prescription_required = 0';
    }

    $orderBy = match ($sort) {
        'price-low' => 'p.price ASC',
        'price-high' => 'p.price DESC',
        'name' => 'p.name ASC',
        default => 'p.prescription_required ASC, p.stock_quantity > 0 DESC, p.name ASC',
    };
    $sql .= " ORDER BY {$orderBy}";

    medserve_json(['products' => array_map('medserve_format_product', medserve_query_all($medservePdo, $sql, $params))]);
}

if (preg_match('#^/api/products/([^/]+)$#', $path, $matches) && $method === 'GET') {
    $product = medserve_query_one(
        $medservePdo,
        'SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.slug = :slug LIMIT 1',
        [':slug' => $matches[1]]
    );

    if (!$product) {
        medserve_json(['error' => 'Product not found.'], 404);
    }

    $related = medserve_query_all(
        $medservePdo,
        'SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.category_id = :category_id AND p.id != :id AND p.is_active = 1 LIMIT 4',
        [':category_id' => $product['category_id'], ':id' => $product['id']]
    );

    medserve_json([
        'product' => medserve_format_product($product),
        'relatedProducts' => array_map('medserve_format_product', $related),
    ]);
}
