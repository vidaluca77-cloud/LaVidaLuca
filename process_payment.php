<?php
/**
 * Mollie Payment Integration for La Vida Luca
 * Handles donation payment processing
 */

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers for frontend integration
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Configuration
$config = [
    'mollie_api_key' => getenv('MOLLIE_API_KEY') ?: 'test_dHar4XY7LxsDOtmnkVtjNVWXLSlXsM', // Test key - replace with live key
    'return_url' => 'https://your-domain.com/donation-success.html',
    'webhook_url' => 'https://your-domain.com/webhook.php',
    'redirect_url' => 'https://your-domain.com/dons.html'
];

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['amount']) || !isset($input['email']) || !isset($input['firstname']) || !isset($input['lastname'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Sanitize and validate amount
$amount = floatval($input['amount']);
if ($amount < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'Amount must be at least 1 euro']);
    exit;
}

// Prepare payment data
$paymentData = [
    'amount' => [
        'currency' => 'EUR',
        'value' => number_format($amount, 2, '.', '')
    ],
    'description' => 'Don pour La Vida Luca - ' . $input['firstname'] . ' ' . $input['lastname'],
    'redirectUrl' => $config['return_url'],
    'webhookUrl' => $config['webhook_url'],
    'metadata' => [
        'donor_email' => $input['email'],
        'donor_name' => $input['firstname'] . ' ' . $input['lastname'],
        'donation_type' => $input['donation_type'] ?? 'ponctuel',
        'message' => $input['message'] ?? '',
        'fiscal_receipt' => $input['fiscal_receipt'] ?? true,
        'anonymous' => $input['anonymous'] ?? false,
        'newsletter' => $input['newsletter'] ?? false
    ]
];

// Create Mollie payment
try {
    $payment = createMolliePayment($paymentData, $config['mollie_api_key']);
    
    if ($payment && isset($payment['_links']['checkout']['href'])) {
        echo json_encode([
            'success' => true,
            'payment_url' => $payment['_links']['checkout']['href'],
            'payment_id' => $payment['id']
        ]);
    } else {
        throw new Exception('Failed to create payment');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Payment creation failed: ' . $e->getMessage()]);
}

/**
 * Create Mollie payment using cURL
 */
function createMolliePayment($paymentData, $apiKey) {
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => 'https://api.mollie.com/v2/payments',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($paymentData),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json'
        ],
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_TIMEOUT => 30
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        throw new Exception('cURL error: ' . curl_error($ch));
    }
    
    curl_close($ch);
    
    if ($httpCode !== 201) {
        throw new Exception('HTTP error: ' . $httpCode . ' - ' . $response);
    }
    
    return json_decode($response, true);
}
?>