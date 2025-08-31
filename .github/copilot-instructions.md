# La Vida Luca - Copilot Instructions

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Serve the Site
- Clone repository: `git clone <repository-url>`
- Navigate to repository: `cd LaVidaLuca`
- **Start local development server**: `python3 -m http.server 8000` (takes <1 second to start)
- **Alternative PHP server**: `php -S localhost:8000` (for PHP testing)
- **Access site**: http://localhost:8000
- **ALWAYS test your changes by serving the site locally and taking screenshots**

### Code Validation (NEVER CANCEL - Critical for CI Success)
- **HTML validation**: 
  - Install: `pip install html5lib` (takes ~10 seconds)
  - Run: `python3 -c "import html5lib; parser = html5lib.HTMLParser(strict=True); [parser.parse(open(f).read()) for f in ['index.html', 'contact.html']]"` (takes ~2 seconds)
  - **OR** Install htmlhint: `npm install -g htmlhint` (takes ~13 seconds, NEVER CANCEL)
  - Run: `htmlhint *.html` (takes <1 second)

- **JavaScript validation**:
  - **Syntax check**: `node -c script.js` (takes <1 second)
  - **Linting with JSHint**: 
    - Install: `npm install -g jshint` (included in htmlhint install above)
    - Create config: `echo '{"esversion": 6}' > .jshintrc`
    - Run: `jshint script.js` (takes <1 second)

- **PHP validation**:
  - Run: `find . -name "*.php" -exec php -l {} \;` (takes <1 second)
  - **All 6 PHP files must pass syntax validation**

### Manual Validation Scenarios (CRITICAL - Always Execute)
**ALWAYS run through these complete scenarios after making changes:**

1. **Homepage Navigation Test**:
   - Start server: `python3 -m http.server 8000`
   - Visit: http://localhost:8000
   - Click through ALL navigation links: Nos Projets, Formations, Blog, Bénévoles, Partenaires, Contact, Faire un don
   - **Take screenshot** of homepage to verify layout

2. **Contact Form Test**:
   - Navigate to: http://localhost:8000/contact.html
   - Fill in form fields: Prénom, Nom, Email 
   - Verify form validation works (required fields)
   - **Take screenshot** of filled form
   - **DO NOT submit** (no backend in local development)

3. **Content Management System Test**:
   - Navigate to: http://localhost:8000/admin/
   - **NOTE**: CMS will show errors in local development (external CDN resources blocked)
   - This is NORMAL and expected in local testing
   - In production, requires GitHub OAuth authentication

4. **Responsive Design Test**:
   - Test site at different viewport sizes
   - Verify mobile menu functionality works
   - Check that images and layout adapt properly

5. **Payment Form Testing** (when using PHP server):
   - Start PHP server: `php -S localhost:8000`
   - Test donation API: `curl -X POST http://localhost:8000/donation_handler.php -H "Content-Type: application/json" -d '{"amount": 25, "firstname": "Test", "lastname": "User", "email": "test@example.com", "donation_type": "ponctuel", "fiscal_receipt": true}'`
   - Expected: External API failure (normal in sandbox)
   - Test validation: `curl -X POST http://localhost:8000/donation_handler.php -H "Content-Type: application/json" -d '{"test": "connection"}'`
   - Expected: `{"error":"Missing required fields"}`

### Build Process
**This is a static site with NO traditional build process**:
- **No npm install required** - no package.json exists
- **No compilation step** - pure HTML/CSS/JavaScript
- **Netlify deployment**: Uses simple `echo 'Building static site...'` command
- **Content managed via**: Netlify CMS with Jekyll-style markdown files

### File Structure and Navigation
```
LaVidaLuca/
├── index.html              # Homepage (main entry point)
├── contact.html            # Contact page with forms
├── formations.html         # Training courses page
├── projets.html           # Projects page
├── blog.html              # Blog listing page
├── benevoles.html         # Volunteers page
├── dons.html              # Donations page with payment integration
├── script.js              # Main JavaScript file (17KB, ES6 syntax)
├── styles.css             # Main stylesheet (13KB)
├── admin/
│   ├── index.html         # Netlify CMS admin interface
│   └── config.yml         # CMS configuration
├── _posts/                # Blog posts (Markdown)
├── _projets/              # Project descriptions (Markdown)
├── _formations/           # Training course data (Markdown)
├── _pages/                # Static pages (Markdown)
├── _data/                 # Site configuration
│   └── site.yml          # Site metadata and contact info
├── assets/                # Images and media files
├── *.php                  # Payment processing scripts (6 files)
├── netlify.toml           # Netlify deployment configuration
└── manifest.json          # PWA manifest
```

### Key Components

#### Static Site (Primary)
- **Technology**: Pure HTML5, CSS3, ES6 JavaScript
- **No dependencies**: No package.json, no npm modules
- **Responsive**: Mobile-first design with CSS Grid/Flexbox
- **PWA**: Progressive Web App with manifest.json

#### Netlify CMS Integration
- **Admin URL**: `/admin/` (requires GitHub OAuth in production)
- **Configuration**: `admin/config.yml`
- **Content**: Stored in `_posts/`, `_projets/`, `_formations/`, `_pages/`
- **Images**: Uploaded to `assets/images/`

#### Payment Integration (PHP)
- **Mollie API**: `process_payment.php`, `webhook.php`
- **Zapier Integration**: `donation_handler.php`, `training_handler.php`
- **Configuration**: `config.template.php` (copy to `config.php` for production)

### Common Tasks

#### Adding New Content
1. **Via CMS** (Production): Access `/admin/`, authenticate, use web interface
2. **Direct File Edit** (Development): 
   - Add files to `_posts/`, `_projets/`, `_formations/`, or `_pages/`
   - Follow existing YAML frontmatter format
   - Use `.md` extension for Markdown content

#### Modifying Site Configuration
- **Edit**: `_data/site.yml` for contact info, social links
- **Test**: Reload page and verify changes appear

#### Working with Forms
- **Contact forms**: Use Netlify Forms (add `data-netlify="true"` attribute)
- **Payment forms**: Integrate with existing PHP handlers
- **Validation**: Client-side validation in `script.js`

#### Testing Payment Integration
- **Local testing**: Use `test_zapier_integration.html`
- **PHP syntax**: Always run `php -l *.php` before committing
- **Configuration**: Never commit real API keys

### Validation Commands Reference
```bash
# Quick validation suite (run before every commit) - Total time: <10 seconds
python3 -m http.server 8000 &          # Start server (<1 second)
sleep 2 && curl -I http://localhost:8000/  # Test homepage loads (<1 second)
find . -name "*.php" -exec php -l {} \;    # Validate PHP syntax (<1 second)
node -c script.js                          # Validate JavaScript syntax (<1 second)
htmlhint index.html contact.html          # Validate HTML (<1 second)
pkill -f "python3 -m http.server"         # Stop server (<1 second)

# Alternative PHP server validation
php -S localhost:8000 &                    # Start PHP server
curl -I http://localhost:8000/             # Test homepage
curl -s http://localhost:8000/admin/ | grep -i netlify  # Test CMS
pkill -f "php -S"                          # Stop PHP server
```

### Troubleshooting

#### Common Issues
- **Images not loading**: Check paths are relative to document root
- **CMS admin errors**: Normal in local development (CDN blocked)
- **PHP errors**: Ensure PHP 8.3+ installed, check syntax with `php -l`
- **Form submission**: Works only with Netlify deployment, not local server

#### Expected Timing (VALIDATED)
- **Server start**: <1 second
- **Page load**: <1 second  
- **HTML validation**: <1 second for key files (index.html, contact.html)
- **PHP validation**: <1 second for all 6 files
- **JavaScript validation**: <1 second
- **Full validation suite**: <10 seconds total
- **HTMLHint installation**: ~13 seconds (NEVER CANCEL)

#### When to Use External Tools
- **HTMLHint installation**: Only for enhanced HTML validation
- **JSHint setup**: Only when working extensively with JavaScript
- **Python http.server**: Always for local development testing

### CRITICAL Validation Requirements
- **NEVER skip manual testing** - Always serve site and test scenarios
- **ALWAYS take screenshots** when making visual changes
- **ALWAYS validate ALL code types** before committing (HTML, CSS, JavaScript, PHP)
- **NEVER commit without running validation suite**
- **ALWAYS test forms and interactive elements**

### Production Deployment Notes
- **Platform**: Netlify
- **Build command**: `echo 'Building static site...'` (no actual build required)
- **Publish directory**: `.` (repository root)
- **Environment variables**: Required for payment integration (see `MOLLIE_README.md`, `ZAPIER_README.md`)
- **Domain**: Custom domain configured in Netlify dashboard
