-- StartupNest Database Schema (MySQL 3NF/BCNF)

CREATE DATABASE IF NOT EXISTS startupnest;
USE startupnest;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Founder', 'Mentor', 'Investor') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- COHORTS TABLE
CREATE TABLE IF NOT EXISTS Cohorts (
    cohort_id INT AUTO_INCREMENT PRIMARY KEY,
    cohort_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('Upcoming', 'Active', 'Completed') DEFAULT 'Upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STARTUPS TABLE
CREATE TABLE IF NOT EXISTS Startups (
    startup_id INT AUTO_INCREMENT PRIMARY KEY,
    founder_id INT NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    industry_sector VARCHAR(100),
    idea_description TEXT,
    pitch_deck_url VARCHAR(255),
    cohort_id INT,
    status ENUM('Draft', 'Submitted', 'Under Review', 'Accepted', 'Rejected') DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (founder_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (cohort_id) REFERENCES Cohorts(cohort_id) ON DELETE SET NULL
);

-- MENTORS TABLE
CREATE TABLE IF NOT EXISTS Mentors (
    mentor_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    domain_expertise VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- INVESTORS TABLE
CREATE TABLE IF NOT EXISTS Investors (
    investor_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    investment_thesis TEXT,
    sector_focus VARCHAR(255),
    ticket_size VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- MILESTONES DEFINITION TABLE
CREATE TABLE IF NOT EXISTS Milestones (
    milestone_id INT AUTO_INCREMENT PRIMARY KEY,
    cohort_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    deadline DATE NOT NULL,
    FOREIGN KEY (cohort_id) REFERENCES Cohorts(cohort_id) ON DELETE CASCADE
);

-- STARTUP MILESTONES PROGRESS TABLE
CREATE TABLE IF NOT EXISTS StartupMilestones (
    startup_milestone_id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    milestone_id INT NOT NULL,
    status ENUM('Not Started', 'In Progress', 'Completed') DEFAULT 'Not Started',
    evidence_url VARCHAR(255),
    admin_approved BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES Startups(startup_id) ON DELETE CASCADE,
    FOREIGN KEY (milestone_id) REFERENCES Milestones(milestone_id) ON DELETE CASCADE,
    UNIQUE(startup_id, milestone_id)
);

-- MENTORING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS MentoringSessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    mentor_id INT NOT NULL,
    session_date DATETIME NOT NULL,
    mode VARCHAR(50) DEFAULT 'Online',
    notes TEXT,
    founder_rating INT CHECK (founder_rating BETWEEN 1 AND 5),
    mentor_rating INT CHECK (mentor_rating BETWEEN 1 AND 5),
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    FOREIGN KEY (startup_id) REFERENCES Startups(startup_id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES Mentors(mentor_id) ON DELETE CASCADE
);

-- INVESTOR INTEREST TABLE
CREATE TABLE IF NOT EXISTS InvestorInterests (
    interest_id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    investor_id INT NOT NULL,
    status ENUM('Pending', 'Introduced', 'Passed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES Startups(startup_id) ON DELETE CASCADE,
    FOREIGN KEY (investor_id) REFERENCES Investors(investor_id) ON DELETE CASCADE,
    UNIQUE(startup_id, investor_id)
);

-- FUNDING ROUNDS TABLE
CREATE TABLE IF NOT EXISTS FundingRounds (
    funding_id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    round_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    round_date DATE NOT NULL,
    lead_investor_id INT,
    FOREIGN KEY (startup_id) REFERENCES Startups(startup_id) ON DELETE CASCADE,
    FOREIGN KEY (lead_investor_id) REFERENCES Investors(investor_id) ON DELETE SET NULL
);

-- RESOURCES CATEGORY TABLE
CREATE TABLE IF NOT EXISTS Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL
);

-- RESOURCE LIBRARY TABLE
CREATE TABLE IF NOT EXISTS Resources (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    cohort_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (cohort_id) REFERENCES Cohorts(cohort_id) ON DELETE SET NULL
);

-- AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS ApplicationAuditLog (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES Startups(startup_id) ON DELETE CASCADE
);

-- TRIGGERS
DELIMITER //

CREATE TRIGGER trg_application_status_log
AFTER UPDATE ON Startups
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO ApplicationAuditLog (startup_id, old_status, new_status)
        VALUES (NEW.startup_id, OLD.status, NEW.status);
    END IF;
END //

CREATE TRIGGER trg_milestone_completion_notify
AFTER UPDATE ON StartupMilestones
FOR EACH ROW
BEGIN
    -- This trigger can be designed to insert a notification for admins if status becomes 'Completed'
    IF OLD.status != 'Completed' AND NEW.status = 'Completed' THEN
        -- Placeholder for notification log logic if added
        UPDATE StartupMilestones SET admin_approved = FALSE WHERE startup_milestone_id = NEW.startup_milestone_id;
    END IF;
END //

DELIMITER ;

-- STORED PROCEDURES
DELIMITER //

CREATE PROCEDURE sp_enroll_startup(IN p_startup_id INT, IN p_cohort_id INT)
BEGIN
    UPDATE Startups SET cohort_id = p_cohort_id, status = 'Accepted' WHERE startup_id = p_startup_id;
    
    -- Automatically assign all milestones for this cohort to the startup
    INSERT IGNORE INTO StartupMilestones (startup_id, milestone_id)
    SELECT p_startup_id, milestone_id FROM Milestones WHERE cohort_id = p_cohort_id;
END //

CREATE PROCEDURE sp_evaluate_application(IN p_startup_id INT, IN p_status VARCHAR(50))
BEGIN
    UPDATE Startups SET status = p_status WHERE startup_id = p_startup_id;
END //

DELIMITER ;

-- VIEWS
CREATE OR REPLACE VIEW vw_startup_progress AS
SELECT 
    s.company_name, 
    c.cohort_name, 
    COUNT(sm.milestone_id) AS total_milestones,
    SUM(CASE WHEN sm.status = 'Completed' THEN 1 ELSE 0 END) AS completed_milestones,
    (SUM(CASE WHEN sm.status = 'Completed' THEN 1 ELSE 0 END) / COUNT(sm.milestone_id)) * 100 AS progress_percent
FROM Startups s
JOIN Cohorts c ON s.cohort_id = c.cohort_id
LEFT JOIN StartupMilestones sm ON s.startup_id = sm.startup_id
GROUP BY s.startup_id;

CREATE OR REPLACE VIEW vw_cohort_summary AS
SELECT 
    c.cohort_name, 
    c.status,
    COUNT(s.startup_id) AS total_startups,
    IFNULL(SUM(f.amount), 0) AS total_funding_raised
FROM Cohorts c
LEFT JOIN Startups s ON c.cohort_id = s.cohort_id
LEFT JOIN FundingRounds f ON s.startup_id = f.startup_id
GROUP BY c.cohort_id;

CREATE OR REPLACE VIEW vw_investor_pipeline AS
SELECT 
    i.investor_id,
    u.full_name AS investor_name,
    s.company_name,
    ii.status AS introduction_status
FROM Investors i
JOIN Users u ON i.user_id = u.user_id
JOIN InvestorInterests ii ON i.investor_id = ii.investor_id
JOIN Startups s ON ii.startup_id = s.startup_id;

