from flask import Flask, send_from_directory, render_template
import os

app = Flask(__name__, static_folder='.')

# Configure Flask app
app.config.update(
    SECRET_KEY=os.environ.get('SECRET_KEY', 'default-secret-key'),
    DEBUG=False
)

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

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    app.run()

# Log startup
app.logger.info('Pro-Lance startup') 