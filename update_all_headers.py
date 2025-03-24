import os
import re
import glob

# Updated header templates with text logo and no escape issues
turkish_header_template = '''<!-- Header -->
<header class="header flex">
    <div class="logo">
        <a href="/">Pro-Lance</a>
    </div>
    <nav class="nav">
        <ul class="nav-list">
            <li><a href="/" class="{home_active}">Ana Sayfa</a></li>
            <li><a href="/services.html" class="{services_active}">Hizmetler</a></li>
            <li><a href="/collaboration.html" class="{collaboration_active}">İş Birliği</a></li>
            <li><a href="/blog.html" class="{blog_active}">Blog</a></li>
            <li><a href="/contact.html" class="{contact_active}">İletişim</a></li>
        </ul>
    </nav>
    <div class="right-header">
        <div class="lang-switch">
            <a href="#" class="active">TR</a>
            <a href="{english_path}">EN</a>
        </div>
        <button class="hamburger">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>
</header>

<script>
    // Mobile menu functionality
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
    });
</script>'''

english_header_template = '''<!-- Header -->
<header class="header flex">
    <div class="logo">
        <a href="/en/index.html">Pro-Lance</a>
    </div>
    <nav class="nav">
        <ul class="nav-list">
            <li><a href="/en/index.html" class="{home_active}">Home</a></li>
            <li><a href="/en/services.html" class="{services_active}">Services</a></li>
            <li><a href="/en/collaboration.html" class="{collaboration_active}">Collaboration</a></li>
            <li><a href="/en/blog.html" class="{blog_active}">Blog</a></li>
            <li><a href="/en/contact.html" class="{contact_active}">Contact</a></li>
        </ul>
    </nav>
    <div class="right-header">
        <div class="lang-switch">
            <a href="{turkish_path}">TR</a>
            <a href="#" class="active">EN</a>
        </div>
        <button class="hamburger">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>
</header>

<script>
    // Mobile menu functionality
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
    });
</script>'''

# Templates for blog post headers
turkish_blog_post_header = '''<!-- Header -->
<header class="header flex">
    <div class="logo">
        <a href="/">Pro-Lance</a>
    </div>
    <nav class="nav">
        <ul class="nav-list">
            <li><a href="/" class="">Ana Sayfa</a></li>
            <li><a href="/services.html" class="">Hizmetler</a></li>
            <li><a href="/collaboration.html" class="">İş Birliği</a></li>
            <li><a href="/blog.html" class="active">Blog</a></li>
            <li><a href="/contact.html" class="">İletişim</a></li>
        </ul>
    </nav>
    <div class="right-header">
        <div class="lang-switch">
            <a href="#" class="active">TR</a>
            <a href="/en/blog-posts/{english_blog_file}">EN</a>
        </div>
        <button class="hamburger">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>
</header>

<script>
    // Mobile menu functionality
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
    });
</script>'''

english_blog_post_header = '''<!-- Header -->
<header class="header flex">
    <div class="logo">
        <a href="/en/index.html">Pro-Lance</a>
    </div>
    <nav class="nav">
        <ul class="nav-list">
            <li><a href="/en/index.html" class="">Home</a></li>
            <li><a href="/en/services.html" class="">Services</a></li>
            <li><a href="/en/collaboration.html" class="">Collaboration</a></li>
            <li><a href="/en/blog.html" class="active">Blog</a></li>
            <li><a href="/en/contact.html" class="">Contact</a></li>
        </ul>
    </nav>
    <div class="right-header">
        <div class="lang-switch">
            <a href="/blog-posts/{turkish_blog_file}">TR</a>
            <a href="#" class="active">EN</a>
        </div>
        <button class="hamburger">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </div>
</header>

<script>
    // Mobile menu functionality
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
    });
</script>'''

def update_single_file(html_file):
    """Update a single file's header"""
    try:
        with open(html_file, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Check if the file already has a header
        if '<!-- Header -->' not in content:
            print(f"No header found in {html_file}")
            return False
        
        # Determine which language and page this is
        is_english = html_file.startswith('en/')
        
        # Get the filename part
        filename = os.path.basename(html_file)
        
        # For normal pages, set the active state
        home_active = "active" if filename == "index.html" else ""
        services_active = "active" if filename == "services.html" else ""
        collaboration_active = "active" if filename == "collaboration.html" else ""
        blog_active = "active" if filename == "blog.html" else ""
        contact_active = "active" if filename == "contact.html" else ""
        
        # Special handling for blog posts
        is_blog_post = 'blog-posts/' in html_file
        
        if is_blog_post:
            # Get just the blog post filename (e.g., "mastering-project-management.html")
            blog_post_file = os.path.basename(html_file)
            
            if is_english:
                # For English blog posts, generate header with link to Turkish version
                header = english_blog_post_header.replace('{turkish_blog_file}', blog_post_file)
            else:
                # For Turkish blog posts, generate header with link to English version
                header = turkish_blog_post_header.replace('{english_blog_file}', blog_post_file)
        else:
            # Calculate corresponding path in the other language
            if is_english:
                # For English pages, link to Turkish version
                if html_file.startswith('en/'):
                    turkish_path = '/' + html_file[3:]  # Remove 'en/' prefix and add '/'
                else:
                    turkish_path = '/' + html_file
                    
                # Special case for index.html
                if filename == "index.html":
                    turkish_path = "/"
                    
                header = english_header_template.format(
                    home_active=home_active,
                    services_active=services_active,
                    collaboration_active=collaboration_active,
                    blog_active=blog_active,
                    contact_active=contact_active,
                    turkish_path=turkish_path
                )
            else:
                # For Turkish pages, link to English version
                if html_file == "index.html":
                    english_path = "/en/index.html"
                else:
                    english_path = "/en/" + html_file
                    
                header = turkish_header_template.format(
                    home_active=home_active,
                    services_active=services_active,
                    collaboration_active=collaboration_active,
                    blog_active=blog_active,
                    contact_active=contact_active,
                    english_path=english_path
                )
        
        # Simple header replacement using string operations instead of regex
        start_marker = '<!-- Header -->'
        end_marker = '</header>'
        
        if start_marker in content and end_marker in content:
            start_pos = content.find(start_marker)
            # Find the first occurrence of end_marker after start_marker
            search_from = start_pos + len(start_marker)
            end_pos = content.find(end_marker, search_from) + len(end_marker)
            
            # Handle any script tag that might follow
            script_start = content.find('<script>', end_pos)
            script_end = content.find('</script>', end_pos)
            
            if script_start != -1 and script_end != -1 and script_start < script_end and script_start - end_pos < 20:
                # Script tag follows header closely, include it in replacement
                end_pos = script_end + 9  # Length of </script>
            
            # Replace the header section
            updated_content = content[:start_pos] + header + content[end_pos:]
            
            with open(html_file, 'w', encoding='utf-8') as file:
                file.write(updated_content)
                
            print(f"Updated header in {html_file}")
            return True
        else:
            print(f"Could not find header markers in {html_file}")
            return False
    
    except Exception as e:
        print(f"Error processing {html_file}: {e}")
        return False

def update_headers():
    print("Starting header update process")
    # Get all HTML files in the current directory and subdirectories
    html_files = glob.glob('**/*.html', recursive=True)
    
    # Count for successful updates
    count = 0
    
    for html_file in html_files:
        # Skip files in the templates directory
        if html_file.startswith('templates/'):
            continue
            
        # Skip header.html itself
        if html_file.endswith('header.html'):
            print(f"Skipping {html_file}")
            continue
            
        # Skip admin_login.html
        if html_file.endswith('admin_login.html'):
            print(f"Skipping {html_file}")
            continue
        
        if update_single_file(html_file):
            count += 1
    
    print(f"Updated headers in {count} files")

if __name__ == "__main__":
    update_headers() 