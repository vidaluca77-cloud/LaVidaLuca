<?php
/**
 * Training Payment Handler for La Vida Luca
 * Handles training registration payment processing through Mollie
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
        'mollie' => [
            'api_key' => getenv('MOLLIE_API_KEY') ?: 'test_dHar4XY7LxsDOtmnkVtjNVWXLSlXsM',
        ],
        'urls' => [
            'return_url' => 'https://lavidaluca.org/training-success.html',
            'webhook_url' => 'https://lavidaluca.org/webhook.php',
        ],
    ];
}

// Training prices mapping
$trainingPrices = [
    'initiation-bio' => 450,
    'elevage' => 600,
    'precision' => 850,
    'permaculture' => 750,
    'gestion' => 650,
    'insertion' => 0 // Free/sponsored training
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
if (!isset($input['formation']) || !isset($input['email']) || !isset($input['firstname']) || !isset($input['name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Get training price
$formationKey = $input['formation'];
if (!isset($trainingPrices[$formationKey])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid training selection']);
    exit;
}

$amount = $trainingPrices[$formationKey];

// Special handling for insertion training (free/sponsored)
if ($formationKey === 'insertion') {
    // Log the registration without payment
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'type' => 'training_registration',
        'formation' => $formationKey,
        'participant_email' => $input['email'],
        'participant_name' => $input['firstname'] . ' ' . $input['name'],
        'experience' => $input['experience'] ?? '',
        'motivation' => $input['motivation'] ?? '',
        'amount' => 0,
        'status' => 'registered'
    ];
    
    file_put_contents(
        'training_registrations.log',
        json_encode($logData) . "\n",
        FILE_APPEND | LOCK_EX
    );
    
    echo json_encode([
        'success' => true,
        'method' => 'free_registration',
        'message' => 'Inscription enregistrée pour la formation insertion'
    ]);
    exit;
}

// Prepare training data for payment
$trainingData = [
    'amount' => $amount,
    'formation' => $formationKey,
    'firstname' => $input['firstname'],
    'lastname' => $input['name'],
    'email' => $input['email'],
    'experience' => $input['experience'] ?? '',
    'motivation' => $input['motivation'] ?? ''
];

// Create Mollie payment
try {
    $mollieResult = createMolliePayment($trainingData, $config);
    
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
    echo json_encode(['error' => 'Training payment creation failed: ' . $e->getMessage()]);
}

/**
 * Create Mollie payment for training registration
 */
function createMolliePayment($trainingData, $config) {
    $formationNames = [
        'initiation-bio' => 'Initiation à l\'Agriculture Bio',
        'elevage' => 'Élevage et Bien-être Animal',
        'precision' => 'Agriculture de Précision',
        'permaculture' => 'Permaculture Avancée',
        'gestion' => 'Gestion d\'Exploitation'
    ];
    
    $formationName = $formationNames[$trainingData['formation']] ?? $trainingData['formation'];
    
    $paymentData = [
        'amount' => [
            'currency' => 'EUR',
            'value' => number_format($trainingData['amount'], 2, '.', '')
        ],
        'description' => 'Formation ' . $formationName . ' - ' . $trainingData['firstname'] . ' ' . $trainingData['lastname'],
        'redirectUrl' => $config['urls']['training_return_url'] ?? $config['urls']['return_url'],
        'webhookUrl' => $config['urls']['webhook_url'],
        'metadata' => [
            'type' => 'training',
            'formation' => $trainingData['formation'],
            'formation_name' => $formationName,
            'participant_email' => $trainingData['email'],
            'participant_name' => $trainingData['firstname'] . ' ' . $trainingData['lastname'],
            'experience' => $trainingData['experience'],
            'motivation' => $trainingData['motivation']
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
        $error = json_decode($response, true);
        throw new Exception('HTTP error: ' . $httpCode . ' - ' . ($error['detail'] ?? 'Unknown error'));
    }
    
    return json_decode($response, true);
}
?>