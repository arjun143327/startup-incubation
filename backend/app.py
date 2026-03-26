from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from extensions import db, jwt

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    # Import all models before creating tables
    from models import user, cohort, startup, mentor, investor, milestone, resource, audit

    with app.app_context():
        db.create_all()

    @app.route('/api/health')
    def health_check():
        return jsonify({"status": "healthy"}), 200

    # Register blueprints
    from routes.auth import auth_bp
    from routes.startup import startup_bp
    from routes.cohort import cohort_bp
    from routes.mentor import mentor_bp
    from routes.investor import investor_bp
    from routes.milestone import milestone_bp
    from routes.resource import resource_bp
    from routes.report import report_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(startup_bp)
    app.register_blueprint(cohort_bp)
    app.register_blueprint(mentor_bp)
    app.register_blueprint(investor_bp)
    app.register_blueprint(milestone_bp)
    app.register_blueprint(resource_bp)
    app.register_blueprint(report_bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
