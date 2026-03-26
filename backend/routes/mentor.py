from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.mentor import Mentor, MentoringSession
from extensions import db

mentor_bp = Blueprint('mentor', __name__, url_prefix='/api/mentors')

@mentor_bp.route('/', methods=['GET'])
@jwt_required()
def get_mentors():
    mentors = Mentor.query.all()
    result = []
    for m in mentors:
        result.append({
            "mentor_id": m.mentor_id,
            "user_id": m.user_id,
            "domain_expertise": m.domain_expertise
        })
    return jsonify(result), 200

@mentor_bp.route('/sessions', methods=['POST'])
@jwt_required()
def book_session():
    claims = get_jwt()
    if claims.get('role') not in ['Founder', 'Admin']:
        return jsonify({"message": "Not authorized to book sessions"}), 403

    data = request.get_json()
    new_session = MentoringSession(
        startup_id=data.get('startup_id'),
        mentor_id=data.get('mentor_id'),
        session_date=data.get('session_date'),
        mode=data.get('mode', 'Online'),
        status='Scheduled'
    )
    db.session.add(new_session)
    db.session.commit()
    
    return jsonify({"message": "Session booked", "session_id": new_session.session_id}), 201

@mentor_bp.route('/sessions/<int:session_id>/feedback', methods=['PUT'])
@jwt_required()
def provide_feedback(session_id):
    claims = get_jwt()
    role = claims.get('role')
    
    session_obj = MentoringSession.query.get_or_404(session_id)
    data = request.get_json()
    
    if role == 'Founder':
        session_obj.founder_rating = data.get('rating')
    elif role == 'Mentor':
        session_obj.mentor_rating = data.get('rating')
        session_obj.notes = data.get('notes', session_obj.notes)
    
    session_obj.status = 'Completed'
    db.session.commit()
    
    return jsonify({"message": "Feedback submitted successfully"}), 200
