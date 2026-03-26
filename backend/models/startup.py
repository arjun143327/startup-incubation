from extensions import db
from datetime import datetime

class Startup(db.Model):
    __tablename__ = 'Startups'
    
    startup_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    founder_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete='CASCADE'), nullable=False)
    company_name = db.Column(db.String(150), nullable=False)
    industry_sector = db.Column(db.String(100))
    idea_description = db.Column(db.Text)
    pitch_deck_url = db.Column(db.String(255))
    cohort_id = db.Column(db.Integer, db.ForeignKey('Cohorts.cohort_id', ondelete='SET NULL'))
    status = db.Column(db.Enum('Draft', 'Submitted', 'Under Review', 'Accepted', 'Rejected'), default='Draft')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
