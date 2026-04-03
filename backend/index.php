<?php
declare(strict_types=1);

require_once __DIR__ . '/routes-public.php';
require_once __DIR__ . '/routes-auth-account.php';
require_once __DIR__ . '/routes-pharmacist.php';
require_once __DIR__ . '/routes-admin.php';

medserve_json(['error' => 'Route not found.'], 404);
