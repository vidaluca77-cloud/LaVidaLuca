<?php
/**
 * Configuration template for Mollie integration
 * Copy this file to config.php and update with your settings
 */

return [
    // Mollie API configuration
    'mollie' => [
        'api_key' => getenv('MOLLIE_API_KEY') ?: 'test_dHar4XY7LxsDOtmnkVtjNVWXLSlXsM', // Replace with your Mollie API key
        'test_mode' => true, // Set to false for production
    ],
    
    // URLs configuration
    'urls' => [
        'base_url' => 'https://your-domain.com', // Your website domain
        'return_url' => 'https://your-domain.com/donation-success.html',
        'webhook_url' => 'https://your-domain.com/webhook.php',
        'cancel_url' => 'https://your-domain.com/dons.html',
    ],
    
    // Zapier integration configuration
    'zapier' => [
        'enabled' => true, // Set to true to use Zapier for form submissions
        'webhook_url' => '', // Your Zapier webhook URL for donation forms
        'fallback_to_mollie' => true, // Use Mollie integration as fallback if Zapier fails
    ],
    
    // Organization details
    'organization' => [
        'name' => 'La Vida Luca',
        'email' => 'contact@lavidaluca.org',
        'siret' => '99041389000015',
    ],
    
    // Email configuration (optional)
    'email' => [
        'enabled' => false,
        'smtp_host' => '',
        'smtp_port' => 587,
        'smtp_username' => '',
        'smtp_password' => '',
        'from_email' => 'contact@lavidaluca.org',
        'from_name' => 'La Vida Luca',
    ],
    
    // Logging
    'logging' => [
        'donations_file' => 'donations.log',
        'errors_file' => 'webhook_errors.log',
        'receipts_file' => 'receipts.log',
    ],
];
?>