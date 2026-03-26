from __future__ import annotations

import sqlite3
from datetime import UTC, date, datetime, timedelta
from pathlib import Path

from werkzeug.security import generate_password_hash


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "instance" / "startupnest.db"
DEMO_PASSWORD = "Demo@123"


def fetch_one_id(cursor: sqlite3.Cursor, query: str, params: tuple) -> int | None:
    cursor.execute(query, params)
    row = cursor.fetchone()
    return row[0] if row else None


def ensure_user(cursor: sqlite3.Cursor, full_name: str, email: str, role: str) -> int:
    user_id = fetch_one_id(cursor, "SELECT user_id FROM Users WHERE email = ?", (email,))
    password_hash = generate_password_hash(DEMO_PASSWORD)

    if user_id is None:
        cursor.execute(
            """
            INSERT INTO Users (full_name, email, password_hash, role, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """,
            (full_name, email, password_hash, role, 1),
        )
        return cursor.lastrowid

    cursor.execute(
        """
        UPDATE Users
        SET full_name = ?, role = ?, is_active = 1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        """,
        (full_name, role, user_id),
    )
    return user_id


def ensure_cohort(
    cursor: sqlite3.Cursor,
    cohort_name: str,
    start_date: date,
    end_date: date,
    status: str,
) -> int:
    cohort_id = fetch_one_id(cursor, "SELECT cohort_id FROM Cohorts WHERE cohort_name = ?", (cohort_name,))
    if cohort_id is None:
        cursor.execute(
            """
            INSERT INTO Cohorts (cohort_name, start_date, end_date, status, created_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            """,
            (cohort_name, start_date.isoformat(), end_date.isoformat(), status),
        )
        return cursor.lastrowid

    cursor.execute(
        """
        UPDATE Cohorts
        SET start_date = ?, end_date = ?, status = ?
        WHERE cohort_id = ?
        """,
        (start_date.isoformat(), end_date.isoformat(), status, cohort_id),
    )
    return cohort_id


def ensure_startup(
    cursor: sqlite3.Cursor,
    founder_id: int,
    company_name: str,
    industry_sector: str,
    idea_description: str,
    pitch_deck_url: str,
    cohort_id: int,
    status: str,
) -> int:
    startup_id = fetch_one_id(cursor, "SELECT startup_id FROM Startups WHERE company_name = ?", (company_name,))
    if startup_id is None:
        cursor.execute(
            """
            INSERT INTO Startups
            (founder_id, company_name, industry_sector, idea_description, pitch_deck_url, cohort_id, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """,
            (founder_id, company_name, industry_sector, idea_description, pitch_deck_url, cohort_id, status),
        )
        return cursor.lastrowid

    cursor.execute(
        """
        UPDATE Startups
        SET founder_id = ?, industry_sector = ?, idea_description = ?, pitch_deck_url = ?, cohort_id = ?, status = ?
        WHERE startup_id = ?
        """,
        (founder_id, industry_sector, idea_description, pitch_deck_url, cohort_id, status, startup_id),
    )
    return startup_id


def ensure_mentor(cursor: sqlite3.Cursor, user_id: int, domain_expertise: str) -> int:
    mentor_id = fetch_one_id(cursor, "SELECT mentor_id FROM Mentors WHERE user_id = ?", (user_id,))
    if mentor_id is None:
        cursor.execute(
            "INSERT INTO Mentors (user_id, domain_expertise) VALUES (?, ?)",
            (user_id, domain_expertise),
        )
        return cursor.lastrowid

    cursor.execute(
        "UPDATE Mentors SET domain_expertise = ? WHERE mentor_id = ?",
        (domain_expertise, mentor_id),
    )
    return mentor_id


def ensure_investor(
    cursor: sqlite3.Cursor,
    user_id: int,
    investment_thesis: str,
    sector_focus: str,
    ticket_size: str,
) -> int:
    investor_id = fetch_one_id(cursor, "SELECT investor_id FROM Investors WHERE user_id = ?", (user_id,))
    if investor_id is None:
        cursor.execute(
            """
            INSERT INTO Investors (user_id, investment_thesis, sector_focus, ticket_size)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, investment_thesis, sector_focus, ticket_size),
        )
        return cursor.lastrowid

    cursor.execute(
        """
        UPDATE Investors
        SET investment_thesis = ?, sector_focus = ?, ticket_size = ?
        WHERE investor_id = ?
        """,
        (investment_thesis, sector_focus, ticket_size, investor_id),
    )
    return investor_id


def ensure_milestone(
    cursor: sqlite3.Cursor,
    cohort_id: int,
    title: str,
    description: str,
    deadline: date,
) -> int:
    milestone_id = fetch_one_id(
        cursor,
        "SELECT milestone_id FROM Milestones WHERE cohort_id = ? AND title = ?",
        (cohort_id, title),
    )
    if milestone_id is None:
        cursor.execute(
            """
            INSERT INTO Milestones (cohort_id, title, description, deadline)
            VALUES (?, ?, ?, ?)
            """,
            (cohort_id, title, description, deadline.isoformat()),
        )
        return cursor.lastrowid

    cursor.execute(
        """
        UPDATE Milestones
        SET description = ?, deadline = ?
        WHERE milestone_id = ?
        """,
        (description, deadline.isoformat(), milestone_id),
    )
    return milestone_id


def ensure_startup_milestone(
    cursor: sqlite3.Cursor,
    startup_id: int,
    milestone_id: int,
    status: str,
    evidence_url: str | None,
    admin_approved: bool,
    updated_at: datetime,
) -> None:
    startup_milestone_id = fetch_one_id(
        cursor,
        "SELECT startup_milestone_id FROM StartupMilestones WHERE startup_id = ? AND milestone_id = ?",
        (startup_id, milestone_id),
    )
    payload = (status, evidence_url, int(admin_approved), updated_at.isoformat(sep=" "), startup_id, milestone_id)

    if startup_milestone_id is None:
        cursor.execute(
            """
            INSERT INTO StartupMilestones
            (status, evidence_url, admin_approved, updated_at, startup_id, milestone_id)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            payload[:4] + payload[4:],
        )
        return

    cursor.execute(
        """
        UPDATE StartupMilestones
        SET status = ?, evidence_url = ?, admin_approved = ?, updated_at = ?
        WHERE startup_id = ? AND milestone_id = ?
        """,
        payload,
    )


def ensure_category(cursor: sqlite3.Cursor, category_name: str) -> int:
    category_id = fetch_one_id(cursor, "SELECT category_id FROM Categories WHERE category_name = ?", (category_name,))
    if category_id is None:
        cursor.execute(
            "INSERT INTO Categories (category_name) VALUES (?)",
            (category_name,),
        )
        return cursor.lastrowid
    return category_id


def ensure_resource(
    cursor: sqlite3.Cursor,
    category_id: int,
    title: str,
    file_url: str,
    cohort_id: int | None,
) -> None:
    resource_id = fetch_one_id(cursor, "SELECT resource_id FROM Resources WHERE title = ?", (title,))
    if resource_id is None:
        cursor.execute(
            """
            INSERT INTO Resources (category_id, title, file_url, cohort_id, created_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            """,
            (category_id, title, file_url, cohort_id),
        )
        return

    cursor.execute(
        """
        UPDATE Resources
        SET category_id = ?, file_url = ?, cohort_id = ?
        WHERE resource_id = ?
        """,
        (category_id, file_url, cohort_id, resource_id),
    )


def ensure_session(
    cursor: sqlite3.Cursor,
    startup_id: int,
    mentor_id: int,
    session_date: datetime,
    mode: str,
    notes: str | None,
    founder_rating: int | None,
    mentor_rating: int | None,
    status: str,
) -> None:
    session_id = fetch_one_id(
        cursor,
        """
        SELECT session_id
        FROM MentoringSessions
        WHERE startup_id = ? AND mentor_id = ? AND session_date = ?
        """,
        (startup_id, mentor_id, session_date.isoformat(sep=" ")),
    )
    values = (
        mode,
        notes,
        founder_rating,
        mentor_rating,
        status,
        startup_id,
        mentor_id,
        session_date.isoformat(sep=" "),
    )

    if session_id is None:
        cursor.execute(
            """
            INSERT INTO MentoringSessions
            (mode, notes, founder_rating, mentor_rating, status, startup_id, mentor_id, session_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            values,
        )
        return

    cursor.execute(
        """
        UPDATE MentoringSessions
        SET mode = ?, notes = ?, founder_rating = ?, mentor_rating = ?, status = ?
        WHERE startup_id = ? AND mentor_id = ? AND session_date = ?
        """,
        values[:5] + values[5:],
    )


def ensure_interest(
    cursor: sqlite3.Cursor,
    startup_id: int,
    investor_id: int,
    status: str,
    created_at: datetime,
) -> None:
    interest_id = fetch_one_id(
        cursor,
        "SELECT interest_id FROM InvestorInterests WHERE startup_id = ? AND investor_id = ?",
        (startup_id, investor_id),
    )
    if interest_id is None:
        cursor.execute(
            """
            INSERT INTO InvestorInterests (startup_id, investor_id, status, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (startup_id, investor_id, status, created_at.isoformat(sep=" ")),
        )
        return

    cursor.execute(
        """
        UPDATE InvestorInterests
        SET status = ?, created_at = ?
        WHERE interest_id = ?
        """,
        (status, created_at.isoformat(sep=" "), interest_id),
    )


def ensure_funding_round(
    cursor: sqlite3.Cursor,
    startup_id: int,
    round_type: str,
    amount: str,
    round_date: date,
    lead_investor_id: int,
) -> None:
    funding_id = fetch_one_id(
        cursor,
        "SELECT funding_id FROM FundingRounds WHERE startup_id = ? AND round_type = ? AND round_date = ?",
        (startup_id, round_type, round_date.isoformat()),
    )
    if funding_id is None:
        cursor.execute(
            """
            INSERT INTO FundingRounds (startup_id, round_type, amount, round_date, lead_investor_id)
            VALUES (?, ?, ?, ?, ?)
            """,
            (startup_id, round_type, amount, round_date.isoformat(), lead_investor_id),
        )
        return

    cursor.execute(
        """
        UPDATE FundingRounds
        SET amount = ?, lead_investor_id = ?
        WHERE funding_id = ?
        """,
        (amount, lead_investor_id, funding_id),
    )


def ensure_audit(
    cursor: sqlite3.Cursor,
    startup_id: int,
    old_status: str,
    new_status: str,
    changed_at: datetime,
) -> None:
    log_id = fetch_one_id(
        cursor,
        """
        SELECT log_id
        FROM ApplicationAuditLog
        WHERE startup_id = ? AND old_status = ? AND new_status = ? AND changed_at = ?
        """,
        (startup_id, old_status, new_status, changed_at.isoformat(sep=" ")),
    )
    if log_id is None:
        cursor.execute(
            """
            INSERT INTO ApplicationAuditLog (startup_id, old_status, new_status, changed_at)
            VALUES (?, ?, ?, ?)
            """,
            (startup_id, old_status, new_status, changed_at.isoformat(sep=" ")),
        )


def create_views(cursor: sqlite3.Cursor) -> None:
    cursor.execute("DROP VIEW IF EXISTS vw_startup_progress")
    cursor.execute(
        """
        CREATE VIEW vw_startup_progress AS
        SELECT
            s.startup_id AS startup_id,
            s.company_name AS company_name,
            u.full_name AS founder_name,
            COALESCE(c.cohort_name, 'Unassigned') AS cohort_name,
            s.status AS application_status,
            COUNT(DISTINCT sm.startup_milestone_id) AS total_milestones,
            COUNT(DISTINCT CASE WHEN sm.status = 'Completed' THEN sm.startup_milestone_id END) AS completed_milestones,
            COUNT(DISTINCT ms.session_id) AS mentoring_sessions,
            COALESCE(SUM(DISTINCT fr.amount), 0) AS total_funding
        FROM Startups s
        JOIN Users u ON u.user_id = s.founder_id
        LEFT JOIN Cohorts c ON c.cohort_id = s.cohort_id
        LEFT JOIN StartupMilestones sm ON sm.startup_id = s.startup_id
        LEFT JOIN MentoringSessions ms ON ms.startup_id = s.startup_id
        LEFT JOIN FundingRounds fr ON fr.startup_id = s.startup_id
        GROUP BY s.startup_id, s.company_name, u.full_name, c.cohort_name, s.status
        """
    )

    cursor.execute("DROP VIEW IF EXISTS vw_cohort_summary")
    cursor.execute(
        """
        CREATE VIEW vw_cohort_summary AS
        SELECT
            c.cohort_id AS cohort_id,
            c.cohort_name AS cohort_name,
            c.status AS cohort_status,
            COUNT(DISTINCT s.startup_id) AS startups,
            COUNT(DISTINCT CASE WHEN s.status IN ('Accepted', 'Active') THEN s.startup_id END) AS accepted_or_active,
            COUNT(DISTINCT m.milestone_id) AS milestones,
            COUNT(DISTINCT r.resource_id) AS resources
        FROM Cohorts c
        LEFT JOIN Startups s ON s.cohort_id = c.cohort_id
        LEFT JOIN Milestones m ON m.cohort_id = c.cohort_id
        LEFT JOIN Resources r ON r.cohort_id = c.cohort_id
        GROUP BY c.cohort_id, c.cohort_name, c.status
        """
    )

    cursor.execute("DROP VIEW IF EXISTS vw_investor_pipeline")
    cursor.execute(
        """
        CREATE VIEW vw_investor_pipeline AS
        SELECT
            ii.interest_id AS interest_id,
            s.company_name AS company_name,
            ii.investor_id AS investor_id,
            u.full_name AS investor_name,
            i.sector_focus AS sector_focus,
            ii.status AS status,
            ii.created_at AS created_at
        FROM InvestorInterests ii
        JOIN Startups s ON s.startup_id = ii.startup_id
        JOIN Investors i ON i.investor_id = ii.investor_id
        JOIN Users u ON u.user_id = i.user_id
        """
    )


def seed_demo_data() -> dict[str, str]:
    if not DB_PATH.exists():
        raise FileNotFoundError(f"Database not found at {DB_PATH}")

    today = date.today()
    now = datetime.now(UTC).replace(tzinfo=None)

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()

        admin_id = ensure_user(cursor, "Aisha Kapoor", "admin@startupnest.demo", "Admin")
        founder_one_id = ensure_user(cursor, "Rohan Mehta", "rohan@startupnest.demo", "Founder")
        founder_two_id = ensure_user(cursor, "Priya Nair", "priya@startupnest.demo", "Founder")
        mentor_user_id = ensure_user(cursor, "Daniel Brooks", "mentor@startupnest.demo", "Mentor")
        investor_user_id = ensure_user(cursor, "Elena Cruz", "investor@startupnest.demo", "Investor")

        active_cohort_id = ensure_cohort(
            cursor,
            "LaunchPad Spring 2026",
            today - timedelta(days=30),
            today + timedelta(days=75),
            "Active",
        )
        upcoming_cohort_id = ensure_cohort(
            cursor,
            "Investor Showcase Summer 2026",
            today + timedelta(days=40),
            today + timedelta(days=140),
            "Upcoming",
        )

        solar_id = ensure_startup(
            cursor,
            founder_one_id,
            "SolarSprint",
            "CleanTech",
            "AI-driven rooftop solar planning for tier-2 cities, already piloting with installation partners and now raising a seed round.",
            "https://demo.startupnest.app/pitch/solarsprint-demo",
            active_cohort_id,
            "Active",
        )
        medi_id = ensure_startup(
            cursor,
            founder_two_id,
            "MediBridge",
            "HealthTech",
            "Patient follow-up automation for mid-size clinics, recently accepted into the program and preparing for its first pilot.",
            "https://demo.startupnest.app/pitch/medibridge-demo",
            active_cohort_id,
            "Accepted",
        )

        mentor_id = ensure_mentor(cursor, mentor_user_id, "Go-to-market strategy and B2B sales")
        investor_id = ensure_investor(
            cursor,
            investor_user_id,
            "Backs execution-focused founders in software and climate.",
            "SaaS, ClimateTech",
            "$100k-$500k",
        )

        problem_validation_id = ensure_milestone(
            cursor,
            active_cohort_id,
            "Problem Validation Interviews",
            "Upload 15 customer interview summaries with key pain points and buying signals.",
            today + timedelta(days=10),
        )
        pitch_deck_id = ensure_milestone(
            cursor,
            active_cohort_id,
            "Investor-Ready Pitch Deck",
            "Submit a polished pitch deck covering market, traction, GTM plan, and funding ask.",
            today + timedelta(days=21),
        )
        pilot_launch_id = ensure_milestone(
            cursor,
            active_cohort_id,
            "Pilot Launch Metrics",
            "Share early pilot metrics, retention signals, and key lessons from launch.",
            today + timedelta(days=35),
        )
        go_to_market_id = ensure_milestone(
            cursor,
            active_cohort_id,
            "Go-To-Market Sprint",
            "Show a focused outreach plan, ICP definition, and first 20 target accounts.",
            today + timedelta(days=16),
        )

        ensure_startup_milestone(
            cursor,
            solar_id,
            problem_validation_id,
            "Completed",
            "https://demo.startupnest.app/evidence/solarsprint/customer-interviews",
            True,
            now - timedelta(days=4),
        )
        ensure_startup_milestone(
            cursor,
            solar_id,
            pitch_deck_id,
            "In Progress",
            "https://demo.startupnest.app/evidence/solarsprint/investor-deck-v3",
            False,
            now - timedelta(days=2),
        )
        ensure_startup_milestone(
            cursor,
            solar_id,
            go_to_market_id,
            "Completed",
            "https://demo.startupnest.app/evidence/solarsprint/gtm-sprint",
            True,
            now - timedelta(days=3),
        )
        ensure_startup_milestone(
            cursor,
            medi_id,
            problem_validation_id,
            "In Progress",
            "https://demo.startupnest.app/evidence/medibridge/interview-notes",
            False,
            now - timedelta(days=6),
        )
        ensure_startup_milestone(
            cursor,
            medi_id,
            pilot_launch_id,
            "Not Started",
            None,
            False,
            now - timedelta(days=1),
        )
        ensure_startup_milestone(
            cursor,
            medi_id,
            go_to_market_id,
            "Not Started",
            None,
            False,
            now - timedelta(days=1),
        )

        strategy_category_id = ensure_category(cursor, "Strategy Guides")
        fundraising_category_id = ensure_category(cursor, "Fundraising")
        operations_category_id = ensure_category(cursor, "Operations")
        product_category_id = ensure_category(cursor, "Product")

        ensure_resource(
            cursor,
            strategy_category_id,
            "Founder Onboarding Playbook",
            "https://demo.startupnest.app/resources/founder-onboarding-playbook.pdf",
            active_cohort_id,
        )
        ensure_resource(
            cursor,
            fundraising_category_id,
            "Seed Round Checklist",
            "https://demo.startupnest.app/resources/seed-round-checklist.pdf",
            active_cohort_id,
        )
        ensure_resource(
            cursor,
            operations_category_id,
            "Weekly Metrics Tracker",
            "https://demo.startupnest.app/resources/weekly-metrics-tracker.xlsx",
            None,
        )
        ensure_resource(
            cursor,
            product_category_id,
            "Pilot Readiness Scorecard",
            "https://demo.startupnest.app/resources/pilot-readiness-scorecard.pdf",
            active_cohort_id,
        )
        ensure_resource(
            cursor,
            fundraising_category_id,
            "Demo Day Investor FAQ Template",
            "https://demo.startupnest.app/resources/demo-day-investor-faq.docx",
            upcoming_cohort_id,
        )

        ensure_session(
            cursor,
            solar_id,
            mentor_id,
            datetime.combine(today - timedelta(days=7), datetime.min.time()).replace(hour=11),
            "Online",
            "Strong founder clarity. Next step is tightening the enterprise sales motion and sharpening the seed narrative.",
            5,
            4,
            "Completed",
        )
        ensure_session(
            cursor,
            solar_id,
            mentor_id,
            datetime.combine(today + timedelta(days=5), datetime.min.time()).replace(hour=10, minute=30),
            "Offline",
            None,
            None,
            None,
            "Scheduled",
        )
        ensure_session(
            cursor,
            medi_id,
            mentor_id,
            datetime.combine(today + timedelta(days=3), datetime.min.time()).replace(hour=15, minute=30),
            "Online",
            None,
            None,
            None,
            "Scheduled",
        )

        ensure_interest(cursor, solar_id, investor_id, "Introduced", now - timedelta(days=8))
        ensure_interest(cursor, medi_id, investor_id, "Pending", now - timedelta(days=3))

        ensure_funding_round(cursor, solar_id, "Seed", "350000.00", today - timedelta(days=14), investor_id)
        ensure_funding_round(cursor, medi_id, "Pre-Seed", "120000.00", today - timedelta(days=2), investor_id)

        ensure_audit(cursor, solar_id, "Submitted", "Accepted", now - timedelta(days=20))
        ensure_audit(cursor, solar_id, "Accepted", "Active", now - timedelta(days=12))
        ensure_audit(cursor, medi_id, "Submitted", "Accepted", now - timedelta(days=9))

        create_views(cursor)
        conn.commit()

    return {
        "Admin": "admin@startupnest.demo",
        "Founder 1": "rohan@startupnest.demo",
        "Founder 2": "priya@startupnest.demo",
        "Mentor": "mentor@startupnest.demo",
        "Investor": "investor@startupnest.demo",
    }


def main() -> None:
    credentials = seed_demo_data()
    print("Demo data seeded successfully.")
    print(f"Password for all demo users: {DEMO_PASSWORD}")
    for role, email in credentials.items():
        print(f"{role}: {email}")


if __name__ == "__main__":
    main()
