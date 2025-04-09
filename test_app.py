from flask import Flask, jsonify, request, send_from_directory, render_template
import os

app = Flask(__name__, static_folder='.')

# Serve static files
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# Main routes
@app.route('/')
@app.route('/index.html')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/contact.html')
def contact():
    return send_from_directory('.', 'contact.html')

@app.route('/services.html')
def services():
    return send_from_directory('.', 'services.html')

@app.route('/blog.html')
def blog():
    return send_from_directory('.', 'blog.html')

@app.route('/collaboration.html')
def collaboration():
    return send_from_directory('.', 'collaboration.html')

# English routes
@app.route('/en/<path:filename>')
def serve_en(filename):
    return send_from_directory('en', filename)

# Turkish routes
@app.route('/tr/<path:filename>')
def serve_tr(filename):
    return send_from_directory('tr', filename)

# Admin routes
@app.route('/admin/<path:filename>')
def serve_admin(filename):
    return send_from_directory('admin', filename)

# Contact form submission
@app.route('/submit-contact', methods=['GET', 'POST'])
def submit_contact():
    try:
        # Handle both GET and POST requests
        if request.method == 'GET':
            # Extract data from query parameters
            data = {
                'name': request.args.get('name', ''),
                'email': request.args.get('email', ''),
                'phone': request.args.get('phone', ''),
                'subject': request.args.get('subject', ''),
                'message': request.args.get('message', ''),
                'test': request.args.get('test', False)
            }
        else:
            # Extract data from JSON body
            data = request.json
        
        # Log the submission
        print(f"Received contact form submission: {data}")
        
        # Save to local file for testing
        os.makedirs('local_submissions', exist_ok=True)
        with open('local_submissions/latest_submission.json', 'w') as f:
            import json
            json.dump(data, f, indent=2)
        
        # Return success response
        return jsonify({
            'success': True,
            'message': 'Form submitted successfully',
            'data': data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

# Test form route
@app.route('/test-form')
def test_form():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Contact Form Test</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; }
            input, select, textarea { width: 100%; padding: 8px; margin-bottom: 10px; }
            button { background-color: #4CAF50; color: white; padding: 10px 15px; border: none; cursor: pointer; }
            #response { margin-top: 20px; padding: 10px; background-color: #f5f5f5; }
        </style>
    </head>
    <body>
        <h1>Contact Form Test</h1>
        <form id="testForm">
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" required>
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" required>
            </div>
            <div class="form-group">
                <label for="subject">Subject:</label>
                <select id="subject" required>
                    <option value="test">Test Message</option>
                    <option value="general">General Information</option>
                </select>
            </div>
            <div class="form-group">
                <label for="message">Message:</label>
                <textarea id="message" required></textarea>
            </div>
            <button type="submit">Submit Test</button>
        </form>
        <div id="response"></div>
        <script>
            document.getElementById('testForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    subject: document.getElementById('subject').value,
                    message: document.getElementById('message').value,
                    test: true
                };
                try {
                    const response = await fetch('/submit-contact', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                    const result = await response.json();
                    document.getElementById('response').textContent = JSON.stringify(result, null, 2);
                } catch (error) {
                    document.getElementById('response').textContent = 'Error: ' + error.message;
                }
            });
        </script>
    </body>
    </html>
    '''

if __name__ == '__main__':
    app.run(debug=True) 