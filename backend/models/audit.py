from extensions import db
from datetime import datetime

class ApplicationAuditLog(db.Model):
    __tablename__ = 'ApplicationAuditLog'
    
    log_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    startup_id = db.Column(db.Integer, db.ForeignKey('Startups.startup_id', ondelete='CASCADE'), nullable=False)
    old_status = db.Column(db.String(50))
    new_status = db.Column(db.String(50))
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)
