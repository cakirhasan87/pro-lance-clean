from flask import Flask, send_from_directory, render_template, request, jsonify, redirect
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
from werkzeug.utils import secure_filename
import shutil

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='.')

# Create required directories
os.makedirs('local_submissions', exist_ok=True)
os.makedirs('local_submissions/synced', exist_ok=True)

# Create uploads directory in flask_app/static
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
uploads_dir = os.path.join(static_dir, 'uploads')
os.makedirs(static_dir, exist_ok=True)
os.makedirs(uploads_dir, exist_ok=True)

# Configure Flask app
app.config.update(
    SECRET_KEY=os.environ.get('SECRET_KEY', 'default-secret-key'),
    DEBUG=True,  # Enable debug mode for better error messages
    UPLOAD_FOLDER=uploads_dir
)

# Move admin directory to flask_app directory
import shutil
import os

# Create admin directory in flask_app if it doesn't exist
admin_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'admin')
os.makedirs(admin_dir, exist_ok=True)

# Copy admin files if they don't exist in flask_app/admin
source_admin_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'admin')
if os.path.exists(source_admin_dir):
    for file in os.listdir(source_admin_dir):
        source_file = os.path.join(source_admin_dir, file)
        dest_file = os.path.join(admin_dir, file)
        if not os.path.exists(dest_file):
            shutil.copy2(source_file, dest_file)

# CORS headers to allow requests from any origin
@app.before_request
def log_request_info():
    logger.info(f"Request: {request.method} {request.path} - IP: {request.remote_addr}")

@app.after_request
def log_response_info(response):
    logger.info(f"Response: {request.method} {request.path} - Status: {response.status_code}")
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.errorhandler(Exception)
def handle_unhandled_exception(e):
    logger.error(f"Unhandled Exception: {str(e)}", exc_info=True)
    return render_template('500.html'), 500

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

# Supabase URLs
SUPABASE_URL = f'https://{SUPABASE_PROJECT_ID}.supabase.co/rest/v1'
SUPABASE_DOMAINS = [
    SUPABASE_URL,  # Main REST API URL
    f'https://{SUPABASE_PROJECT_ID}.supabase.co',  # Project URL
    f'https://db.{SUPABASE_PROJECT_ID}.supabase.co'  # Database URL
]

# Configure session for requests
session = requests.Session()
session.headers.update({
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
})

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
            
            response = session.get(
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
    """Handle contact form submission"""
    try:
        # Get form data
        data = {
            'name': request.form.get('name'),
            'email': request.form.get('email'),
            'phone': request.form.get('phone'),
            'subject': request.form.get('subject'),
            'message': request.form.get('message'),
            'created_at': datetime.utcnow().isoformat(),
            'is_read': False
        }

        # Validate required fields
        required_fields = ['name', 'email', 'subject', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400

        # Insert into Supabase
        response = session.post(
            f'{SUPABASE_URL}/contact_messages',
            json=data
        )

        if response.status_code != 201:
            # Save locally if Supabase insert fails
            submission_id = str(uuid.uuid4())
            save_locally(data, submission_id)
            
            return jsonify({
                'success': True,
                'message': 'Message saved locally. Will be synced when connection is restored.'
            })

        return jsonify({
            'success': True,
            'message': 'Message sent successfully'
        })

    except Exception as e:
        logger.error(f'Error in submit_contact: {str(e)}')
        # Save locally on any error
        submission_id = str(uuid.uuid4())
        save_locally(data, submission_id)
        
        return jsonify({
            'success': True,
            'message': 'Message saved locally. Will be synced when connection is restored.'
        })

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
                
            # Construct the request URL - using the correct table name
            request_url = f"{domain}/contact_messages"
            
            # Log attempt
            logging.info(f"Attempting Supabase submission to {domain}")
            start_time = time.time()
            
            # Make the request with a timeout
            headers = {
                'apikey': supabase_key,
                'Authorization': f'Bearer {supabase_key}',
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            }
            
            # Include test flag in request data if applicable
            request_data = {**data, 'id': submission_id}
            if is_test:
                request_data['is_test'] = True
            
            # Make the request with a timeout
            response = requests.post(
                request_url,
                json=request_data,
                headers=headers,
                timeout=10
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
                
        except requests.exceptions.ConnectTimeout:
            result['error'] = 'Connection timeout'
            result['message'] = f'Connection to {domain} timed out'
            logging.warning(f"Supabase connection timeout ({domain})")
            
        except requests.exceptions.ConnectionError as e:
            result['error'] = f'Connection error: {str(e)}'
            result['message'] = f'Cannot connect to {domain}'
            logging.warning(f"Supabase connection error ({domain}): {str(e)}")
            
        except Exception as e:
            result['error'] = str(e)
            result['message'] = f'Error connecting to {domain}: {str(e)}'
            logging.error(f"Supabase submission error ({domain}): {str(e)}")
            logging.exception(e)
    
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
    """Test Supabase connection and return detailed diagnostics"""
    results = {
        'success': False,
        'message': '',
        'domains_tested': [],
        'working_domain': None,
        'error': None
    }
    
    for domain in SUPABASE_DOMAINS:
        domain_result = {
            'domain': domain,
            'success': False,
            'status_code': None,
            'error': None
        }
        
        try:
            api_key = get_api_key_for_domain(domain)
            if not api_key:
                domain_result['error'] = 'No API key available'
                results['domains_tested'].append(domain_result)
                continue
            
            # Test connection with a simple query
            response = requests.get(
                f"{domain}/blog_posts?select=count",
                headers={
                    'apikey': api_key,
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json',
                    'Prefer': 'count=exact'
                },
                timeout=5
            )
            
            domain_result['status_code'] = response.status_code
            
            if response.status_code in [200, 201, 204]:
                domain_result['success'] = True
                results['working_domain'] = domain
                results['success'] = True
                results['message'] = f'Successfully connected to {domain}'
                break
            else:
                domain_result['error'] = f'Server returned status code {response.status_code}'
                
        except requests.exceptions.RequestException as e:
            domain_result['error'] = str(e)
        except Exception as e:
            domain_result['error'] = str(e)
            
        results['domains_tested'].append(domain_result)
    
    if not results['success']:
        results['message'] = 'Failed to connect to any Supabase domain'
        results['error'] = 'All connection attempts failed'
    
    return jsonify(results)

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

@app.route('/api/blog-posts')
def get_blog_posts_redirect():
    """Redirect old blog posts endpoint to new one"""
    return redirect('/api/blog/posts')

@app.route('/js/admin-chat-config.js')
def admin_chat_config():
    """Serve admin chat configuration"""
    return send_from_directory('admin', 'admin-chat-config.js')

@app.route('/api/contact-messages')
def get_contact_messages():
    """Get all contact messages from Supabase"""
    try:
        response = session.get(
            f"{SUPABASE_URL}/contact_messages?select=*&order=created_at.desc",
            timeout=10
        )
        
        if response.status_code == 200:
            messages = response.json()
            return jsonify({
                'success': True,
                'message': 'Messages retrieved successfully',
                'messages': messages
            })
        else:
            raise Exception(f"Server returned status code {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Request error: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e),
            'messages': []
        }), 500
    except Exception as e:
        app.logger.error(f"Error fetching messages: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e),
            'messages': []
        }), 500

@app.route('/admin/contact-messages.html')
def admin_contact_messages():
    """Serve the admin contact messages page"""
    return send_from_directory('admin', 'contact-messages.html')

@app.route('/sync-message/<message_id>', methods=['POST'])
def sync_message(message_id):
    """Sync a specific message to Supabase"""
    try:
        # Find the message file
        message_file = None
        for file_pattern in ['local_submissions/contact_*.json', 'local_submissions/synced/contact_*.json']:
            for file_path in glob.glob(file_pattern):
                if message_id in file_path:
                    message_file = file_path
                    break
            if message_file:
                break
        
        if not message_file:
            return jsonify({
                'success': False,
                'message': 'Message not found'
            }), 404
        
        # Load the message data
        with open(message_file, 'r') as f:
            data = json.load(f)
        
        # Try to sync to Supabase
        supabase_result = submit_to_supabase_with_details(data, message_id)
        
        if supabase_result['success']:
            # Move file to synced directory if it's not already there
            if 'synced' not in message_file:
                os.makedirs('local_submissions/synced', exist_ok=True)
                new_path = os.path.join('local_submissions/synced', os.path.basename(message_file))
                os.rename(message_file, new_path)
            
            return jsonify({
                'success': True,
                'message': 'Message synced successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': supabase_result['message']
            }), 500
            
    except Exception as e:
        logging.error(f"Error syncing message {message_id}: {str(e)}")
        logging.exception(e)
        return jsonify({
            'success': False,
            'message': f'Error syncing message: {str(e)}'
        }), 500

@app.route('/api/mark-as-read/<message_id>', methods=['POST'])
def mark_as_read(message_id):
    """Mark a message as read in Supabase"""
    try:
        success = False
        error_message = None
        
        for domain in SUPABASE_DOMAINS:
            try:
                api_key = get_api_key_for_domain(domain)
                if not api_key:
                    continue
                
                # Update message status in Supabase - using the correct table name 'contact_messages'
                response = session.patch(
                    f"{domain}/contact_messages?id=eq.{message_id}",
                    json={'status': 'read'},
                    headers={
                        'apikey': api_key,
                        'Authorization': f'Bearer {api_key}',
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    timeout=10
                )
                
                if response.status_code in [200, 204]:
                    success = True
                    break
                else:
                    error_message = f"Supabase returned status code {response.status_code}"
                    
            except Exception as e:
                error_message = f"Error connecting to Supabase: {str(e)}"
                continue
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Message marked as read'
            })
        else:
            return jsonify({
                'success': False,
                'message': error_message or "Could not connect to any Supabase endpoint"
            }), 500
            
    except Exception as e:
        logging.error(f"Error marking message as read: {str(e)}")
        logging.exception(e)
        return jsonify({
            'success': False,
            'message': f'Error marking message as read: {str(e)}'
        }), 500

@app.route('/list-local-submissions')
def list_local_submissions():
    try:
        # Get all JSON files from local_submissions directory
        local_files = glob('local_submissions/*.json')
        synced_files = glob('local_submissions/synced/*.json')
        all_files = local_files + synced_files
        
        submissions = []
        for file_path in all_files:
            try:
                with open(file_path, 'r') as f:
                    submission = json.load(f)
                    # Add file path for reference
                    submission['file_path'] = file_path
                    submission['id'] = os.path.basename(file_path).replace('.json', '')
                    submissions.append(submission)
            except Exception as e:
                print(f"Error reading file {file_path}: {str(e)}")
                continue
        
        return jsonify({
            'success': True,
            'submissions': submissions
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/admin/<path:filename>')
def serve_admin(filename):
    """Serve files from the admin directory"""
    admin_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'admin')
    return send_from_directory(admin_dir, filename)

@app.route('/admin/blog-editor')
@app.route('/admin/blog-editor.html')
def blog_editor():
    """Serve the blog editor page"""
    admin_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'admin')
    return send_from_directory(admin_dir, 'blog-editor.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

# Serve static files
@app.route('/static/<path:filename>')
def serve_static_files(filename):
    """Serve files from the static directory"""
    return send_from_directory('static', filename)

@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Initialize Supabase client
def get_supabase_client():
    """Get a working Supabase client"""
    try:
        # Test the connection with proper error handling
        response = requests.get(
            f"{SUPABASE_URL}/blog_posts?select=count",
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Content-Type': 'application/json',
                'Prefer': 'count=exact'
            },
            timeout=10,
            verify=True  # Ensure SSL verification
        )
        
        if response.status_code in [200, 201, 204]:
            app.logger.info(f"Successfully connected to Supabase")
            return SUPABASE_URL, SUPABASE_KEY
        else:
            app.logger.warning(f"Failed to connect to Supabase: Status code {response.status_code}")
            raise Exception(f"Supabase returned status code {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Connection error: {str(e)}")
        raise Exception(f"Failed to connect to Supabase: {str(e)}")
    except Exception as e:
        app.logger.error(f"Error in get_supabase_client: {str(e)}")
        raise Exception(f"Unexpected error: {str(e)}")

@app.route('/api/blog/posts', methods=['GET'])
def get_blog_posts():
    """Get all blog posts"""
    try:
        response = session.get(
            f"{SUPABASE_URL}/blog_posts?select=*&order=created_at.desc",
            timeout=10
        )
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            raise Exception(f"Server returned status code {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Request error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        app.logger.error(f"Error fetching blog posts: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/posts', methods=['POST'])
def create_blog_post():
    """Create a new blog post"""
    try:
        domain, api_key = get_supabase_client()
        if not domain or not api_key:
            raise Exception("Could not connect to Supabase")

        # Get form data
        title = request.form.get('title')
        content = request.form.get('content')
        status = request.form.get('status', 'draft')
        
        # Handle thumbnail upload
        thumbnail = None
        if 'thumbnail' in request.files:
            file = request.files['thumbnail']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                file.save(filepath)
                thumbnail = f"/uploads/{filename}"
        
        # Create post in Supabase
        post_data = {
            'title': title,
            'content': content,
            'status': status,
            'thumbnail': thumbnail,
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Try each Supabase domain until one works
        for domain in SUPABASE_DOMAINS:
            try:
                api_key = get_api_key_for_domain(domain)
                if not api_key:
                    continue
                
                response = requests.post(
                    f"{domain}/blog_posts",
                    json=post_data,
                    headers={
                        'apikey': api_key,
                        'Authorization': f'Bearer {api_key}',
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    timeout=10
                )
                
                if response.status_code in [200, 201]:
                    return jsonify(response.json()[0])
            except Exception as e:
                app.logger.warning(f"Failed to create post using {domain}: {str(e)}")
                continue
        
        raise Exception("Failed to create blog post on any Supabase domain")
    except Exception as e:
        app.logger.error(f"Error creating blog post: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/posts/<post_id>', methods=['PUT'])
def update_blog_post(post_id):
    """Update a blog post"""
    try:
        domain, api_key = get_supabase_client()
        if not domain or not api_key:
            raise Exception("Could not connect to Supabase")

        # Get form data
        title = request.form.get('title')
        content = request.form.get('content')
        status = request.form.get('status')
        
        # Handle thumbnail upload
        thumbnail = None
        if 'thumbnail' in request.files:
            file = request.files['thumbnail']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                thumbnail = f"/uploads/{filename}"
        
        # Update post in Supabase
        update_data = {
            'title': title,
            'content': content,
            'status': status,
            'updated_at': datetime.utcnow().isoformat()
        }
        if thumbnail:
            update_data['thumbnail'] = thumbnail
        
        response = requests.patch(
            f"{domain}/blog_posts?id=eq.{post_id}",
            json=update_data,
            headers={
                'apikey': api_key,
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        )
        
        if response.status_code in [200, 201]:
            return jsonify(response.json()[0])
        else:
            raise Exception(f"Supabase returned status code {response.status_code}")
    except Exception as e:
        app.logger.error(f"Error updating blog post: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/blog/posts/<post_id>', methods=['DELETE'])
def delete_blog_post(post_id):
    """Delete a blog post"""
    try:
        domain, api_key = get_supabase_client()
        if not domain or not api_key:
            raise Exception("Could not connect to Supabase")

        response = requests.delete(
            f"{domain}/blog_posts?id=eq.{post_id}",
            headers={
                'apikey': api_key,
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
        )
        
        if response.status_code in [200, 204]:
            return jsonify({'message': 'Blog post deleted successfully'})
        else:
            raise Exception(f"Supabase returned status code {response.status_code}")
    except Exception as e:
        app.logger.error(f"Error deleting blog post: {str(e)}")
        return jsonify({'error': str(e)}), 500

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

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

    # Create blog_posts table if it doesn't exist
    try:
        supabase.table('blog_posts').select('*').limit(1).execute()
    except Exception as e:
        if 'relation "blog_posts" does not exist' in str(e):
            # Create the table
            supabase.query("""
                CREATE TABLE IF NOT EXISTS blog_posts (
                    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'draft',
                    thumbnail TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE
                );
                
                -- Add RLS policies
                ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
                
                -- Allow read access to all authenticated users
                CREATE POLICY "Allow read access to all authenticated users"
                    ON blog_posts FOR SELECT
                    USING (auth.role() = 'authenticated');
                
                -- Allow full access to authenticated users
                CREATE POLICY "Allow full access to authenticated users"
                    ON blog_posts FOR ALL
                    USING (auth.role() = 'authenticated')
                    WITH CHECK (auth.role() = 'authenticated');
            """).execute()
            app.logger.info("Created blog_posts table")
except Exception as e:
    logger.error(f"Error during startup tasks: {str(e)}") 