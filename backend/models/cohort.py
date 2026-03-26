from extensions import db
from datetime import datetime

class Cohort(db.Model):
    __tablename__ = 'Cohorts'
    
    cohort_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    cohort_name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum('Upcoming', 'Active', 'Completed'), default='Upcoming')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
