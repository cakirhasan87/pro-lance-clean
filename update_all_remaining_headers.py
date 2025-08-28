#!/usr/bin/env python3
import os
import re

def update_header_in_file(file_path):
    """Update header in a single file to use universal header"""
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match old header (more flexible)
    old_header_pattern = r'<!-- Header -->\s*<header class="header flex">.*?</header>'
    
    # Determine the correct header path based on file location
    if file_path.startswith('en/'):
        header_path = 'header.html'
    elif file_path.startswith('flask_app/en/'):
        header_path = 'header.html'
    elif file_path.startswith('flask_app/'):
        header_path = 'header.html'
    elif file_path.startswith('tr/'):
        header_path = '../header.html'
    else:
        header_path = 'header.html'
    
    # New universal header
    new_header = f'''    <!-- Include Universal Header -->
    <div id="header"></div>
    <script>
        fetch('{header_path}')
            .then(response => response.text())
            .then(data => {{
                document.getElementById('header').innerHTML = data;
            }})
            .catch(error => console.error('Error loading header:', error));
    </script>'''
    
    # Check if file contains old header
    if re.search(old_header_pattern, content, re.DOTALL):
        # Replace old header with new one
        new_content = re.sub(old_header_pattern, new_header, content, flags=re.DOTALL)
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Updated: {file_path}")
        return True
    else:
        print(f"⏭️  Skipped (no old header): {file_path}")
        return False

def main():
    """Update headers in all remaining files"""
    
    # Files to update (excluding admin, test-site, and script files)
    files_to_update = [
        # Main site files
        'en/contact.html',
        'en/services.html',
        'en/collaboration.html',
        'en/blog.html',
        'en/about.html',
        'en/login.html',
        'en/register.html',
        'en/privacy-policy.html',
        'en/cookie-policy.html',
        
        # Flask app files
        'flask_app/contact.html',
        'flask_app/services.html',
        'flask_app/collaboration.html',
        'flask_app/blog.html',
        'flask_app/login.html',
        'flask_app/register.html',
        'flask_app/privacy-policy.html',
        'flask_app/en/contact.html',
        'flask_app/en/services.html',
        'flask_app/en/collaboration.html',
        'flask_app/en/blog.html',
        'flask_app/en/login.html',
        'flask_app/en/register.html',
        'flask_app/en/privacy-policy.html',
        'flask_app/en/terms-of-use.html',
        
        # Turkish files
        'tr/blog.html',
        'tr/cookie-policy.html',
        'tr/terms-of-use.html',
        'tr/privacy-policy.html',
        'tr/blog-posts/2025-freelance-trendleri.html',
        
        # Other files
        'login.html',
        'register.html',
        'blog_new.html',
        'services_new.html',
        'flask_app/blog_new.html',
        'flask_app/services_new.html',
    ]
    
    updated_count = 0
    
    for file_path in files_to_update:
        if os.path.exists(file_path):
            if update_header_in_file(file_path):
                updated_count += 1
        else:
            print(f"❌ File not found: {file_path}")
    
    print(f"\n🎉 Total files updated: {updated_count}")

if __name__ == "__main__":
    main()
