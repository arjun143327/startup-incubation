from extensions import db
from datetime import datetime

class Category(db.Model):
    __tablename__ = 'Categories'
    
    category_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_name = db.Column(db.String(100), unique=True, nullable=False)

class Resource(db.Model):
    __tablename__ = 'Resources'
    
    resource_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_id = db.Column(db.Integer, db.ForeignKey('Categories.category_id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    file_url = db.Column(db.String(255), nullable=False)
    cohort_id = db.Column(db.Integer, db.ForeignKey('Cohorts.cohort_id', ondelete='SET NULL'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
