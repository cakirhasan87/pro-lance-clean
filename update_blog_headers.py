#!/usr/bin/env python3
import os
import re

def update_header_in_file(file_path):
    """Update header in a single file to use universal header"""
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match old header
    old_header_pattern = r'<!-- Header -->\s*<header class="header flex">.*?</header>'
    
    # New universal header
    new_header = '''    <!-- Include Universal Header -->
    <div id="header"></div>
    <script>
        fetch('../header.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('header').innerHTML = data;
            })
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
    """Update headers in all blog post files"""
    
    # Blog post directories
    blog_dirs = [
        'blog-posts',
        'en/blog-posts',
        'flask_app/blog-posts',
        'flask_app/en/blog-posts'
    ]
    
    updated_count = 0
    
    for blog_dir in blog_dirs:
        if os.path.exists(blog_dir):
            print(f"\n📁 Processing directory: {blog_dir}")
            
            for filename in os.listdir(blog_dir):
                if filename.endswith('.html'):
                    file_path = os.path.join(blog_dir, filename)
                    if update_header_in_file(file_path):
                        updated_count += 1
    
    print(f"\n🎉 Total files updated: {updated_count}")

if __name__ == "__main__":
    main() 