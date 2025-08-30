<?php
/**
 * Donation Handler for La Vida Luca
 * Supports both Zapier integration and direct Mollie processing
 */

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers for frontend integration
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load configuration
$config = [];
if (file_exists('config.php')) {
    $config = require 'config.php';
} else {
    // Fallback configuration
    $config = [
        'zapier' => [
            'enabled' => false,
            'webhook_url' => '',
            'fallback_to_mollie' => true,
        ],
        'mollie' => [
            'api_key' => getenv('MOLLIE_API_KEY') ?: 'test_dHar4XY7LxsDOtmnkVtjNVWXLSlXsM',
        ],
        'urls' => [
            'return_url' => 'https://lavidaluca.org/donation-success.html',
            'webhook_url' => 'https://lavidaluca.org/webhook.php',
        ],
    ];
}

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

// Prepare donation data
$donationData = [
    'amount' => $amount,
    'firstname' => trim($input['firstname']),
    'lastname' => trim($input['lastname']),
    'email' => trim($input['email']),
    'phone' => trim($input['phone'] ?? ''),
    'address' => trim($input['address'] ?? ''),
    'postal' => trim($input['postal'] ?? ''),
    'city' => trim($input['city'] ?? ''),
    'donation_type' => $input['donation_type'] ?? 'ponctuel',
    'message' => trim($input['message'] ?? ''),
    'fiscal_receipt' => $input['fiscal_receipt'] ?? true,
    'anonymous' => $input['anonymous'] ?? false,
    'newsletter' => $input['newsletter'] ?? false,
    'timestamp' => date('Y-m-d H:i:s'),
];

// Try Zapier integration first if enabled
if ($config['zapier']['enabled'] && !empty($config['zapier']['webhook_url'])) {
    try {
        $zapierResult = submitToZapier($donationData, $config['zapier']['webhook_url']);
        
        if ($zapierResult['success']) {
            echo json_encode([
                'success' => true,
                'method' => 'zapier',
                'message' => 'Donation submitted successfully via Zapier',
                'redirect_url' => $zapierResult['redirect_url'] ?? $config['urls']['return_url']
            ]);
            exit;
        } else {
            // Log Zapier failure
            error_log('Zapier submission failed: ' . $zapierResult['error']);
            
            // If fallback is disabled, return error
            if (!$config['zapier']['fallback_to_mollie']) {
                http_response_code(500);
                echo json_encode(['error' => 'Zapier submission failed: ' . $zapierResult['error']]);
                exit;
            }
        }
    } catch (Exception $e) {
        error_log('Zapier exception: ' . $e->getMessage());
        
        // If fallback is disabled, return error
        if (!$config['zapier']['fallback_to_mollie']) {
            http_response_code(500);
            echo json_encode(['error' => 'Zapier submission failed: ' . $e->getMessage()]);
            exit;
        }
    }
}

// Fallback to Mollie integration or direct Mollie if Zapier disabled
try {
    $mollieResult = createMolliePayment($donationData, $config);
    
    if ($mollieResult && isset($mollieResult['_links']['checkout']['href'])) {
        echo json_encode([
            'success' => true,
            'method' => 'mollie',
            'payment_url' => $mollieResult['_links']['checkout']['href'],
            'payment_id' => $mollieResult['id']
        ]);
    } else {
        throw new Exception('Failed to create Mollie payment');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Payment creation failed: ' . $e->getMessage()]);
}

/**
 * Submit donation data to Zapier webhook
 */
function submitToZapier($donationData, $webhookUrl) {
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $webhookUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($donationData),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'User-Agent: LaVidaLuca-DonationForm/1.0'
        ],
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_TIMEOUT => 30
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        curl_close($ch);
        return ['success' => false, 'error' => 'cURL error: ' . curl_error($ch)];
    }
    
    curl_close($ch);
    
    if ($httpCode >= 200 && $httpCode < 300) {
        $responseData = json_decode($response, true);
        return [
            'success' => true,
            'response' => $responseData,
            'redirect_url' => $responseData['redirect_url'] ?? null
        ];
    } else {
        return ['success' => false, 'error' => 'HTTP error: ' . $httpCode];
    }
}

/**
 * Create Mollie payment using cURL
 */
function createMolliePayment($donationData, $config) {
    $paymentData = [
        'amount' => [
            'currency' => 'EUR',
            'value' => number_format($donationData['amount'], 2, '.', '')
        ],
        'description' => 'Don pour La Vida Luca - ' . $donationData['firstname'] . ' ' . $donationData['lastname'],
        'redirectUrl' => $config['urls']['return_url'],
        'webhookUrl' => $config['urls']['webhook_url'],
        'metadata' => [
            'donor_email' => $donationData['email'],
            'donor_name' => $donationData['firstname'] . ' ' . $donationData['lastname'],
            'donation_type' => $donationData['donation_type'],
            'message' => $donationData['message'],
            'fiscal_receipt' => $donationData['fiscal_receipt'],
            'anonymous' => $donationData['anonymous'],
            'newsletter' => $donationData['newsletter']
        ]
    ];

    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => 'https://api.mollie.com/v2/payments',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($paymentData),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $config['mollie']['api_key'],
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