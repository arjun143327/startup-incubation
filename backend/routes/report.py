from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from extensions import db
from sqlalchemy import text

report_bp = Blueprint('report', __name__, url_prefix='/api/reports')

@report_bp.route('/startup-progress', methods=['GET'])
@jwt_required()
def startup_progress():
    if get_jwt().get('role') not in ['Admin', 'Investor']:
        return jsonify({"message": "Unauthorized"}), 403
    
    result = db.session.execute(text("SELECT * FROM vw_startup_progress")).fetchall()
    data = [dict(row._mapping) for row in result]
    return jsonify(data), 200

@report_bp.route('/cohort-summary', methods=['GET'])
@jwt_required()
def cohort_summary():
    if get_jwt().get('role') != 'Admin':
        return jsonify({"message": "Unauthorized"}), 403
        
    result = db.session.execute(text("SELECT * FROM vw_cohort_summary")).fetchall()
    data = [dict(row._mapping) for row in result]
    return jsonify(data), 200

@report_bp.route('/investor-pipeline', methods=['GET'])
@jwt_required()
def investor_pipeline():
    if get_jwt().get('role') not in ['Admin', 'Investor']:
        return jsonify({"message": "Unauthorized"}), 403
        
    result = db.session.execute(text("SELECT * FROM vw_investor_pipeline")).fetchall()
    data = [dict(row._mapping) for row in result]
    return jsonify(data), 200
