<?php
/**
 * Mollie Webhook Handler for La Vida Luca
 * Processes payment status updates
 */

// Enable error logging
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', 'webhook_errors.log');

// Configuration
$config = [
    'mollie_api_key' => getenv('MOLLIE_API_KEY') ?: 'test_dHar4XY7LxsDOtmnkVtjNVWXLSlXsM', // Test key
];

// Handle POST request only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

// Get payment ID from POST data
$paymentId = $_POST['id'] ?? '';

if (empty($paymentId)) {
    http_response_code(400);
    exit('Missing payment ID');
}

try {
    // Retrieve payment status from Mollie
    $payment = getMolliePayment($paymentId, $config['mollie_api_key']);
    
    if (!$payment) {
        throw new Exception('Payment not found');
    }
    
    // Process payment based on status and type
    switch ($payment['status']) {
        case 'paid':
            $metadata = $payment['metadata'] ?? [];
            $paymentType = $metadata['type'] ?? 'donation';
            
            if ($paymentType === 'training') {
                processPaidTraining($payment);
            } else {
                processPaidDonation($payment);
            }
            break;
        case 'failed':
        case 'canceled':
        case 'expired':
            $metadata = $payment['metadata'] ?? [];
            $paymentType = $metadata['type'] ?? 'donation';
            
            if ($paymentType === 'training') {
                processFailedTraining($payment);
            } else {
                processFailedDonation($payment);
            }
            break;
        case 'pending':
        case 'open':
            // Payment is still processing, no action needed
            break;
    }
    
    http_response_code(200);
    echo 'OK';
    
} catch (Exception $e) {
    error_log('Webhook error: ' . $e->getMessage());
    http_response_code(500);
    echo 'Internal server error';
}

/**
 * Retrieve payment from Mollie API
 */
function getMolliePayment($paymentId, $apiKey) {
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => 'https://api.mollie.com/v2/payments/' . $paymentId,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey
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
    
    if ($httpCode !== 200) {
        throw new Exception('HTTP error: ' . $httpCode);
    }
    
    return json_decode($response, true);
}

/**
 * Process successful donation
 */
function processPaidDonation($payment) {
    $metadata = $payment['metadata'] ?? [];
    
    // Log successful donation
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'payment_id' => $payment['id'],
        'amount' => $payment['amount']['value'],
        'currency' => $payment['amount']['currency'],
        'donor_email' => $metadata['donor_email'] ?? '',
        'donor_name' => $metadata['donor_name'] ?? '',
        'donation_type' => $metadata['donation_type'] ?? 'ponctuel',
        'message' => $metadata['message'] ?? '',
        'status' => 'completed'
    ];
    
    // Save to donations log file
    file_put_contents(
        'donations.log',
        json_encode($logData) . "\n",
        FILE_APPEND | LOCK_EX
    );
    
    // Send confirmation email (implementation depends on your email system)
    if (!empty($metadata['donor_email'])) {
        sendDonationConfirmation($metadata, $payment['amount']);
    }
    
    // Generate fiscal receipt if requested
    if (($metadata['fiscal_receipt'] ?? true) && !empty($metadata['donor_email'])) {
        generateFiscalReceipt($metadata, $payment);
    }
}

/**
 * Process failed donation
 */
function processFailedDonation($payment) {
    $metadata = $payment['metadata'] ?? [];
    
    // Log failed donation
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'payment_id' => $payment['id'],
        'amount' => $payment['amount']['value'],
        'donor_email' => $metadata['donor_email'] ?? '',
        'status' => 'failed',
        'failure_reason' => $payment['status']
    ];
    
    file_put_contents(
        'donations.log',
        json_encode($logData) . "\n",
        FILE_APPEND | LOCK_EX
    );
}

/**
 * Send donation confirmation email
 */
function sendDonationConfirmation($metadata, $amount) {
    // This is a placeholder - implement according to your email system
    // You could use PHP's mail() function, PHPMailer, or an email service API
    
    $to = $metadata['donor_email'];
    $subject = 'Confirmation de votre don - La Vida Luca';
    $message = "Bonjour {$metadata['donor_name']},\n\n"
             . "Nous vous remercions pour votre don de {$amount['value']} {$amount['currency']}.\n"
             . "Votre soutien est précieux pour nos actions.\n\n"
             . "Cordialement,\nL'équipe La Vida Luca";
    
    $headers = [
        'From: contact@lavidaluca.org',
        'Reply-To: contact@lavidaluca.org',
        'Content-Type: text/plain; charset=UTF-8'
    ];
    
    // Uncomment to send email
    // mail($to, $subject, $message, implode("\r\n", $headers));
}

/**
 * Generate fiscal receipt
 */
function generateFiscalReceipt($metadata, $payment) {
    // This is a placeholder for fiscal receipt generation
    // You would typically generate a PDF receipt here
    
    $receiptData = [
        'receipt_id' => 'RECU-' . date('Y') . '-' . substr($payment['id'], -8),
        'date' => date('Y-m-d'),
        'donor_name' => $metadata['donor_name'],
        'amount' => $payment['amount']['value'],
        'tax_deduction' => floatval($payment['amount']['value']) * 0.66
    ];
    
    // Save receipt data for later processing
    file_put_contents(
        'receipts.log',
        json_encode($receiptData) . "\n",
        FILE_APPEND | LOCK_EX
    );
}

/**
 * Process successful training payment
 */
function processPaidTraining($payment) {
    $metadata = $payment['metadata'] ?? [];
    
    // Log successful training registration
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'payment_id' => $payment['id'],
        'type' => 'training',
        'formation' => $metadata['formation'] ?? '',
        'formation_name' => $metadata['formation_name'] ?? '',
        'amount' => $payment['amount']['value'],
        'currency' => $payment['amount']['currency'],
        'participant_email' => $metadata['participant_email'] ?? '',
        'participant_name' => $metadata['participant_name'] ?? '',
        'experience' => $metadata['experience'] ?? '',
        'motivation' => $metadata['motivation'] ?? '',
        'status' => 'completed'
    ];
    
    // Save to training registrations log file
    file_put_contents(
        'training_registrations.log',
        json_encode($logData) . "\n",
        FILE_APPEND | LOCK_EX
    );
    
    // Send confirmation email (implementation depends on your email system)
    if (!empty($metadata['participant_email'])) {
        sendTrainingConfirmation($metadata, $payment['amount']);
    }
}

/**
 * Process failed training payment
 */
function processFailedTraining($payment) {
    $metadata = $payment['metadata'] ?? [];
    
    // Log failed training registration
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'payment_id' => $payment['id'],
        'type' => 'training_failed',
        'formation' => $metadata['formation'] ?? '',
        'participant_email' => $metadata['participant_email'] ?? '',
        'participant_name' => $metadata['participant_name'] ?? '',
        'amount' => $payment['amount']['value'],
        'status' => 'failed',
        'reason' => $payment['status']
    ];
    
    // Save to failed registrations log
    file_put_contents(
        'training_failed.log',
        json_encode($logData) . "\n",
        FILE_APPEND | LOCK_EX
    );
}

/**
 * Send training confirmation email (placeholder)
 */
function sendTrainingConfirmation($metadata, $amount) {
    // Placeholder for email sending functionality
    // This would integrate with your email system
    error_log('Training confirmation should be sent to: ' . $metadata['participant_email']);
    error_log('Formation: ' . $metadata['formation_name']);
    error_log('Amount paid: ' . $amount['value'] . ' ' . $amount['currency']);
}
?>