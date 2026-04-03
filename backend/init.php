<?php
declare(strict_types=1);

require_once __DIR__ . '/schema.php';

ini_set('display_errors', '0');
error_reporting(E_ALL);
set_exception_handler(static function (Throwable $throwable): void {
    error_log($throwable->getMessage());
    medserve_json(['error' => 'The server could not complete that request right now.'], 500);
});

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && preg_match('#^https?://(127\.0\.0\.1|localhost)(:\d+)?$#', $origin)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

medserve_set_security_headers();
medserve_start_session();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

medserve_require_csrf();

$medservePdo = medserve_db();
medserve_ensure_schema($medservePdo);

function medserve_request_path(): string
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    return rtrim($path, '/') ?: '/';
}
