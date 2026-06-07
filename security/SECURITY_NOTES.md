# =====================================================
# PORTFOLIO SECURITY CHECKLIST & NOTES
# Author: Idra Mkumbanya
# Last updated: 2025
# =====================================================

## HOW TO USE THE .htaccess FILE
# 1. Copy .htaccess to your ROOT folder (mywebsite/.htaccess)
#    NOT inside the security/ folder — it must be at root level
# 2. Your hosting must support Apache with mod_headers enabled
# 3. Test headers at: https://securityheaders.com

## SECURITY HEADERS EXPLAINED

### Content-Security-Policy (CSP)
# Tells browsers what sources are allowed to load content.
# Our policy blocks:
#   - Inline <script> tags (XSS prevention)
#   - External scripts from unknown CDNs
#   - Framing your site in iframes (clickjacking)
# Allows:
#   - Your own files (self)
#   - Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
#   - Formspree for the contact form (formspree.io)

### X-Content-Type-Options: nosniff
# Stops browsers from guessing the MIME type of a file.
# Without this, a browser might run a .txt file as JavaScript.

### X-Frame-Options: DENY
# Prevents anyone embedding your site in an <iframe>.
# This stops clickjacking attacks where someone overlays
# a fake UI on top of your real site to steal clicks.

### X-XSS-Protection
# Activates old browser XSS filters. Modern browsers use
# CSP instead, but this covers older ones.

### Referrer-Policy
# Controls how much URL info is sent when someone clicks a link
# leaving your site. 'strict-origin-when-cross-origin' is safe
# and privacy-respecting.

### Permissions-Policy
# Blocks browser APIs you don't need — camera, mic, location.
# Reduces your attack surface significantly.

## CHECKLIST — BEFORE YOU GO LIVE

### DNS & Hosting
[ ] Domain purchased and pointed to hosting
[ ] HTTPS/SSL certificate installed (Let's Encrypt is free)
[ ] www redirect set up (www → non-www or vice versa)
[ ] .htaccess uploaded to root and working

### Headers (test at securityheaders.com — aim for A+)
[ ] Content-Security-Policy ✓
[ ] X-Content-Type-Options ✓
[ ] X-Frame-Options ✓
[ ] Referrer-Policy ✓
[ ] Permissions-Policy ✓

### Files & Access
[ ] Directory listing disabled (Options -Indexes in .htaccess)
[ ] .htaccess not publicly readable
[ ] No .env, .git, or .log files exposed
[ ] 404 error page set to your custom 404.html

### Forms (contact.html)
[ ] Formspree or backend validates all inputs server-side
[ ] No sensitive data (API keys, passwords) in client-side JS
[ ] Form has rate limiting (Formspree handles this)

### Images & Assets
[ ] All images have descriptive alt text
[ ] No EXIF metadata in photos (strip before uploading)
[ ] Large images compressed (use TinyPNG or Squoosh)

### Privacy
[ ] No Google Analytics without a cookie consent banner
[ ] No third-party tracking scripts
[ ] GitHub links use rel="noopener noreferrer"

## SECURITY FEATURES ALREADY IN YOUR CODE
[x] skip-link for accessibility
[x] aria-label on all buttons
[x] rel="noopener noreferrer" on external links
[x] input validation on forms (type="email", required)
[x] novalidate removed (HTML5 validation active on survey)
[x] Custom 404 page
[x] HTTPS-ready meta structure

## WHAT TO ADD NEXT (INTERMEDIATE LEVEL)

### Subresource Integrity (SRI)
# If you load anything from a CDN, add integrity hashes:
# <script src="https://cdn.example.com/lib.js"
#         integrity="sha384-abc123..."
#         crossorigin="anonymous"></script>
# Generate hashes at: https://www.srihash.org

### robots.txt (create at mywebsite/robots.txt)
# User-agent: *
# Allow: /
# Disallow: /security/
# Sitemap: https://yourdomain.com/sitemap.xml

### sitemap.xml (create at mywebsite/sitemap.xml)
# Lists all your pages for search engines.
# Boosts SEO significantly.

## USEFUL TESTING TOOLS
- https://securityheaders.com     — test your HTTP headers
- https://observatory.mozilla.org — Mozilla security scan
- https://www.ssllabs.com/ssltest — SSL certificate check
- https://pagespeed.web.dev       — performance + security
- https://validator.w3.org        — HTML validation