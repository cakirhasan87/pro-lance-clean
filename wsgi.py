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
import threading
from urllib.parse import urlparse

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='.')

# Configure Flask app
app.config.update(
    SECRET_KEY=os.environ.get('SECRET_KEY', 'default-secret-key'),
    DEBUG=True  # Enable debug mode for better error messages
)

# CORS headers to allow requests from any origin
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

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

# Supabase configuration with both domain options (will try all until one works)
SUPABASE_PROJECT_ID = 'yvgnrzsdlvofxrjhjawh'  # Original project ID
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2Z25yenNkbHZvZnhyamhqYXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc2OTAyMDksImV4cCI6MjAzMzI2NjIwOX0.bJVIhtgaM6HhqnJ3nZ3SKDkGGk1A-sI01JO9lDhNeTU'

# Alternative project ID as fallback
ALT_SUPABASE_PROJECT_ID = 'dslfetbnvbhrdxvkuhzq'
ALT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbGZldGJudmJocmR4dmt1aHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyOTA5ODIsImV4cCI6MjAzMTg2Njk4Mn0.TQXPQKmkP2wr-EuF6BwR-D6mSOWKKtl1yJkQhXX1-ko'

# New direct Supabase project ID and key for updated access
NEW_SUPABASE_PROJECT_ID = 'hhudczwbcjejxvbxglkv'
NEW_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodWRjendiejZqZWp4dmJ4Z2xrdiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzA5NzQ3MTU3LCJleHAiOjIwMjUzMjMxNTd9.P_C70m_yEY0H9M72_QvEVX-HSY0nPipJrWpvrdmxQ0M'

# Add DNS resolution improvements at the top of the file (just after imports)
import socket
socket.setdefaulttimeout(20)  # Increase timeout for connections

# Update SUPABASE_DOMAINS with direct IPs
SUPABASE_DOMAINS = [
    # Direct IP addresses for Supabase
    'https://104.18.38.10/rest/v1',
    'https://172.64.149.246/rest/v1',
    
    # Original domains as fallback
    f'https://{NEW_SUPABASE_PROJECT_ID}.supabase.co/rest/v1',
    f'https://{SUPABASE_PROJECT_ID}.supabase.co/rest/v1',
    f'https://{ALT_SUPABASE_PROJECT_ID}.supabase.co/rest/v1',
    f'https://{NEW_SUPABASE_PROJECT_ID}.pooler.supabase.com:6543/rest/v1',
]

# Function to get the appropriate API key based on the domain
def get_api_key_for_domain(domain):
    if NEW_SUPABASE_PROJECT_ID in domain:
        return NEW_SUPABASE_KEY
    elif SUPABASE_PROJECT_ID in domain:
        return SUPABASE_KEY
    elif ALT_SUPABASE_PROJECT_ID in domain:
        return ALT_SUPABASE_KEY
    else:
        # Default to main key if domain pattern not recognized
        return NEW_SUPABASE_KEY  # Use the new key as default

# Global session with increased timeout and retries
http_session = create_requests_session(retries=7, backoff_factor=0.5)

# Modify request headers to include Host header when using direct IPs
def get_headers_for_domain(domain, api_key):
    """Get appropriate headers for the domain, including Host header for IPs"""
    headers = {
        'apikey': api_key,
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    # Add Host header for IP addresses
    if domain.startswith('https://104.18.38.10') or domain.startswith('https://172.64.149.246'):
        headers['Host'] = 'drxstcmoroaupedsynhq.supabase.co'
    
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
    """Submit contact form data to Supabase"""
    try:
        # Get the form data from the request
        data = request.json
        
        # Log received data
        logging.info(f"Received contact form submission: {data}")
        
        # Create a unique ID for the submission
        submission_id = str(uuid.uuid4())
        
        # Add created_at if it doesn't exist
        if 'created_at' not in data:
            data['created_at'] = datetime.now().isoformat()
            
        # Save locally regardless of Supabase availability
        # This ensures we don't lose data if Supabase is down
        save_locally(data, submission_id)
        
        # Mark if this is a test submission
        is_test = data.get('test', False)
        
        # Attempt to submit to Supabase with detailed error handling
        supabase_result = submit_to_supabase_with_details(data, submission_id, is_test)
        
        # Build response with detailed information
        response = {
            'success': True,
            'message': 'Form submitted successfully',
            'id': submission_id,
            'local_save': True,
            'supabase': supabase_result
        }
        
        return jsonify(response)
    
    except Exception as e:
        logging.error(f"Error processing contact form: {str(e)}")
        logging.exception(e)
        return jsonify({
            'success': False,
            'message': f'Error processing request: {str(e)}',
            'local_save': False
        }), 500

def submit_to_supabase_with_details(data, submission_id, is_test=False):
    """
    Submit data to Supabase with detailed error information
    Returns a dictionary with detailed success/failure information
    """
    result = {
        'success': False,
        'attempted': False,
        'message': 'No attempt made',
        'domain_tried': None,
        'response_code': None,
        'response_text': None,
        'error': None,
        'elapsed_ms': 0
    }
    
    # Try each Supabase domain
    for domain in SUPABASE_DOMAINS:
        try:
            result['domain_tried'] = domain
            result['attempted'] = True
            
            # Determine which key to use based on domain
            supabase_key = get_api_key_for_domain(domain)
            
            if not supabase_key:
                result['message'] = f'No API key available for domain {domain}'
                continue
                
            # Construct the request URL
            request_url = f"{domain}/contact_messages"
            
            # Log attempt
            logging.info(f"Attempting Supabase submission to {request_url}")
            start_time = time.time()
            
            # Include test flag in request data if applicable
            request_data = {**data, 'id': submission_id}
            if is_test:
                request_data['is_test'] = True

            # Make the request with a timeout and better error handling
            try:
                headers = get_headers_for_domain(domain, supabase_key)
                logging.info(f"Sending request to {request_url} with data: {request_data}")
                
                response = requests.post(
                    request_url,
                    json=request_data,
                    headers=headers,
                    timeout=15,
                    verify=True  # SSL verification
                )
                
                # Calculate elapsed time
                elapsed_time = time.time() - start_time
                result['elapsed_ms'] = int(elapsed_time * 1000)
                
                # Record response details
                result['response_code'] = response.status_code
                
                # Limit response text size to avoid huge logs
                response_text = response.text[:500]
                result['response_text'] = response_text
                
                # Check if the request was successful
                if response.status_code in [200, 201, 204]:
                    result['success'] = True
                    result['message'] = 'Successfully submitted to Supabase'
                    logging.info(f"Successfully submitted to Supabase ({domain}) in {result['elapsed_ms']}ms")
                    return result
                else:
                    result['message'] = f'Supabase returned status code {response.status_code}'
                    logging.warning(f"Supabase submission failed ({domain}): {response.status_code} - {response_text}")
            
            except requests.exceptions.RequestException as e:
                result['error'] = f'Request error: {str(e)}'
                result['message'] = f'Error making request to {domain}: {str(e)}'
                logging.error(f"Supabase request error ({domain}): {str(e)}")
                
            except Exception as e:
                result['error'] = str(e)
                result['message'] = f'Error connecting to {domain}: {str(e)}'
                logging.error(f"Supabase submission error ({domain}): {str(e)}")
                logging.exception(e)
            
        except requests.exceptions.ConnectTimeout:
            result['error'] = 'Connection timeout'
            result['message'] = f'Connection to {domain} timed out'
            logging.warning(f"Supabase connection timeout ({domain})")
            
        except requests.exceptions.ConnectionError as e:
            result['error'] = f'Connection error: {str(e)}'
            result['message'] = f'Cannot connect to {domain}'
            logging.warning(f"Supabase connection error ({domain}): {str(e)}")
            
    # If we've tried all domains and none worked, update the message
    if result['attempted']:
        result['message'] = f"Tried all Supabase domains, last error: {result['message']}"
    
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

@app.route('/test-validation')
def test_validation():
    return send_from_directory('.', 'test-validation.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

# Add background sync functionality
def background_sync_thread():
    """Background thread that syncs local submissions to Supabase"""
    while True:
        try:
            # Sleep for a while before syncing
            time.sleep(300)  # 5 minutes
            
            # Log sync attempt
            logging.info("Running background sync of local submissions...")
            
            # Get all local submission files
            local_dir = 'local_submissions'
            if not os.path.exists(local_dir):
                logging.info("No local submissions directory found")
                continue
                
            # Find all submission files
            submission_files = glob.glob(os.path.join(local_dir, 'contact_*.json'))
            if not submission_files:
                logging.info("No local submissions found to sync")
                continue
                
            # Count stats
            total_files = len(submission_files)
            synced_files = 0
            failed_files = 0
            
            logging.info(f"Found {total_files} local submissions to sync")
            
            # Process each file
            for file_path in submission_files:
                try:
                    # Load the submission data
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                    
                    # Extract submission ID from filename
                    submission_id = os.path.basename(file_path).split('_')[-1].split('.')[0]
                    
                    # Try direct API call with simplified approach and SSL verification disabled
                    result = direct_supabase_post(data, submission_id)
                    
                    if result['success']:
                        # Move file to synced directory
                        synced_dir = os.path.join(local_dir, 'synced')
                        os.makedirs(synced_dir, exist_ok=True)
                        new_path = os.path.join(synced_dir, os.path.basename(file_path))
                        os.rename(file_path, new_path)
                        
                        synced_files += 1
                        logging.info(f"Successfully synced {file_path} to Supabase")
                    else:
                        failed_files += 1
                        logging.warning(f"Failed to sync {file_path}: {result['message']}")
                        
                except Exception as e:
                    failed_files += 1
                    logging.error(f"Error processing {file_path}: {str(e)}")
            
            logging.info(f"Sync completed: {synced_files} synced, {failed_files} failed out of {total_files} total")
            
        except Exception as e:
            logging.error(f"Error in background sync thread: {str(e)}")
            logging.exception(e)

def direct_supabase_post(data, submission_id=None):
    """Direct API call to Supabase with simplified approach and SSL verification disabled"""
    result = {
        'success': False,
        'message': 'No attempt made'
    }
    
    try:
        # Use the correct domain
        api_url = 'https://drxstcmoroaupedsynhq.supabase.co/rest/v1/contact_messages'
        api_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHN0Y21vcm9hdXBlZHN5bmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTA2NDAsImV4cCI6MjA1ODM4NjY0MH0.9AjInAaxWnYesZ_UuDOKtJVfVNO_RetqMmvZsCql11k'
        
        headers = {
            'apikey': api_key,
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        # Ensure we have an ID
        request_data = data.copy()
        if submission_id:
            request_data['id'] = submission_id
        
        # Make the request with SSL verification disabled
        response = requests.post(
            api_url,
            json=request_data,
            headers=headers,
            timeout=30,
            verify=False  # Disable SSL verification as a last resort
        )
        
        if response.status_code in [200, 201, 204]:
            result['success'] = True
            result['message'] = f'Successfully submitted (Status: {response.status_code})'
        else:
            result['message'] = f'API Error: {response.status_code} - {response.text[:200]}'
            
    except Exception as e:
        result['message'] = f'Exception: {str(e)}'
        
    return result

# Start background sync thread when app starts
def start_background_sync():
    # Disable SSL warnings since we're using verify=False
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    # Start the background thread
    sync_thread = threading.Thread(target=background_sync_thread, daemon=True)
    sync_thread.start()
    logging.info("Background sync thread started")

# Initialize the background sync when the app is created
with app.app_context():
    start_background_sync()

# Add a route to manually trigger sync
@app.route('/trigger-sync', methods=['GET'])
def trigger_sync():
    """Manually trigger a sync of local submissions to Supabase"""
    try:
        # Find all local submission files
        local_dir = 'local_submissions'
        if not os.path.exists(local_dir):
            return jsonify({'success': False, 'message': 'No local submissions directory found'})
            
        # Find all submission files
        submission_files = glob.glob(os.path.join(local_dir, 'contact_*.json'))
        if not submission_files:
            return jsonify({'success': True, 'message': 'No local submissions found to sync'})
            
        # Count stats
        total_files = len(submission_files)
        synced_files = 0
        failed_files = 0
        results = []
        
        # Process each file
        for file_path in submission_files:
            try:
                # Load the submission data
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                # Extract submission ID from filename
                submission_id = os.path.basename(file_path).split('_')[-1].split('.')[0]
                
                # Try direct API call with simplified approach
                result = direct_supabase_post(data, submission_id)
                result['file'] = os.path.basename(file_path)
                
                if result['success']:
                    # Move file to synced directory
                    synced_dir = os.path.join(local_dir, 'synced')
                    os.makedirs(synced_dir, exist_ok=True)
                    new_path = os.path.join(synced_dir, os.path.basename(file_path))
                    os.rename(file_path, new_path)
                    
                    synced_files += 1
                    result['moved_to'] = new_path
                else:
                    failed_files += 1
                    
                results.append(result)
                    
            except Exception as e:
                failed_files += 1
                results.append({
                    'file': os.path.basename(file_path),
                    'success': False,
                    'message': f'Error: {str(e)}'
                })
        
        return jsonify({
            'success': True,
            'total': total_files,
            'synced': synced_files,
            'failed': failed_files,
            'results': results
        })
        
    except Exception as e:
        logging.error(f"Error in manual sync: {str(e)}")
        logging.exception(e)
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

if __name__ == '__main__':
    # Run the app on all network interfaces
    app.run(host='0.0.0.0', port=5000, debug=True)

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