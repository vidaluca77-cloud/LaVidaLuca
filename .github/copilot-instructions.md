# La Vida Luca - Agricultural Organization Website

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

La Vida Luca is a French agricultural organization website featuring static HTML/CSS/JavaScript frontend with PHP backend for payment processing, integrated with Netlify CMS for content management.

## Working Effectively

### Initial Setup and Dependencies
- **NEVER CANCEL any commands** - All operations complete in under 30 seconds
- Copy configuration: `cp config.template.php config.php`
- Start development server: `php -S localhost:8000` - NEVER CANCEL, runs immediately
- Validate PHP syntax: `find . -name "*.php" -exec php -l {} \;` - completes in under 1 second
- Test website accessibility: `curl -I http://localhost:8000/` - responds in under 1 second

### Build Process
- **NO BUILD REQUIRED** - This is a static website with PHP backend
- **NO PACKAGE MANAGERS** - No npm, yarn, or other package managers needed
- **NO COMPILATION** - HTML/CSS/JS files are served directly
- The website runs immediately with PHP development server

### Testing and Validation
- **PHP Validation**: `find . -name "*.php" -exec php -l {} \;` - NEVER CANCEL, completes in under 1 second
- **Website Load Test**: `curl -s http://localhost:8000/ && curl -s http://localhost:8000/dons.html && curl -s http://localhost:8000/formations.html` - NEVER CANCEL, completes in under 1 second
- **Payment API Test**: `curl -X POST http://localhost:8000/donation_handler.php -H "Content-Type: application/json" -d '{"amount": 25, "firstname": "Test", "lastname": "User", "email": "test@example.com", "donation_type": "ponctuel", "fiscal_receipt": true}'` - NEVER CANCEL, responds in under 2 seconds
- **Admin Interface Test**: `curl -s http://localhost:8000/admin/ | grep -i netlify` - NEVER CANCEL, completes in under 1 second

## Technology Stack
- **Frontend**: Static HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 8.3+ for payment processing
- **CMS**: Netlify CMS for content management
- **Hosting**: Netlify with Apache .htaccess configuration
- **Payments**: Dual integration - Mollie API + Zapier webhooks

## Repository Structure
```
/
├── index.html              # Main homepage
├── styles.css              # Main stylesheet
├── script.js               # Main JavaScript functionality
├── *.html                  # Static pages (dons, formations, contact, etc.)
├── *.php                   # Payment processing backend
├── admin/                  # Netlify CMS administration
│   ├── index.html          # CMS interface
│   └── config.yml          # CMS configuration
├── _data/                  # Site configuration data
├── _posts/                 # Blog posts (markdown)
├── _projets/               # Project pages (markdown)
├── _formations/            # Training content (markdown)
├── assets/                 # Images and static assets
├── config.template.php     # PHP configuration template
├── .htaccess              # Apache server configuration
├── netlify.toml           # Netlify deployment config
└── manifest.json          # PWA manifest
```

## Manual Validation Scenarios

**ALWAYS test these scenarios after making changes:**

### 1. Website Navigation and Loading
- Start server: `php -S localhost:8000`
- Test homepage: `curl -I http://localhost:8000/` (should return 200 OK)
- Test key pages: donations (`/dons.html`), formations (`/formations.html`), contact (`/contact.html`)
- Verify all pages load without errors

### 2. Payment Form Functionality  
- Test donation API with valid data: `curl -X POST http://localhost:8000/donation_handler.php -H "Content-Type: application/json" -d '{"amount": 25, "firstname": "Test", "lastname": "User", "email": "test@example.com", "donation_type": "ponctuel", "fiscal_receipt": true}'`
- Expected response: `{"error":"Payment creation failed: cURL error: Could not resolve host: api.mollie.com"}` (external API failure is expected in sandboxed environment)
- Test with missing data: `curl -X POST http://localhost:8000/donation_handler.php -H "Content-Type: application/json" -d '{"test": "connection"}'`
- Expected response: `{"error":"Missing required fields"}`

### 3. Content Management System
- Access admin interface: `http://localhost:8000/admin/`
- Verify Netlify CMS loads: `curl -s http://localhost:8000/admin/ | grep -i netlify`
- Check configuration: `cat admin/config.yml` (should contain GitHub backend config)

### 4. Configuration Validation
- Test PHP config loading: `php -r "var_dump(require 'config.php');"`
- Verify environment template: `cat .env.example`
- Check all PHP files syntax: `find . -name "*.php" -exec php -l {} \;`

## Development Workflow

### Making Changes
- **Frontend changes**: Edit HTML/CSS/JS files directly, no compilation needed
- **PHP backend**: Always run syntax check after changes: `php -l filename.php`
- **Content**: Edit markdown files in `_posts/`, `_projets/`, `_formations/` folders
- **Configuration**: Update `admin/config.yml` for CMS settings

### Validation Requirements
- **ALWAYS** run PHP syntax validation before committing: `find . -name "*.php" -exec php -l {} \;`
- **ALWAYS** test website loading after changes: `curl -I http://localhost:8000/`
- **ALWAYS** test payment form functionality with the curl commands above
- **ALWAYS** verify admin interface still loads: `curl -s http://localhost:8000/admin/ | grep -i netlify`

### Deployment
- **Netlify Auto-Deploy**: Changes to main branch trigger automatic deployment
- **No build step**: Static files deployed directly from repository
- **PHP files**: Handled by Netlify Functions or external hosting
- **Environment variables**: Set in Netlify dashboard for production

## Common Tasks

### Testing Payment Integration
```bash
# Test with valid donation data (should fail on external API call)
curl -X POST http://localhost:8000/donation_handler.php \
  -H "Content-Type: application/json" \
  -d '{"amount": 50, "firstname": "John", "lastname": "Doe", "email": "john@example.com", "donation_type": "mensuel", "fiscal_receipt": true}'

# Test form validation (should return missing fields error)
curl -X POST http://localhost:8000/donation_handler.php \
  -H "Content-Type: application/json" \
  -d '{"amount": 50}'
```

### Content Management
- **Add new post**: Create markdown file in `_posts/` with format: `YYYY-MM-DD-title.md`
- **Add new project**: Create markdown file in `_projets/` with format: `YYYY-MM-DD-project-name.md`
- **Update site config**: Edit `_data/site.yml`
- **CMS access**: Navigate to `/admin/` on deployed site for GUI editing

### Configuration Updates
- **Payment settings**: Update `config.php` (copy from `config.template.php`)
- **Environment variables**: Use `.env.example` as reference
- **CMS settings**: Edit `admin/config.yml`
- **Server settings**: Modify `.htaccess` for Apache configuration

## Repository Outputs Reference

### Main Directory Listing
```
La Vida Luca - Ferme Pédagogique.png
Logo La Vida Luca.png
README.md
admin/
assets/
agriculture-bio.html
benevoles.html
blog-sol-compost.html
config.template.php
contact.html
donation-success.html
donation_handler.php
dons.html
formations.html
index.html
manifest.json
netlify.toml
script.js
styles.css
webhook.php
```

### PHP Syntax Check Output
```
No syntax errors detected in ./process_payment.php
No syntax errors detected in ./webhook.php
No syntax errors detected in ./donation_handler.php
No syntax errors detected in ./config.template.php
No syntax errors detected in ./donor_info_handler.php
No syntax errors detected in ./training_handler.php
```

### Website Response Headers
```
HTTP/1.1 200 OK
Host: localhost:8000
Content-Type: text/html; charset=UTF-8
Content-Length: 18226
```

## Security and Best Practices

### Configuration Security
- **NEVER commit `config.php`** - Use `config.template.php` as template
- **Environment variables**: Store sensitive data in `.env` files (excluded from git)
- **API keys**: Use Netlify environment variables for production

### Content Security
- **Admin access**: Requires GitHub OAuth authentication
- **File permissions**: Sensitive files blocked via `.htaccess`
- **Input validation**: All forms have client and server-side validation

### Performance
- **Static assets**: Cached via `.htaccess` configuration
- **Compression**: Gzip enabled for all text files
- **CDN**: Netlify handles global content delivery

## Troubleshooting

### Common Issues
- **Payment API failures**: Expected in sandboxed environments (external API blocking)
- **PHP syntax errors**: Run `php -l filename.php` to check
- **Server not starting**: Ensure port 8000 is available: `lsof -i :8000`
- **Config errors**: Verify `config.php` exists and has valid syntax

### Debug Commands
```bash
# Check PHP configuration
php -r "var_dump(require 'config.php');"

# Test server connectivity
curl -v http://localhost:8000/

# Check file permissions
ls -la config.php

# Validate JSON in API responses
curl -s http://localhost:8000/donation_handler.php | python3 -m json.tool
```

## Important Files for Frequent Updates

### Core Website Files
- `index.html` - Homepage content and structure
- `styles.css` - All visual styling
- `script.js` - Interactive functionality
- `dons.html` - Donation page (most frequently updated)

### Backend Configuration
- `config.template.php` - Payment integration settings
- `donation_handler.php` - Payment processing logic
- `webhook.php` - Payment confirmation handling

### Content Management
- `admin/config.yml` - CMS field definitions and collections
- `_data/site.yml` - Organization contact information
- Files in `_posts/`, `_projets/`, `_formations/` - Dynamic content

### Deployment Configuration
- `netlify.toml` - Netlify build and deployment settings
- `.htaccess` - Apache server optimization and security
- `manifest.json` - Progressive Web App configuration