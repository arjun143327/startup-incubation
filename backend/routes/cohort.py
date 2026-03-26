from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models.cohort import Cohort
from extensions import db
from sqlalchemy import text

cohort_bp = Blueprint('cohort', __name__, url_prefix='/api/cohorts')

@cohort_bp.route('/', methods=['POST'])
@jwt_required()
def create_cohort():
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"message": "Only admins can create cohorts"}), 403

    data = request.get_json()
    new_cohort = Cohort(
        cohort_name=data.get('cohort_name'),
        start_date=data.get('start_date'),
        end_date=data.get('end_date'),
        status='Upcoming'
    )
    db.session.add(new_cohort)
    db.session.commit()
    
    return jsonify({"message": "Cohort created", "cohort_id": new_cohort.cohort_id}), 201

@cohort_bp.route('/', methods=['GET'])
@jwt_required()
def get_cohorts():
    cohorts = Cohort.query.all()
    result = []
    for c in cohorts:
        result.append({
            "cohort_id": c.cohort_id,
            "cohort_name": c.cohort_name,
            "start_date": c.start_date.isoformat() if c.start_date else None,
            "end_date": c.end_date.isoformat() if c.end_date else None,
            "status": c.status
        })
    return jsonify(result), 200

@cohort_bp.route('/<int:cohort_id>/enroll', methods=['POST'])
@jwt_required()
def enroll_startup(cohort_id):
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"message": "Only admins can enroll startups"}), 403

    data = request.get_json()
    startup_id = data.get('startup_id')
    
    if not startup_id:
        return jsonify({"message": "Startup ID required"}), 400

    # Using the stored procedure as requested in PRD
    try:
        db.session.execute(text('CALL sp_enroll_startup(:startup_id, :cohort_id)'), 
                           {'startup_id': startup_id, 'cohort_id': cohort_id})
        db.session.commit()
        return jsonify({"message": "Startup successfully enrolled in cohort"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error enrolling startup", "error": str(e)}), 500
