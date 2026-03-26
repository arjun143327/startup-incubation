from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.investor import Investor, InvestorInterest, FundingRound
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
