# Simplified Mollie Payment Links System - La Vida Luca

## Overview

This implementation replaces the previous complex payment system (Zapier + Mollie fallback) with a simple, direct Mollie payment links approach as requested.

## Changes Made

### 1. Simplified Payment Flow
- **Before**: Form → donation_handler.php → Zapier → Mollie fallback
- **After**: Direct payment links → Mollie payment pages

### 2. Payment Links Implemented

All payment links use the provided Mollie URLs:

| Amount | Description | Mollie Payment Link |
|---------|------------|-------------------|
| 20€ | Don rapide | https://payment-links.mollie.com/payment/WKxAUZtr5qRNxefBSovCK |
| 50€ | Soutien mensuel | https://payment-links.mollie.com/payment/fa8cXd9pA8ekvLjKvqqVJ |
| 100€ | Formation jeune | https://payment-links.mollie.com/payment/PQPmUdJckVpffkms7DEJj |
| 200€ | Équipement agricole | https://payment-links.mollie.com/payment/wfugvBizSeNpVTdYctJEc |
| 500€ | Mécénat projet | https://payment-links.mollie.com/payment/hVfF4m25HNBbyjyhcKhd3 |
| Libre | À votre choix | https://payment-links.mollie.com/payment/vvUKyVr5VPLHMnJZx96fZ |

### 3. Donor Information Collection

Added an optional fiscal receipt request system:
- **File**: `donor_info_handler.php` - Processes receipt requests
- **Form**: Simple contact form for donors who want fiscal receipts
- **Logging**: Creates `donor_receipts.log` for processing

### 4. Files Modified

- `dons.html` - Updated donation page with payment buttons
- `script.js` - Simplified JavaScript (removed complex payment processing)
- `donor_info_handler.php` - New handler for fiscal receipt requests
- `.gitignore` - Added donor receipts log exclusion

### 5. Files No Longer Needed

The following files are now legacy but kept for compatibility:
- `donation_handler.php` - Complex Zapier/Mollie handler
- `process_payment.php` - Original Mollie API integration

## Benefits

1. **Simplicity**: One-click donations without form submission
2. **Reliability**: Direct Mollie integration, no server-side processing needed
3. **User Experience**: Immediate redirection to secure payment
4. **Maintenance**: Reduced server complexity and dependencies
5. **Donor Information**: Still captured through optional receipt form

## How It Works

1. **User visits donation page** → Sees colorful payment buttons
2. **Clicks desired amount** → Redirected to Mollie payment page
3. **Completes payment** → Mollie handles the transaction
4. **Optional**: User can fill receipt form for fiscal deduction

## Technical Notes

- All payment links are external to Mollie's system
- No server-side payment processing required
- Donor information collection is now optional and separate
- Maintains fiscal receipt capability through separate form
- All existing features preserved (tax information, contact options, etc.)

## Security

- Payment processing entirely handled by Mollie (PCI compliant)
- No sensitive payment data stored on server
- Donor information only collected when explicitly requested
- Standard form validation and sanitization in receipt handler

## Testing

The implementation has been tested and verified:
- ✅ Payment links redirect correctly to Mollie
- ✅ Form submission works for fiscal receipts
- ✅ UI displays properly on different screen sizes
- ✅ JavaScript handles form validation correctly