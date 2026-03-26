from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.startup import Startup
from extensions import db

startup_bp = Blueprint('startup', __name__, url_prefix='/api/startups')

@startup_bp.route('/', methods=['POST'])
@jwt_required()
def create_application():
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    
    if claims.get('role') != 'Founder':
        return jsonify({"message": "Only founders can submit applications"}), 403

    data = request.get_json()
    
    new_startup = Startup(
        founder_id=user_id,
        company_name=data.get('company_name'),
        industry_sector=data.get('industry_sector'),
        idea_description=data.get('idea_description'),
        pitch_deck_url=data.get('pitch_deck_url'),
        status='Submitted'
    )
    
    db.session.add(new_startup)
    db.session.commit()
    
    return jsonify({"message": "Application submitted successfully", "startup_id": new_startup.startup_id}), 201

@startup_bp.route('/', methods=['GET'])
@jwt_required()
def get_startups():
    user_id = int(get_jwt_identity())
    claims = get_jwt()
    
    if claims.get('role') == 'Admin':
        startups = Startup.query.all()
    elif claims.get('role') == 'Founder':
        startups = Startup.query.filter_by(founder_id=user_id).all()
    else:
        startups = Startup.query.filter(Startup.status.in_(['Accepted', 'Active'])).all()
        
    result = []
    for s in startups:
        result.append({
            "startup_id": s.startup_id,
            "company_name": s.company_name,
            "industry_sector": s.industry_sector,
            "status": s.status,
            "cohort_id": s.cohort_id
        })
    return jsonify(result), 200

@startup_bp.route('/<int:startup_id>/evaluate', methods=['PUT'])
@jwt_required()
def evaluate_startup(startup_id):
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"message": "Only admins can evaluate"}), 403

    startup = Startup.query.get_or_404(startup_id)
    data = request.get_json()
    new_status = data.get('status')
    
    if new_status in ['Under Review', 'Accepted', 'Rejected']:
        startup.status = new_status
        db.session.commit()
        return jsonify({"message": f"Startup status updated to {new_status}"}), 200
        
    return jsonify({"message": "Invalid status"}), 400
