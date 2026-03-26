from extensions import db
from datetime import datetime

class Milestone(db.Model):
    __tablename__ = 'Milestones'
    
    milestone_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    cohort_id = db.Column(db.Integer, db.ForeignKey('Cohorts.cohort_id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    deadline = db.Column(db.Date, nullable=False)

class StartupMilestone(db.Model):
    __tablename__ = 'StartupMilestones'
    
    startup_milestone_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    startup_id = db.Column(db.Integer, db.ForeignKey('Startups.startup_id', ondelete='CASCADE'), nullable=False)
    milestone_id = db.Column(db.Integer, db.ForeignKey('Milestones.milestone_id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.Enum('Not Started', 'In Progress', 'Completed'), default='Not Started')
    evidence_url = db.Column(db.String(255))
    admin_approved = db.Column(db.Boolean, default=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
