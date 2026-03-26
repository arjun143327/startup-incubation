from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from extensions import db
import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data or 'full_name' not in data or 'role' not in data:
        return jsonify({"message": "Missing required fields"}), 400

    # Ensure valid role
    if data['role'] not in ['Admin', 'Founder', 'Mentor', 'Investor']:
        return jsonify({"message": "Invalid role"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "User already exists"}), 409

    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        full_name=data['full_name'],
        email=data['email'],
        password_hash=hashed_password,
        role=data['role']
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"message": "Missing email or password"}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"message": "Invalid credentials"}), 401

    if not user.is_active:
        return jsonify({"message": "User account is deactivated"}), 403

    # Include role in JWT claim for RBAC easily
    access_token = create_access_token(
        identity=str(user.user_id),
        additional_claims={"role": user.role},
        expires_delta=datetime.timedelta(hours=24)
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.user_id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    return jsonify({
        "id": user.user_id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active
    }), 200
