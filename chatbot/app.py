from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import json
import datetime
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-this')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chatbot.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    avatar = db.Column(db.String(200), default='default.png')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    room_id = db.Column(db.String(50), nullable=False)
    message_type = db.Column(db.String(20), default='text')  # text, image, file
    file_path = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    sender = db.relationship('User', backref=db.backref('messages', lazy=True))

class ChatRoom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('chat'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return jsonify({'success': True, 'redirect': url_for('chat')})
        else:
            return jsonify({'success': False, 'error': 'Invalid username or password'})
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'success': False, 'error': 'Username already exists'})
        
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'error': 'Email already exists'})
        
        # Create new user
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        return jsonify({'success': True, 'redirect': url_for('chat')})
    
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/chat')
@login_required
def chat():
    return render_template('chat.html')

# API Routes
@app.route('/api/messages/<room_id>')
@login_required
def get_messages(room_id):
    messages = Message.query.filter_by(room_id=room_id).order_by(Message.created_at.asc()).all()
    return jsonify([{
        'id': msg.id,
        'content': msg.content,
        'sender': msg.sender.username,
        'sender_id': msg.sender_id,
        'message_type': msg.message_type,
        'file_path': msg.file_path,
        'created_at': msg.created_at.isoformat()
    } for msg in messages])

@app.route('/api/rooms')
@login_required
def get_rooms():
    rooms = ChatRoom.query.filter_by(is_active=True).all()
    return jsonify([{
        'id': room.id,
        'room_id': room.room_id,
        'name': room.name,
        'created_by': room.created_by,
        'created_at': room.created_at.isoformat()
    } for room in rooms])

@app.route('/api/rooms', methods=['POST'])
@login_required
def create_room():
    data = request.get_json()
    room_id = str(uuid.uuid4())
    room = ChatRoom(
        room_id=room_id,
        name=data.get('name', 'New Room'),
        created_by=current_user.id
    )
    db.session.add(room)
    db.session.commit()
    return jsonify({'success': True, 'room_id': room_id})

@app.route('/api/upload', methods=['POST'])
@login_required
def upload_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'})
    
    if file:
        filename = secure_filename(file.filename)
        # Add timestamp to avoid filename conflicts
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{int(datetime.datetime.now().timestamp())}{ext}"
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        return jsonify({
            'success': True,
            'file_path': filename,
            'original_name': file.filename
        })

# Socket.IO Events
@socketio.on('connect')
def handle_connect():
    if current_user.is_authenticated:
        join_room(f'user_{current_user.id}')
        emit('user_connected', {'user_id': current_user.id, 'username': current_user.username})

@socketio.on('disconnect')
def handle_disconnect():
    if current_user.is_authenticated:
        leave_room(f'user_{current_user.id}')

@socketio.on('join_room')
def handle_join_room(data):
    room_id = data['room_id']
    join_room(room_id)
    emit('user_joined', {
        'user_id': current_user.id,
        'username': current_user.username,
        'room_id': room_id
    }, room=room_id)

@socketio.on('leave_room')
def handle_leave_room(data):
    room_id = data['room_id']
    leave_room(room_id)
    emit('user_left', {
        'user_id': current_user.id,
        'username': current_user.username,
        'room_id': room_id
    }, room=room_id)

@socketio.on('send_message')
def handle_send_message(data):
    room_id = data['room_id']
    content = data['content']
    message_type = data.get('message_type', 'text')
    file_path = data.get('file_path')
    
    # Save message to database
    message = Message(
        content=content,
        sender_id=current_user.id,
        room_id=room_id,
        message_type=message_type,
        file_path=file_path
    )
    db.session.add(message)
    db.session.commit()
    
    # Emit message to room
    emit('new_message', {
        'id': message.id,
        'content': content,
        'sender': current_user.username,
        'sender_id': current_user.id,
        'message_type': message_type,
        'file_path': file_path,
        'created_at': message.created_at.isoformat()
    }, room=room_id)

@socketio.on('typing')
def handle_typing(data):
    room_id = data['room_id']
    emit('user_typing', {
        'user_id': current_user.id,
        'username': current_user.username,
        'room_id': room_id
    }, room=room_id)

@socketio.on('stop_typing')
def handle_stop_typing(data):
    room_id = data['room_id']
    emit('user_stop_typing', {
        'user_id': current_user.id,
        'username': current_user.username,
        'room_id': room_id
    }, room=room_id)

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000) 