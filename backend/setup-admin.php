<?php
declare(strict_types=1);

require_once __DIR__ . '/schema.php';

$email = $argv[1] ?? null;
$password = $argv[2] ?? null;
$firstName = $argv[3] ?? 'Site';
$lastName = $argv[4] ?? 'Administrator';
$role = $argv[5] ?? 'super_admin';

if (!$email || !$password) {
    fwrite(STDERR, "Usage: php backend/setup-admin.php <email> <password> [firstName] [lastName] [role]\n");
    exit(1);
}

$pdo = medserve_db();
medserve_ensure_schema($pdo);

$existing = medserve_query_one($pdo, 'SELECT id FROM users WHERE email = :email', [':email' => strtolower($email)]);
if ($existing) {
    fwrite(STDERR, "An account with that email address already exists.\n");
    exit(1);
}

$stmt = $pdo->prepare('INSERT INTO users (email, password_hash, first_name, last_name, phone, role, created_at, updated_at) VALUES (:email, :password_hash, :first_name, :last_name, :phone, :role, :created_at, :updated_at)');
$timestamp = medserve_now();
$stmt->execute([
    ':email' => strtolower($email),
    ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
    ':first_name' => $firstName,
    ':last_name' => $lastName,
    ':phone' => null,
    ':role' => $role,
    ':created_at' => $timestamp,
    ':updated_at' => $timestamp,
]);

fwrite(STDOUT, "Administrator account created successfully.\n");
