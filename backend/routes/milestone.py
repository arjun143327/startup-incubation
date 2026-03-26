from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.milestone import Milestone, StartupMilestone
from models.startup import Startup
from extensions import db

milestone_bp = Blueprint('milestone', __name__, url_prefix='/api/milestones')

@milestone_bp.route('/', methods=['POST'])
@jwt_required()
def create_milestone():
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"message": "Only admins can create milestones"}), 403

    data = request.get_json()
    new_milestone = Milestone(
        cohort_id=data.get('cohort_id'),
        title=data.get('title'),
        description=data.get('description'),
        deadline=data.get('deadline')
    )
    db.session.add(new_milestone)
    db.session.commit()
    
    return jsonify({"message": "Milestone created", "milestone_id": new_milestone.milestone_id}), 201

@milestone_bp.route('/<int:milestone_id>/submit', methods=['PUT'])
@jwt_required()
def submit_milestone(milestone_id):
    claims = get_jwt()
    if claims.get('role') != 'Founder':
        return jsonify({"message": "Only founders can submit evidence"}), 403

    data = request.get_json()
    startup_id = data.get('startup_id')
    
    sm = StartupMilestone.query.filter_by(startup_id=startup_id, milestone_id=milestone_id).first()
    if not sm:
        return jsonify({"message": "Milestone not assigned to this startup"}), 404
        
    sm.status = data.get('status', 'In Progress')
    if 'evidence_url' in data:
        sm.evidence_url = data['evidence_url']
        
    db.session.commit()
    return jsonify({"message": "Milestone progress updated"}), 200

@milestone_bp.route('/<int:startup_milestone_id>/approve', methods=['PUT'])
@jwt_required()
def approve_milestone(startup_milestone_id):
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"message": "Only admins can approve milestones"}), 403

    sm = StartupMilestone.query.get_or_404(startup_milestone_id)
    sm.admin_approved = request.json.get('admin_approved', True)
    db.session.commit()
    
    return jsonify({"message": "Milestone approval status updated"}), 200


@milestone_bp.route('/startup/<int:startup_id>', methods=['GET'])
@jwt_required()
def get_startup_milestones(startup_id):
    """
    Returns StartupMilestone rows for the given startup, including Milestone details.
    - Admin can access any startup
    - Founder can access only their own startups
    """
    claims = get_jwt()
    role = claims.get('role')
    user_id = get_jwt_identity()

    if role not in ['Admin', 'Founder']:
        return jsonify({"message": "Unauthorized"}), 403

    startup = Startup.query.get_or_404(startup_id)
    if role == 'Founder' and startup.founder_id != user_id:
        return jsonify({"message": "Forbidden"}), 403

    sms = StartupMilestone.query.filter_by(startup_id=startup_id).all()
    result = []
    for sm in sms:
        milestone = Milestone.query.get(sm.milestone_id)
        if not milestone:
            continue
        result.append({
            "startup_milestone_id": sm.startup_milestone_id,
            "milestone_id": sm.milestone_id,
            "milestone_title": milestone.title,
            "deadline": milestone.deadline.isoformat() if milestone.deadline else None,
            "status": sm.status,
            "evidence_url": sm.evidence_url,
            "admin_approved": sm.admin_approved,
            "updated_at": sm.updated_at.isoformat() if sm.updated_at else None,
        })

    return jsonify(result), 200


@milestone_bp.route('/cohort/<int:cohort_id>', methods=['GET'])
@jwt_required()
def get_cohort_startup_milestones(cohort_id):
    """Admin-only: fetch all StartupMilestone rows tied to Milestones belonging to the cohort."""
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"message": "Unauthorized"}), 403

    cohort_milestones = Milestone.query.filter_by(cohort_id=cohort_id).all()
    if not cohort_milestones:
        return jsonify([]), 200

    milestone_map = {m.milestone_id: m for m in cohort_milestones}
    milestone_ids = list(milestone_map.keys())
    sms = StartupMilestone.query.filter(StartupMilestone.milestone_id.in_(milestone_ids)).all()

    result = []
    for sm in sms:
        milestone = milestone_map.get(sm.milestone_id)
        if not milestone:
            continue
        startup = Startup.query.get(sm.startup_id)
        result.append({
            "startup_milestone_id": sm.startup_milestone_id,
            "startup_id": sm.startup_id,
            "company_name": startup.company_name if startup else None,
            "milestone_id": sm.milestone_id,
            "milestone_title": milestone.title,
            "deadline": milestone.deadline.isoformat() if milestone.deadline else None,
            "status": sm.status,
            "evidence_url": sm.evidence_url,
            "admin_approved": sm.admin_approved,
            "updated_at": sm.updated_at.isoformat() if sm.updated_at else None,
        })

    return jsonify(result), 200
