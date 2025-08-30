<?php
/**
 * Simple Donor Information Handler for La Vida Luca
 * Handles donor information collection for fiscal receipts
 */

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers for frontend integration
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Handle POST request only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['firstname', 'lastname', 'email', 'address', 'postal', 'city', 'amount'];
foreach ($required_fields as $field) {
    if (!isset($input[$field]) || empty(trim($input[$field]))) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required field: ' . $field]);
        exit;
    }
}

// Sanitize and validate amount
$amount = floatval($input['amount']);
if ($amount < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'Amount must be at least 1 euro']);
    exit;
}

// Prepare donor data
$donorData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'firstname' => trim($input['firstname']),
    'lastname' => trim($input['lastname']),
    'email' => trim($input['email']),
    'phone' => trim($input['phone'] ?? ''),
    'address' => trim($input['address']),
    'postal' => trim($input['postal']),
    'city' => trim($input['city']),
    'amount' => $amount,
    'newsletter' => isset($input['newsletter']) && $input['newsletter'],
    'message' => trim($input['message'] ?? ''),
];

// Log the donor information for processing
$logEntry = date('Y-m-d H:i:s') . " - " . json_encode($donorData) . "\n";
file_put_contents('donor_receipts.log', $logEntry, FILE_APPEND | LOCK_EX);

// Send email notification (if configured)
$emailSent = false;
if (function_exists('mail')) {
    $subject = 'Nouvelle demande de reçu fiscal - La Vida Luca';
    $message = "Nouvelle demande de reçu fiscal:\n\n";
    $message .= "Nom: {$donorData['firstname']} {$donorData['lastname']}\n";
    $message .= "Email: {$donorData['email']}\n";
    $message .= "Téléphone: {$donorData['phone']}\n";
    $message .= "Adresse: {$donorData['address']}\n";
    $message .= "Code postal: {$donorData['postal']}\n";
    $message .= "Ville: {$donorData['city']}\n";
    $message .= "Montant: {$donorData['amount']}€\n";
    $message .= "Newsletter: " . ($donorData['newsletter'] ? 'Oui' : 'Non') . "\n";
    $message .= "Message: {$donorData['message']}\n";
    $message .= "Date: {$donorData['timestamp']}\n";
    
    $headers = "From: noreply@lavidaluca.org\r\n";
    $headers .= "Reply-To: {$donorData['email']}\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    $emailSent = mail('vidaluca77@gmail.com', $subject, $message, $headers);
}

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Demande de reçu fiscal enregistrée avec succès',
    'email_sent' => $emailSent,
    'donor_id' => md5($donorData['email'] . $donorData['timestamp'])
]);
?>