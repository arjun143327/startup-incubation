from extensions import db
from datetime import datetime

class Mentor(db.Model):
    __tablename__ = 'Mentors'
    
    mentor_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete='CASCADE'), nullable=False)
    domain_expertise = db.Column(db.String(255), nullable=False)

class MentoringSession(db.Model):
    __tablename__ = 'MentoringSessions'
    
    session_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    startup_id = db.Column(db.Integer, db.ForeignKey('Startups.startup_id', ondelete='CASCADE'), nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey('Mentors.mentor_id', ondelete='CASCADE'), nullable=False)
    session_date = db.Column(db.DateTime, nullable=False)
    mode = db.Column(db.String(50), default='Online')
    notes = db.Column(db.Text)
    founder_rating = db.Column(db.Integer)
    mentor_rating = db.Column(db.Integer)
    status = db.Column(db.Enum('Scheduled', 'Completed', 'Cancelled'), default='Scheduled')
