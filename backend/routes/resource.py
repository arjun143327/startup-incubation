from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models.resource import Resource, Category
from extensions import db

resource_bp = Blueprint('resource', __name__, url_prefix='/api/resources')

@resource_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    if get_jwt().get('role') != 'Admin':
        return jsonify({"message": "Unauthorized"}), 403
    category = Category(category_name=request.json.get('category_name'))
    db.session.add(category)
    db.session.commit()
    return jsonify({"message": "Category created", "id": category.category_id}), 201

@resource_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    categories = Category.query.all()
    return jsonify([{"id": c.category_id, "name": c.category_name} for c in categories]), 200

@resource_bp.route('/', methods=['POST'])
@jwt_required()
def upload_resource():
    if get_jwt().get('role') != 'Admin':
        return jsonify({"message": "Unauthorized"}), 403
    
    data = request.json
    res = Resource(
        category_id=data.get('category_id'),
        title=data.get('title'),
        file_url=data.get('file_url'),
        cohort_id=data.get('cohort_id')
    )
    db.session.add(res)
    db.session.commit()
    return jsonify({"message": "Resource uploaded", "id": res.resource_id}), 201

@resource_bp.route('/', methods=['GET'])
@jwt_required()
def get_resources():
    cohort_id = request.args.get('cohort_id')
    query = Resource.query
    if cohort_id:
        query = query.filter_by(cohort_id=cohort_id)
    resources = query.all()
    
    return jsonify([{
        "id": r.resource_id,
        "title": r.title,
        "category_id": r.category_id,
        "file_url": r.file_url,
        "cohort_id": r.cohort_id
    } for r in resources]), 200
