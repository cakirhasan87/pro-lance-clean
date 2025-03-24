import os
import re

# Header template that will replace existing headers
header_template = '''<!-- Header -->
<header class="header">
    <div class="logo">
        <a href="../index.html"><img src="../images/Pro-LanceLogo.png" alt="Pro-Lance Logo"></a>
    </div>
    <nav class="nav">
        <ul class="nav-list">
            <li><a href="../index.html">Ana Sayfa</a></li>
            <li><a href="../index.html#services">Hizmetler</a></li>
            <li><a href="../collaboration.html">İş Birliği</a></li>
            <li><a href="../blog.html">Blog</a></li>
            <li><a href="../contact.html">İletişim</a></li>
        </ul>
    </nav>
    <div class="lang-switch">
        <a href="#" class="active">TR</a>
        <a href="#">EN</a>
    </div>
    <button class="hamburger">
        <span></span>
        <span></span>
        <span></span>
    </button>
</header>'''

# Get all HTML files in the blog-posts directory
blog_posts_dir = os.path.join(os.path.dirname(__file__), 'blog-posts')
html_files = [f for f in os.listdir(blog_posts_dir) if f.endswith('.html') and f != 'blog-post-template.html']

# Counter for updated files
updated_count = 0

# Process each file
for filename in html_files:
    file_path = os.path.join(blog_posts_dir, filename)
    
    # Read the content of the file
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Pattern to match the header section (including optional header comment)
    pattern = r'(?:<!--\s*Header.*?-->)?\s*<header.*?</header>'
    
    # Replace the header with our template
    new_content, count = re.subn(pattern, header_template, content, flags=re.DOTALL)
    
    if count > 0:
        # Write the updated content back to the file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated header in {filename}")
        updated_count += 1
    else:
        print(f"Could not find header pattern in {filename}")

print(f"Updated {updated_count} of {len(html_files)} files") 