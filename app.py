from flask import Flask, send_from_directory, render_template, request, jsonify
import os
import requests
import socket
import json
import logging
import time
import glob
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import uuid
from datetime import datetime
import platform
import re
from dotenv import load_dotenv
from supabase import create_client

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='.')

# Configure Flask app
app.config.update(
    SECRET_KEY='default-secret-key',
    DEBUG=True  # Enable debug mode for better error messages
)

# CORS headers to allow requests from any origin
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

def inject_cookie_consent(response):
    """Inject cookie consent template into HTML responses"""
    if response.mimetype == 'text/html':
        try:
            with open('flask_app/templates/cookie-consent.html', 'r') as f:
                cookie_consent = f.read()
            
            # Insert cookie consent before closing body tag
            html = response.get_data(as_text=True)
            if '</body>' in html:
                html = html.replace('</body>', f'{cookie_consent}</body>')
                response.set_data(html)
        except Exception as e:
            print(f"Error injecting cookie consent: {str(e)}")
    return response

@app.after_request
def after_request_with_cookie_consent(response):
    response = after_request(response)
    return inject_cookie_consent(response)

# Create a session with retry mechanism for all requests
def create_requests_session(retries=5, backoff_factor=0.3, status_forcelist=(500, 502, 504)):
    """Create a requests session with retries"""
    session = requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

# Supabase configuration
SUPABASE_PROJECT_ID = 'hhudczwbcjejxvbxglkv'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodWRjendiejZqZWp4dmJ4Z2xrdiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA5NzQ3MTU3LCJleHAiOjIwMjUzMjMxNTd9.P_C70m_yEY0H9M72_QvEVX-HSY0nPipJrWpvrdmxQ0M'

# Update SUPABASE_DOMAINS with the correct URL format
SUPABASE_DOMAINS = [
    'https://hhudczwbcjejxvbxglkv.supabase.co'
]

# Function to get the appropriate API key based on the domain
def get_api_key_for_domain(domain):
    return SUPABASE_KEY

# Global session with increased timeout and retries
http_session = create_requests_session(retries=7, backoff_factor=0.5)

# Modify request headers to include Host header when using direct IPs
def get_headers_for_domain(domain, api_key):
    """Get appropriate headers for the domain"""
    headers = {
        'apikey': api_key,
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    return headers

@app.route('/')
@app.route('/index.html')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory('images', filename)

@app.route('/en/<path:filename>')
def serve_en(filename):
    return send_from_directory('en', filename)

@app.route('/blog-posts/<path:filename>')
def serve_blog_posts(filename):
    return send_from_directory('blog-posts', filename)

@app.route('/en/blog-posts/<path:filename>')
def serve_en_blog_posts(filename):
    return send_from_directory('en/blog-posts', filename)

@app.route('/admin/<path:filename>')
def serve_admin(filename):
    return send_from_directory('admin', filename)

# Options route to handle preflight requests
@app.route('/submit-contact', methods=['OPTIONS'])
def options_submit_contact():
    return '', 204

@app.route('/sync-submissions')
def sync_submissions():
    """Attempt to sync locally saved submissions to Supabase"""
    results = {
        "success": True,
        "message": "Sync process completed",
        "total": 0,
        "attempted": 0,
        "succeeded": 0,
        "failed": 0,
        "details": []
    }
    
    try:
        # Find all local submission files
        submission_files = glob.glob('local_submissions/contact_*.json')
        results["total"] = len(submission_files)
        
        if len(submission_files) == 0:
            results["message"] = "No local submissions found to sync"
            return jsonify(results)
        
        # Process each file
        for file_path in submission_files:
            file_result = {
                "file": os.path.basename(file_path),
                "attempted": False,
                "success": False,
                "message": ""
            }
            
            try:
                # Load the submission data
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                # Extract submission ID from filename if possible
                submission_id = os.path.basename(file_path).split('_')[-1].split('.')[0]
                if not is_valid_uuid(submission_id):
                    submission_id = str(uuid.uuid4())
                
                # Attempt to submit to Supabase
                results["attempted"] += 1
                file_result["attempted"] = True
                
                # Submit to Supabase with detailed reporting
                supabase_result = submit_to_supabase_with_details(data, submission_id)
                
                if supabase_result["success"]:
                    # If successful, move the file to a success directory
                    results["succeeded"] += 1
                    file_result["success"] = True
                    file_result["message"] = f"Successfully synced to Supabase"
                    
                    # Move file to synced directory
                    os.makedirs('local_submissions/synced', exist_ok=True)
                    new_path = os.path.join('local_submissions/synced', os.path.basename(file_path))
                    os.rename(file_path, new_path)
                    file_result["moved_to"] = new_path
                else:
                    # If failed, keep the file for later retry
                    results["failed"] += 1
                    file_result["success"] = False
                    file_result["message"] = supabase_result["message"]
            
            except Exception as e:
                results["failed"] += 1
                file_result["success"] = False
                file_result["message"] = f"Error processing file: {str(e)}"
                logging.error(f"Error syncing {file_path}: {str(e)}")
                logging.exception(e)
            
            results["details"].append(file_result)
        
        # Update overall message
        if results["succeeded"] > 0 and results["failed"] > 0:
            results["message"] = f"Synced {results['succeeded']} of {results['attempted']} submissions. {results['failed']} failed."
        elif results["succeeded"] > 0:
            results["message"] = f"Successfully synced {results['succeeded']} submissions."
        elif results["failed"] > 0:
            results["message"] = f"Failed to sync {results['failed']} submissions."
    
    except Exception as e:
        results["success"] = False
        results["message"] = f"Error during sync process: {str(e)}"
        logging.error(f"Error in sync_submissions: {str(e)}")
        logging.exception(e)
    
    return jsonify(results)

def is_valid_uuid(uuid_string):
    """Check if a string is a valid UUID"""
    try:
        uuid_obj = uuid.UUID(uuid_string)
        return str(uuid_obj) == uuid_string
    except (ValueError, AttributeError):
        return False

# Route to test Supabase connection
@app.route('/test-supabase', methods=['GET'])
def test_supabase():
    results = {}
    for domain in SUPABASE_DOMAINS:
        try:
            # Use a simple API call to test connectivity
            table_path = '/contacts' if not domain.endswith('/rest/v1') else '/contacts'
            test_url = f"{domain}{table_path}" if not domain.endswith('/contacts') else domain
            
            start_time = time.time()
            api_key = get_api_key_for_domain(domain)
            
            response = http_session.get(
                test_url,
                headers={
                    'apikey': api_key,
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json',
                    'Prefer': 'count=exact'
                },
                timeout=8
            )
            elapsed = time.time() - start_time
            
            results[domain] = {
                "status": response.status_code,
                "response_time": f"{elapsed:.2f}s",
                "working": response.status_code < 400,
                "content": response.text[:100] if response.text else "No content",
                "url_tested": test_url
            }
        except Exception as e:
            results[domain] = {
                "status": "error",
                "error": str(e),
                "working": False,
                "url_tested": test_url if 'test_url' in locals() else domain
            }
    
    # Find the first working domain
    working_domain = None
    for domain in SUPABASE_DOMAINS:
        if domain in results and results[domain].get("working", False):
            working_domain = domain
            break
            
    return jsonify({
        "test_results": results,
        "working_domain": working_domain,
        "dns_test": test_dns_resolution()
    }), 200

def test_dns_resolution(domains=None):
    """Test DNS resolution for various domains"""
    results = {}
    if domains is None:
        domains = ['supabase.com', 'google.com', 'example.com'] + SUPABASE_DOMAINS
        
    for domain in domains:
        try:
            ip = socket.gethostbyname(domain)
            results[domain] = {
                'resolved': True,
                'ip': ip
            }
        except socket.gaierror as e:
            results[domain] = {
                'resolved': False,
                'error': str(e)
            }
    
    return results

@app.route('/submit-contact', methods=['POST'])
def submit_contact():
    try:
        data = request.get_json()
        
        # Verify reCAPTCHA v3
        recaptcha_response = data.get('recaptcha_response')
        if not recaptcha_response:
            return jsonify({'error': 'reCAPTCHA verification failed'}), 400
            
        # Make request to Google's reCAPTCHA verification API
        verify_url = 'https://www.google.com/recaptcha/api/siteverify'
        payload = {
            'secret': os.getenv("RECAPTCHA_SECRET_KEY"),
            'response': recaptcha_response
        }
        response = requests.post(verify_url, data=payload)
        result = response.json()
        print(f"reCAPTCHA verification result: {result}")
        
        # Check if score is above threshold (0.5 is a common threshold)
        if not result.get('success') or result.get('score', 0) < 0.5:
            print(f"reCAPTCHA verification failed: Success={result.get('success')}, Score={result.get('score', 0)}")
            return jsonify({'error': 'reCAPTCHA verification failed'}), 400
            
        # Process the form data
        print("reCAPTCHA verified successfully. Processing form data...")
        name = data.get('name')
        email = data.get('email')
        subject = data.get('subject')
        message = data.get('message')
        phone = data.get('phone')
        
        # Prepare data for Supabase
        supabase_data = {
            'name': name,
            'email': email,
            'subject': subject,
            'message': message,
            'phone': phone if phone else None,
            'recaptcha_response': recaptcha_response
        }
        print(f"Attempting to insert into Supabase: {supabase_data}")
        
        # Store in Supabase
        try:
            insert_response = supabase.table('contact_messages').insert(supabase_data).execute()
            print(f"Supabase insert response: {insert_response}")
            
            # Check for errors in Supabase response (if applicable, depends on library version)
            if hasattr(insert_response, 'error') and insert_response.error:
                print(f"Supabase insert error: {insert_response.error}")
                raise Exception(f"Supabase error: {insert_response.error}")
                
            return jsonify({'message': 'Message sent successfully'}), 200
            
        except Exception as supabase_error:
            print(f"Error during Supabase insert: {str(supabase_error)}")
            return jsonify({'error': 'Failed to save message.'}), 500
        
    except Exception as e:
        print(f"Error processing contact form: {str(e)}")
        return jsonify({'error': 'An error occurred while processing your request'}), 500

def submit_to_supabase_with_details(data, submission_id=None):
    """Submit data to Supabase with detailed error reporting"""
    result = {
        "success": False,
        "message": "",
        "details": {}
    }
    
    if not submission_id:
        submission_id = str(uuid.uuid4())
    
    # Add submission ID and timestamp to data
    data['id'] = submission_id
    data['created_at'] = datetime.utcnow().isoformat()
    
    # Try each Supabase domain
    for domain in SUPABASE_DOMAINS:
        try:
            # Construct the URL with the correct endpoint
            url = f"{domain}/rest/v1/contact_messages"
            
            # Get appropriate headers
            api_key = get_api_key_for_domain(domain)
            headers = get_headers_for_domain(domain, api_key)
            
            # Log the attempt
            logging.info(f"Attempting Supabase submission to {url}")
            logging.info(f"Sending request to {url} with data: {json.dumps(data)}")
            
            # Make the request with increased timeout
            response = http_session.post(
                url,
                json=data,
                headers=headers,
                timeout=30  # Increased timeout
            )
            
            # Log the response
            logging.info(f"Supabase response status: {response.status_code}")
            logging.info(f"Supabase response headers: {dict(response.headers)}")
            
            if response.status_code in [200, 201, 204]:
                result["success"] = True
                result["message"] = "Successfully submitted to Supabase"
                result["details"] = {
                    "status_code": response.status_code,
                    "response": response.text if response.text else "No response body"
                }
                return result
            else:
                error_msg = f"Error submitting to Supabase: {response.status_code} - {response.text}"
                logging.error(error_msg)
                result["message"] = error_msg
                result["details"] = {
                    "status_code": response.status_code,
                    "response": response.text,
                    "domain": domain
                }
        
        except requests.exceptions.RequestException as e:
            error_msg = f"Request error with {domain}: {str(e)}"
            logging.error(error_msg)
            result["message"] = error_msg
            result["details"] = {
                "error": str(e),
                "domain": domain
            }
        except Exception as e:
            error_msg = f"Unexpected error with {domain}: {str(e)}"
            logging.error(error_msg)
            result["message"] = error_msg
            result["details"] = {
                "error": str(e),
                "domain": domain
            }
    
    # If we get here, all attempts failed
    if not result["message"]:
        result["message"] = "All Supabase submission attempts failed"
    
    return result

def save_locally(form_data, submission_id=None):
    """Save form submission locally as a backup"""
    try:
        # Create the submissions directory if it doesn't exist
        os.makedirs('local_submissions', exist_ok=True)
        
        # Generate a filename with timestamp and optional ID
        if not submission_id:
            submission_id = str(uuid.uuid4())
            
        timestamp = time.strftime('%Y%m%d_%H%M%S')
        filename = f"local_submissions/contact_{timestamp}_{submission_id}.json"
        
        # Save the form data to the file
        with open(filename, 'w') as f:
            json.dump(form_data, f, indent=2)
        
        logging.info(f"Saved submission locally to {filename}")
        return filename
    except Exception as e:
        logging.error(f"Error saving submission locally: {str(e)}")
        logging.exception(e)
        return None

@app.route('/test-supabase-connection', methods=['GET'])
def test_supabase_connection():
    """Route to test Supabase connection and provide detailed diagnostics"""
    try:
        results = {
            "success": True,
            "message": "Supabase connection diagnostics completed",
            "timestamp": datetime.now().isoformat(),
            "dns_resolution": {},
            "domains": {},
            "network_info": {},
            "system_info": {
                "os": platform.system(),
                "version": platform.version(),
                "python": platform.python_version()
            }
        }
        
        # Test DNS resolution for various domains
        results["dns_resolution"] = test_dns_resolution()
        
        # Test network connectivity
        try:
            import socket
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            results["network_info"]["primary_ip"] = s.getsockname()[0]
            s.close()
        except Exception as e:
            results["network_info"]["primary_ip_error"] = str(e)
        
        # Try ping (HTTP GET) test to each domain
        for domain in SUPABASE_DOMAINS:
            domain_result = {
                "ping": {
                    "success": False,
                    "time_ms": None,
                    "error": None
                },
                "post": {
                    "success": False,
                    "time_ms": None,
                    "status_code": None,
                    "response": None,
                    "error": None
                }
            }
            
            # Get the API key for this domain
            api_key = get_api_key_for_domain(domain)
            domain_result["api_key_available"] = api_key is not None
            
            if not api_key:
                domain_result["ping"]["error"] = "No API key available for this domain"
                results["domains"][domain] = domain_result
                continue
            
            # Test ping (GET request)
            try:
                start_time = time.time()
                response = http_session.get(
                    f"https://{domain}/rest/v1/", 
                    headers={
                        'apikey': api_key
                    },
                    timeout=5
                )
                elapsed_time = time.time() - start_time
                
                domain_result["ping"]["success"] = 200 <= response.status_code < 300
                domain_result["ping"]["time_ms"] = int(elapsed_time * 1000)
                domain_result["ping"]["status_code"] = response.status_code
                domain_result["ping"]["response"] = response.text[:200] if response.text else None
            except Exception as e:
                domain_result["ping"]["error"] = str(e)
            
            # Test POST request
            try:
                start_time = time.time()
                test_data = {
                    "id": str(uuid.uuid4()),
                    "name": "Connection Test",
                    "email": "test@example.com",
                    "message": "This is a connection test",
                    "created_at": datetime.now().isoformat(),
                    "is_test": True
                }
                
                response = http_session.post(
                    f"https://{domain}/rest/v1/contacts", 
                    json=test_data,
                    headers={
                        'apikey': api_key,
                        'Authorization': f'Bearer {api_key}',
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    timeout=10
                )
                elapsed_time = time.time() - start_time
                
                domain_result["post"]["success"] = 200 <= response.status_code < 300
                domain_result["post"]["time_ms"] = int(elapsed_time * 1000)
                domain_result["post"]["status_code"] = response.status_code
                domain_result["post"]["response"] = response.text[:200] if response.text else None
            except Exception as e:
                domain_result["post"]["error"] = str(e)
            
            results["domains"][domain] = domain_result
        
        # Check if any domain succeeded
        any_domain_succeeded = False
        for domain_result in results["domains"].values():
            if domain_result["post"]["success"]:
                any_domain_succeeded = True
                break
        
        if any_domain_succeeded:
            results["message"] = "Supabase connection successful for at least one domain"
        else:
            results["message"] = "Supabase connection failed for all domains"
            
        return jsonify(results)
        
    except Exception as e:
        logging.error(f"Error in test_supabase_connection: {str(e)}")
        logging.exception(e)
        return jsonify({
            "success": False,
            "message": f"Error during connection test: {str(e)}",
            "error_type": type(e).__name__,
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/test-form')
def test_form():
    """Simple page with test form for Supabase testing"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Supabase Connection Test</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="text"], input[type="email"], textarea, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
            button { background-color: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background-color: #45a049; }
            .message { margin-top: 20px; padding: 10px; border-radius: 4px; }
            .success { background-color: #d4edda; color: #155724; }
            .error { background-color: #f8d7da; color: #721c24; }
            .loading { display: none; margin-top: 20px; }
            .diagnostics { margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 4px; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
        </style>
    </head>
    <body>
        <h1>Supabase Connection Test</h1>
        
        <div>
            <a href="/test-supabase-connection" target="_blank">Run Connection Diagnostics</a>
        </div>
        
        <h2>Test Form</h2>
        <form id="testForm">
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" value="Test User" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" value="test@example.com" required>
            </div>
            
            <div class="form-group">
                <label for="subject">Subject:</label>
                <select id="subject" name="subject" required>
                    <option value="test">Test Message</option>
                    <option value="general">General Information</option>
                    <option value="business">Business Collaboration</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="message">Message:</label>
                <textarea id="message" name="message" rows="4" required>This is a test message to verify Supabase connectivity.</textarea>
            </div>
            
            <button type="submit">Submit Test</button>
        </form>
        
        <div id="loading" class="loading">
            Submitting form data...
        </div>
        
        <div id="responseMessage" class="message" style="display: none;"></div>
        
        <div class="diagnostics">
            <h3>Response Details:</h3>
            <pre id="responseDetails"></pre>
        </div>
        
        <script>
            document.getElementById('testForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const loading = document.getElementById('loading');
                const responseMessage = document.getElementById('responseMessage');
                const responseDetails = document.getElementById('responseDetails');
                
                // Show loading
                loading.style.display = 'block';
                responseMessage.style.display = 'none';
                
                // Get form data
                const formData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    subject: document.getElementById('subject').value,
                    message: document.getElementById('message').value,
                    created_at: new Date().toISOString(),
                    language: 'test_form',
                    test: true
                };
                
                // Send request
                fetch('/submit-contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                })
                .then(response => response.json())
                .then(data => {
                    loading.style.display = 'none';
                    responseMessage.style.display = 'block';
                    
                    if (data.success) {
                        responseMessage.className = 'message success';
                        responseMessage.textContent = 'Form submitted successfully!';
                    } else {
                        responseMessage.className = 'message error';
                        responseMessage.textContent = 'Error: ' + data.message;
                    }
                    
                    responseDetails.textContent = JSON.stringify(data, null, 2);
                })
                .catch(error => {
                    loading.style.display = 'none';
                    responseMessage.style.display = 'block';
                    responseMessage.className = 'message error';
                    responseMessage.textContent = 'Error: ' + error.message;
                    responseDetails.textContent = error.toString();
                });
            });
        </script>
    </body>
    </html>
    """
    return html

@app.route('/api/blog-posts', methods=['GET'])
def get_blog_posts():
    """Get all blog posts from both English and Turkish directories"""
    try:
        blog_posts = []
        
        # Helper function to scan blog posts from directories
        def scan_blog_directory(lang_prefix):
            posts = []
            blog_dir = f"{lang_prefix}/blog-posts"
            if os.path.exists(blog_dir):
                for file in os.listdir(blog_dir):
                    if file.endswith('.html'):
                        try:
                            file_path = os.path.join(blog_dir, file)
                            with open(file_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                                
                            # Extract title
                            title_match = re.search(r'<title>(.*?)</title>', content)
                            title = title_match.group(1) if title_match else file.replace('.html', '')
                            if ' - Pro-Lance' in title:
                                title = title.replace(' - Pro-Lance', '')
                                
                            # Extract date if available
                            date_match = re.search(r'<span class="post-date">(.*?)</span>', content)
                            date = date_match.group(1) if date_match else datetime.now().strftime('%Y-%m-%d')
                            
                            # Extract image
                            image_match = re.search(r'<img src="(.*?)" alt="', content)
                            image = image_match.group(1) if image_match else "/images/placeholder.webp"
                            
                            posts.append({
                                'id': file.replace('.html', ''),
                                'title': title,
                                'date': date,
                                'language': 'en' if lang_prefix == 'en' else 'tr',
                                'image': image,
                                'file_path': file_path
                            })
                        except Exception as e:
                            logging.error(f"Error parsing blog post {file}: {str(e)}")
            return posts
        
        # Get English posts
        en_posts = scan_blog_directory('en')
        blog_posts.extend(en_posts)
        
        # Get Turkish posts
        tr_posts = scan_blog_directory('tr')
        blog_posts.extend(tr_posts)
        
        # Sort by date (newest first)
        blog_posts.sort(key=lambda x: x.get('date', ''), reverse=True)
        
        return jsonify({
            'success': True,
            'blog_posts': blog_posts,
            'count': len(blog_posts)
        })
    
    except Exception as e:
        logging.error(f"Error fetching blog posts: {str(e)}")
        logging.exception(e)
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}',
            'blog_posts': []
        }), 500

@app.route('/api/blog-posts', methods=['POST'])
def create_blog_post():
    """Create a new blog post"""
    try:
        data = request.json
        
        if not data or 'title' not in data or 'content' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing required fields: title, content'
            }), 400
        
        title = data.get('title')
        content = data.get('content')
        image = data.get('image', '/images/placeholder.webp')
        language = data.get('language', 'en')
        
        # Generate a file-friendly slug from the title
        slug = re.sub(r'[^a-zA-Z0-9]', '-', title.lower())
        slug = re.sub(r'-+', '-', slug).strip('-')
        
        # Create a new date for the post
        date = datetime.now().strftime('%Y-%m-%d')
        
        # Create directory structure if it doesn't exist
        lang_dir = os.path.join(language)
        blog_posts_dir = os.path.join(lang_dir, 'blog-posts')
        os.makedirs(blog_posts_dir, exist_ok=True)
        
        # Create the blog post file
        file_path = os.path.join(blog_posts_dir, f"{slug}.html")
        
        # Check if file already exists and modify slug if needed
        if os.path.exists(file_path):
            slug = f"{slug}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            file_path = os.path.join(blog_posts_dir, f"{slug}.html")
        
        # Prepare the HTML template
        html_content = f"""<!DOCTYPE html>
<html lang="{language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Pro-Lance</title>
    <link rel="stylesheet" href="../../style.css">
    <link rel="icon" href="../../images/favicon.ico">
    <meta name="description" content="{title}">
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-483914364"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
    
      gtag('config', 'G-483914364');
    </script>
</head>
<body>
    <header>
        <!-- Include common header -->
        <script>
            fetch("../${language}/header.html")
                .then(response => response.text())
                .then(data => {{
                    document.querySelector("header").innerHTML = data;
                }});
        </script>
    </header>

    <main>
        <section class="blog-post">
            <div class="container">
                <h1>{title}</h1>
                <div class="post-meta">
                    <span class="post-date">{date}</span>
                </div>
                <img src="{image}" alt="{title}" class="blog-featured-image">
                <article class="blog-content">
                    {content}
                </article>
            </div>
        </section>
    </main>

    <footer>
        <!-- Include common footer -->
        <script>
            fetch("../${language}/footer.html")
                .then(response => response.text())
                .then(data => {{
                    document.querySelector("footer").innerHTML = data;
                }});
        </script>
    </footer>

    <script src="../../script.js"></script>
</body>
</html>"""
        
        # Write the content to the file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        # Return success response
        return jsonify({
            'success': True,
            'message': 'Blog post created successfully',
            'id': slug,
            'file_path': file_path
        })
        
    except Exception as e:
        logging.error(f"Error creating blog post: {str(e)}")
        logging.exception(e)
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/contact-messages', methods=['GET'])
def get_contact_messages():
    """Get all contact messages from local submissions"""
    try:
        messages = []
        
        # Create local submissions directory if it doesn't exist
        os.makedirs('local_submissions', exist_ok=True)
        os.makedirs('local_submissions/synced', exist_ok=True)
        
        # Get all local submissions
        submission_files = glob.glob('local_submissions/contact_*.json')
        synced_files = glob.glob('local_submissions/synced/contact_*.json')
        
        all_files = submission_files + synced_files
        
        for file_path in all_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Extract submission ID and timestamp from filename
                file_name = os.path.basename(file_path)
                parts = file_name.split('_')
                
                # Default values
                submission_id = str(uuid.uuid4())
                timestamp = datetime.now().strftime('%Y%m%d')
                
                # Try to extract from filename
                if len(parts) > 2:
                    try:
                        # Last part before .json is the ID
                        submission_id = parts[-1].split('.')[0]
                        # Second part is usually the timestamp
                        if len(parts) > 2:
                            timestamp = parts[1]
                    except:
                        pass
                
                # Add metadata to the submission
                synced = 'synced' in file_path
                
                message_data = {
                    'id': submission_id,
                    'name': data.get('name', 'Unknown'),
                    'email': data.get('email', ''),
                    'subject': data.get('subject', ''),
                    'message': data.get('message', ''),
                    'phone': data.get('phone', ''),
                    'created_at': data.get('created_at', ''),
                    'file_path': file_path,
                    'synced': synced,
                    'timestamp': timestamp
                }
                
                messages.append(message_data)
            except Exception as e:
                logging.error(f"Error parsing contact message file {file_path}: {str(e)}")
        
        # Sort messages by created_at date (newest first)
        messages.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return jsonify({
            'success': True,
            'messages': messages,
            'count': len(messages)
        })
    
    except Exception as e:
        logging.error(f"Error fetching contact messages: {str(e)}")
        logging.exception(e)
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}',
            'messages': []
        }), 500

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)

# Log startup
logger.info('Pro-Lance startup')
# On startup
try:
    # Create local submissions directory
    os.makedirs('local_submissions', exist_ok=True)
    os.makedirs('local_submissions/synced', exist_ok=True)
    
    # Run a DNS resolution test at startup
    dns_results = test_dns_resolution(['supabase.com', 'google.com', 'example.com'] + SUPABASE_DOMAINS)
    logger.info(f"DNS resolution test: {dns_results}")
    
    # Run sync within app context
    with app.app_context():
        sync_results = sync_submissions()
        logger.info(f"Startup sync results: {sync_results}")
except Exception as e:
    logger.error(f"Error during startup tasks: {str(e)}")

def submit_to_supabase(data, submission_id=None):
    """Submit data to Supabase with improved error handling and retries"""
    if submission_id is None:
        submission_id = str(uuid.uuid4())
    
    data['id'] = submission_id
    data['created_at'] = datetime.utcnow().isoformat()
    
    # Try each Supabase domain
    for domain in SUPABASE_DOMAINS:
        try:
            api_key = get_api_key_for_domain(domain)
            headers = get_headers_for_domain(domain, api_key)
            
            # Construct the URL with the correct endpoint
            url = f"{domain}/rest/v1/contact_messages"
            
            response = http_session.post(
                url,
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                return True, "Successfully submitted to Supabase"
            
            error_msg = f"Supabase request failed with status {response.status_code}"
            try:
                error_details = response.json()
                if isinstance(error_details, dict):
                    error_msg += f": {error_details.get('message', 'Unknown error')}"
            except:
                error_msg += f": {response.text[:200]}"
            
            logging.error(error_msg)
            return False, error_msg
            
        except requests.exceptions.RequestException as e:
            logging.error(f"Request error for {domain}: {str(e)}")
            continue
    
    return False, "Failed to submit to all Supabase domains"

# Load environment variables
load_dotenv()

# Supabase setup
# Use hardcoded values instead of environment variables
supabase_url = "https://ujarmuwukkbrqetqnqbe.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYXJtdXd1a2ticnFldHFucWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMDI5NzQsImV4cCI6MjA1Nzg3ODk3NH0.qrV-QKWkObeF60zSXG-qwJ94OnvSzkZWKNqbo_QHqac"
supabase: Client = create_client(supabase_url, supabase_key)

# reCAPTCHA Secret Key
recaptcha_secret_key = os.getenv("RECAPTCHA_SECRET_KEY") 