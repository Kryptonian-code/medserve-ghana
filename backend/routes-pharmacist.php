<?php
declare(strict_types=1);

require_once __DIR__ . '/init.php';

$path = medserve_request_path();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($path === '/api/dashboard/pharmacist' && $method === 'GET') {
    medserve_require_permission($medservePdo, 'dashboard.view');

    $pending = medserve_query_all($medservePdo, "SELECT p.*, u.first_name, u.last_name, reviewer.first_name AS reviewer_first_name, reviewer.last_name AS reviewer_last_name FROM prescriptions p JOIN users u ON u.id = p.user_id LEFT JOIN users reviewer ON reviewer.id = p.reviewed_by WHERE p.status IN ('Submitted', 'Under Review', 'Needs Clarification') ORDER BY p.created_at ASC");
    $reviewed = medserve_query_all($medservePdo, "SELECT p.*, u.first_name, u.last_name, reviewer.first_name AS reviewer_first_name, reviewer.last_name AS reviewer_last_name FROM prescriptions p JOIN users u ON u.id = p.user_id LEFT JOIN users reviewer ON reviewer.id = p.reviewed_by WHERE p.status IN ('Approved', 'Rejected', 'Ready for Checkout') ORDER BY p.updated_at DESC LIMIT 5");
    $notes = medserve_query_all($medservePdo, 'SELECT n.*, p.reference FROM pharmacist_notes n LEFT JOIN prescriptions p ON p.id = n.prescription_id ORDER BY n.created_at DESC LIMIT 6');

    medserve_json([
        'summary' => [
            'pendingQueue' => count(array_filter($pending, static fn(array $row) => $row['status'] !== 'Needs Clarification')),
            'needsClarification' => count(array_filter($pending, static fn(array $row) => $row['status'] === 'Needs Clarification')),
            'reviewedToday' => count($reviewed),
        ],
        'queue' => array_map('medserve_format_prescription', $pending),
        'reviewed' => array_map('medserve_format_prescription', $reviewed),
        'notes' => $notes,
    ]);
}

if ($path === '/api/pharmacist/queue' && $method === 'GET') {
    medserve_require_permission($medservePdo, 'prescriptions.view');
    $status = trim((string) ($_GET['status'] ?? ''));
    $search = trim((string) ($_GET['search'] ?? ''));

    $sql = "SELECT p.*, u.first_name, u.last_name, reviewer.first_name AS reviewer_first_name, reviewer.last_name AS reviewer_last_name FROM prescriptions p JOIN users u ON u.id = p.user_id LEFT JOIN users reviewer ON reviewer.id = p.reviewed_by WHERE 1=1";
    $params = [];
    if ($status !== '' && $status !== 'all') {
        $sql .= ' AND p.status = :status';
        $params[':status'] = $status;
    }
    if ($search !== '') {
        $sql .= ' AND (p.patient_name LIKE :search OR p.reference LIKE :search OR u.first_name LIKE :search OR u.last_name LIKE :search)';
        $params[':search'] = '%' . $search . '%';
    }
    $sql .= ' ORDER BY p.created_at ASC';

    medserve_json(['prescriptions' => array_map('medserve_format_prescription', medserve_query_all($medservePdo, $sql, $params))]);
}

if ($path === '/api/pharmacist/reviewed' && $method === 'GET') {
    medserve_require_permission($medservePdo, 'prescriptions.view');
    $rows = medserve_query_all($medservePdo, "SELECT p.*, u.first_name, u.last_name, reviewer.first_name AS reviewer_first_name, reviewer.last_name AS reviewer_last_name FROM prescriptions p JOIN users u ON u.id = p.user_id LEFT JOIN users reviewer ON reviewer.id = p.reviewed_by WHERE p.status IN ('Approved', 'Rejected', 'Ready for Checkout') ORDER BY p.updated_at DESC");
    medserve_json(['prescriptions' => array_map('medserve_format_prescription', $rows)]);
}

if ($path === '/api/pharmacist/notes' && $method === 'GET') {
    medserve_require_permission($medservePdo, 'notes.view');
    $rows = medserve_query_all($medservePdo, 'SELECT n.*, p.reference FROM pharmacist_notes n LEFT JOIN prescriptions p ON p.id = n.prescription_id ORDER BY n.created_at DESC');
    medserve_json(['notes' => $rows]);
}

if ($path === '/api/pharmacist/notes' && $method === 'POST') {
    $user = medserve_require_permission($medservePdo, 'notes.create');
    $body = medserve_body();
    $title = trim((string) ($body['title'] ?? ''));
    $note = trim((string) ($body['note'] ?? ''));

    if ($title === '' || $note === '') {
        medserve_json(['error' => 'Please add a title and note before saving.'], 422);
    }

    $stmt = $medservePdo->prepare('INSERT INTO pharmacist_notes (pharmacist_user_id, prescription_id, title, note, created_at) VALUES (:pharmacist_user_id, :prescription_id, :title, :note, :created_at)');
    $stmt->execute([
        ':pharmacist_user_id' => $user['id'],
        ':prescription_id' => !empty($body['prescriptionId']) ? (int) $body['prescriptionId'] : null,
        ':title' => $title,
        ':note' => $note,
        ':created_at' => medserve_now(),
    ]);

    medserve_json(['message' => 'Note saved successfully.'], 201);
}

if (preg_match('#^/api/pharmacist/prescriptions/(\d+)$#', $path, $matches) && $method === 'PUT') {
    $user = medserve_require_permission($medservePdo, 'prescriptions.update');
    $body = medserve_body();

    $stmt = $medservePdo->prepare('UPDATE prescriptions SET status = :status, pharmacist_notes = :pharmacist_notes, clarification_message = :clarification_message, reviewed_by = :reviewed_by, reviewed_at = :reviewed_at, updated_at = :updated_at WHERE id = :id');
    $stmt->execute([
        ':status' => trim((string) ($body['status'] ?? 'Under Review')),
        ':pharmacist_notes' => trim((string) ($body['pharmacistNotes'] ?? '')),
        ':clarification_message' => trim((string) ($body['clarificationMessage'] ?? '')),
        ':reviewed_by' => $user['id'],
        ':reviewed_at' => medserve_now(),
        ':updated_at' => medserve_now(),
        ':id' => (int) $matches[1],
    ]);

    medserve_json(['message' => 'Prescription updated successfully.']);
}
