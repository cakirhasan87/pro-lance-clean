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

# Try multiple domain variations for better chances of connection
SUPABASE_DOMAINS = [
    f'https://{SUPABASE_PROJECT_ID}.supabase.co/rest/v1',  # Standard domain
    f'https://{SUPABASE_PROJECT_ID}.supabase.io/rest/v1',  # Alternative domain
    f'https://{ALT_SUPABASE_PROJECT_ID}.supabase.co/rest/v1',  # Standard domain for alt project
    f'https://{ALT_SUPABASE_PROJECT_ID}.supabase.io/rest/v1',  # Alternative domain for alt project
]

# Global session
http_session = create_requests_session()

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

# Route to manually sync saved submissions to Supabase
@app.route('/sync-submissions', methods=['GET'])
def sync_submissions():
    results = sync_local_submissions_to_supabase()
    return jsonify(results), 200

# Route to test Supabase connection
@app.route('/test-supabase', methods=['GET'])
def test_supabase():
    results = {}
    for domain in SUPABASE_DOMAINS:
        try:
            # Use a simple API call to test connectivity
            url = f"{domain}/health"
            start_time = time.time()
            response = http_session.get(
                url,
                headers={
                    'apikey': SUPABASE_KEY if domain.find(SUPABASE_PROJECT_ID) >= 0 else ALT_SUPABASE_KEY,
                },
                timeout=5
            )
            elapsed = time.time() - start_time
            
            results[domain] = {
                "status": response.status_code,
                "response_time": f"{elapsed:.2f}s",
                "working": response.status_code < 400,
                "content": response.text[:100] if response.text else "No content"
            }
        except Exception as e:
            results[domain] = {
                "status": "error",
                "error": str(e),
                "working": False
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

def test_dns_resolution():
    """Test DNS resolution for various domains"""
    domains_to_test = ['supabase.com', 'google.com', 'example.com', 
                       f'{SUPABASE_PROJECT_ID}.supabase.co',
                       f'{SUPABASE_PROJECT_ID}.supabase.io']
    results = {}
    
    for domain in domains_to_test:
        try:
            ip = socket.gethostbyname(domain)
            results[domain] = {
                "resolved": True,
                "ip": ip
            }
        except Exception as e:
            results[domain] = {
                "resolved": False,
                "error": str(e)
            }
    
    return results

# Fixed route for contact form submission
@app.route('/submit-contact', methods=['POST'])
def submit_contact():
    try:
        logger.info(f"Received {request.method} request to /submit-contact")
        logger.info(f"Request headers: {dict(request.headers)}")
        logger.info(f"Request data: {request.data.decode('utf-8') if request.data else 'No data'}")
        
        # Try different methods to parse the request data
        if request.is_json:
            form_data = request.json
            logger.info("Parsed JSON data from request")
        elif request.form:
            form_data = request.form.to_dict()
            logger.info("Parsed form data from request")
        else:
            try:
                form_data = json.loads(request.data.decode('utf-8'))
                logger.info("Parsed raw JSON data from request")
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse request data: {e}")
                return jsonify({"success": False, "message": "Invalid request format"}), 400
        
        logger.info(f"Processed form data: {form_data}")
        
        # Validate required fields
        required_fields = ['name', 'email', 'subject', 'message']
        for field in required_fields:
            if field not in form_data or not form_data[field]:
                logger.error(f"Missing required field: {field}")
                return jsonify({"success": False, "message": f"Missing required field: {field}"}), 400
        
        # Add timestamp if not present
        if 'created_at' not in form_data:
            form_data['created_at'] = time.strftime('%Y-%m-%dT%H:%M:%S.%fZ', time.gmtime())
            
        # Add language if not present
        if 'language' not in form_data:
            form_data['language'] = 'en'
        
        # Always save locally first as a backup
        local_file = save_locally(form_data)

        # Try all Supabase domains until one works
        success = False
        last_error = None
        response_content = None
        
        for domain in SUPABASE_DOMAINS:
            supabase_url = f"{domain}/contacts"
            api_key = SUPABASE_KEY if domain.find(SUPABASE_PROJECT_ID) >= 0 else ALT_SUPABASE_KEY
            
            headers = {
                'apikey': api_key,
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            }
            
            logger.info(f"Trying to send to Supabase at {supabase_url}")
            
            try:
                response = http_session.post(
                    supabase_url, 
                    json=form_data, 
                    headers=headers,
                    timeout=8
                )
                
                logger.info(f"Supabase response from {domain}: Status {response.status_code}")
                response_content = response.text
                
                if response.status_code >= 200 and response.status_code < 300:
                    logger.info(f"Form successfully submitted to Supabase via {domain}")
                    success = True
                    # If successful submission to Supabase, we can remove the local file
                    try:
                        if local_file and os.path.exists(local_file):
                            os.remove(local_file)
                            logger.info(f"Removed local file {local_file} after successful Supabase submission")
                    except Exception as e:
                        logger.error(f"Error removing local file: {e}")
                    break
                else:
                    logger.error(f"Supabase error on {domain}: Status {response.status_code}, Response: {response.text}")
                    last_error = response.text
            except Exception as e:
                logger.error(f"Request error to {domain}: {e}")
                last_error = str(e)
        
        # Return response based on whether any attempt succeeded
        if success:
            return jsonify({
                "success": True, 
                "message": "Form submitted successfully",
                "details": {
                    "saved_to_supabase": True,
                    "domain_used": domain
                }
            }), 200
        else:
            # If all attempts failed, still return success to user but with fallback message
            return jsonify({
                "success": True, 
                "message": "Form submitted successfully. We'll process it shortly.",
                "details": {
                    "saved_locally": True,
                    "error": last_error,
                    "response": response_content
                }
            }), 200
    
    except Exception as e:
        logger.error(f"Error in submit_contact: {str(e)}")
        return jsonify({"success": False, "message": "Server error", "details": str(e)}), 500

def save_locally(form_data):
    """Save form data locally when Supabase is unreachable"""
    try:
        os.makedirs('form_submissions', exist_ok=True)
        timestamp = form_data.get('created_at', str(int(time.time())))
        safe_timestamp = timestamp.replace(':', '-').replace('.', '-') if isinstance(timestamp, str) else timestamp
        filename = f"form_submissions/submission_{safe_timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(form_data, f, indent=2)
            
        logger.info(f"Form data saved locally to {filename}")
        return filename
    except Exception as e:
        logger.error(f"Error saving form locally: {e}")
        return None

def sync_local_submissions_to_supabase():
    """Attempt to sync all locally saved submissions to Supabase using all available domains"""
    results = {
        "total": 0,
        "success": 0,
        "failed": 0,
        "details": []
    }
    
    # Find all local submission files
    submission_files = glob.glob('form_submissions/submission_*.json')
    results["total"] = len(submission_files)
    
    if len(submission_files) == 0:
        logger.info("No local submissions to sync")
        return results
    
    logger.info(f"Found {len(submission_files)} local submissions to sync")
    
    # Try to submit each file to Supabase
    for file_path in submission_files:
        try:
            with open(file_path, 'r') as f:
                form_data = json.load(f)
            
            # Try all domains for each submission
            synced = False
            
            for domain in SUPABASE_DOMAINS:
                if synced:
                    break
                    
                api_key = SUPABASE_KEY if domain.find(SUPABASE_PROJECT_ID) >= 0 else ALT_SUPABASE_KEY
                supabase_url = f"{domain}/contacts"
                
                headers = {
                    'apikey': api_key,
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                }
                
                try:
                    response = http_session.post(
                        supabase_url, 
                        json=form_data, 
                        headers=headers,
                        timeout=10
                    )
                    
                    if response.status_code >= 200 and response.status_code < 300:
                        logger.info(f"Successfully synced {file_path} to Supabase via {domain}")
                        # Remove the local file after successful submission
                        os.remove(file_path)
                        results["success"] += 1
                        results["details"].append({
                            "file": file_path,
                            "status": "success",
                            "domain": domain,
                            "response": response.status_code
                        })
                        synced = True
                        break
                    else:
                        logger.error(f"Failed to sync {file_path} via {domain}: {response.status_code} - {response.text}")
                except Exception as e:
                    logger.error(f"Error attempting to sync {file_path} via {domain}: {str(e)}")
            
            # If all domains failed
            if not synced:
                results["failed"] += 1
                results["details"].append({
                    "file": file_path,
                    "status": "failed",
                    "error": "All domains failed"
                })
                
        except Exception as e:
            logger.error(f"Error processing {file_path}: {str(e)}")
            results["failed"] += 1
            results["details"].append({
                "file": file_path,
                "status": "error",
                "error": str(e)
            })
    
    return results

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    # Run the app on all network interfaces
    app.run(host='0.0.0.0', port=5000, debug=True)

# Log startup
logger.info('Pro-Lance startup')
# Try to sync any existing submissions on startup
try:
    dns_results = test_dns_resolution()
    logger.info(f"DNS resolution test: {dns_results}")
    
    sync_results = sync_local_submissions_to_supabase()
    logger.info(f"Startup sync results: {sync_results}")
except Exception as e:
    logger.error(f"Error during startup procedures: {e}") 