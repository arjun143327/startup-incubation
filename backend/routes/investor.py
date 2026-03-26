from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.investor import Investor, InvestorInterest, FundingRound
from models.startup import Startup
from extensions import db

investor_bp = Blueprint('investor', __name__, url_prefix='/api/investors')

@investor_bp.route('/', methods=['GET'])
@jwt_required()
def get_investors():
    investors = Investor.query.all()
    result = []
    for i in investors:
        result.append({
            "investor_id": i.investor_id,
            "user_id": i.user_id,
            "sector_focus": i.sector_focus,
            "ticket_size": i.ticket_size
        })
    return jsonify(result), 200

@investor_bp.route('/interest', methods=['POST'])
@jwt_required()
def express_interest():
    data = request.get_json()
    new_interest = InvestorInterest(
        startup_id=data.get('startup_id'),
        investor_id=data.get('investor_id'),
        status='Pending'
    )
    db.session.add(new_interest)
    db.session.commit()
    
    return jsonify({"message": "Interest recorded successfully"}), 201


@investor_bp.route('/interest', methods=['GET'])
@jwt_required()
def get_investor_interests():
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"message": "Unauthorized"}), 403

    interests = InvestorInterest.query.all()
    result = []
    for it in interests:
        startup = Startup.query.get(it.startup_id)
        result.append({
            "interest_id": it.interest_id,
            "startup_id": it.startup_id,
            "company_name": startup.company_name if startup else None,
            "investor_id": it.investor_id,
            "status": it.status,
            "created_at": it.created_at.isoformat() if it.created_at else None,
        })

    return jsonify(result), 200

@investor_bp.route('/interest/<int:interest_id>/status', methods=['PUT'])
@jwt_required()
def update_interest_status(interest_id):
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"message": "Only admins can facilitate introductions"}), 403

    interest = InvestorInterest.query.get_or_404(interest_id)
    data = request.get_json()
    
    new_status = data.get('status')
    if new_status in ['Pending', 'Introduced', 'Passed']:
        interest.status = new_status
        db.session.commit()
        return jsonify({"message": f"Interest status updated to {new_status}"}), 200
        
    return jsonify({"message": "Invalid status"}), 400

@investor_bp.route('/funding', methods=['POST'])
@jwt_required()
def log_funding_round():
    claims = get_jwt()
    if claims.get('role') not in ['Admin', 'Founder']:
        return jsonify({"message": "Not authorized"}), 403

    data = request.get_json()
    new_round = FundingRound(
        startup_id=data.get('startup_id'),
        round_type=data.get('round_type'),
        amount=data.get('amount'),
        round_date=data.get('round_date'),
        lead_investor_id=data.get('lead_investor_id')
    )
    db.session.add(new_round)
    db.session.commit()
    
    return jsonify({"message": "Funding round documented", "funding_id": new_round.funding_id}), 201
