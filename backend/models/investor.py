from extensions import db
from datetime import datetime

class Investor(db.Model):
    __tablename__ = 'Investors'
    
    investor_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete='CASCADE'), nullable=False)
    investment_thesis = db.Column(db.Text)
    sector_focus = db.Column(db.String(255))
    ticket_size = db.Column(db.String(50))

class InvestorInterest(db.Model):
    __tablename__ = 'InvestorInterests'
    
    interest_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    startup_id = db.Column(db.Integer, db.ForeignKey('Startups.startup_id', ondelete='CASCADE'), nullable=False)
    investor_id = db.Column(db.Integer, db.ForeignKey('Investors.investor_id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(50), default='Pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class FundingRound(db.Model):
    __tablename__ = 'FundingRounds'
    
    funding_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    startup_id = db.Column(db.Integer, db.ForeignKey('Startups.startup_id', ondelete='CASCADE'), nullable=False)
    round_type = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    round_date = db.Column(db.Date, nullable=False)
    lead_investor_id = db.Column(db.Integer, db.ForeignKey('Investors.investor_id', ondelete='SET NULL'))
