-- Course Registration Dashboard schema (CP476). Load with: npm run db:init

CREATE DATABASE IF NOT EXISTS course_registration;

USE course_registration;

CREATE TABLE Faculties
(
    faculty_id   INT PRIMARY KEY AUTO_INCREMENT,
    faculty_name VARCHAR(100) UNIQUE
);

CREATE TABLE Departments
(
    department_id   INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(50),
    faculty_id      INT,
    FOREIGN KEY (faculty_id) REFERENCES Faculties (faculty_id)
);

CREATE TABLE Programs
(
    program_id    INT PRIMARY KEY AUTO_INCREMENT,
    program_name  VARCHAR(100),
    degree_type   VARCHAR(50),
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES Departments (department_id)
);

CREATE TABLE Accounts
(
    account_id     INT PRIMARY KEY AUTO_INCREMENT,
    username       VARCHAR(100) UNIQUE NOT NULL,
    password_hash  VARCHAR(255)        NOT NULL,
    last_login     DATETIME,
    account_status VARCHAR(20) DEFAULT 'Active'
);

CREATE TABLE Students
(
    student_id    INT PRIMARY KEY AUTO_INCREMENT,
    account_id    INT UNIQUE,
    first_name    VARCHAR(50),
    last_name     VARCHAR(50),
    student_email VARCHAR(100) UNIQUE,
    student_phone VARCHAR(20) UNIQUE,
    date_of_birth DATE,
    program_id    INT,
    GPA           DECIMAL(3, 2),
    FOREIGN KEY (account_id) REFERENCES Accounts (account_id),
    FOREIGN KEY (program_id) REFERENCES Programs (program_id)
);

CREATE TABLE Administrators
(
    admin_id   INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT UNIQUE,
    first_name VARCHAR(50),
    last_name  VARCHAR(50),
    email      VARCHAR(100) UNIQUE,
    FOREIGN KEY (account_id) REFERENCES Accounts (account_id)
);

CREATE TABLE UserSessions
(
    session_id    INT PRIMARY KEY AUTO_INCREMENT,
    account_id    INT,
    session_token VARCHAR(255) UNIQUE,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at    DATETIME,
    active        BOOLEAN  DEFAULT TRUE,
    FOREIGN KEY (account_id) REFERENCES Accounts (account_id)
);

CREATE TABLE Instructors
(
    instructor_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name    VARCHAR(50),
    last_name     VARCHAR(50),
    email         VARCHAR(100) UNIQUE,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES Departments (department_id)
);

CREATE TABLE Courses
(
    course_id          INT PRIMARY KEY AUTO_INCREMENT,
    course_code        VARCHAR(50) UNIQUE,
    course_name        VARCHAR(50),
    course_description TEXT,
    course_level       INT,
    credits            INT,
    department_id      INT,
    FOREIGN KEY (department_id) REFERENCES Departments (department_id)
);

CREATE TABLE AcademicTerms
(
    term_id                 INT PRIMARY KEY AUTO_INCREMENT,
    term_name               VARCHAR(50),
    semester                VARCHAR(50),
    year                    INT,
    start_date              DATE,
    end_date                DATE,
    registration_open_date  DATE,
    registration_close_date DATE
);

CREATE TABLE Rooms
(
    room_id     INT PRIMARY KEY AUTO_INCREMENT,
    building    VARCHAR(50),
    room_number VARCHAR(20),
    capacity    INT
);

CREATE TABLE CourseSections
(
    section_id     INT PRIMARY KEY AUTO_INCREMENT,
    course_id      INT,
    instructor_id  INT,
    term_id        INT,
    section_number VARCHAR(20),
    capacity       INT,
    enrolled_count INT DEFAULT 0,
    room_id        INT,
    delivery_mode  VARCHAR(20),
    status         VARCHAR(20),
    FOREIGN KEY (course_id) REFERENCES Courses (course_id),
    FOREIGN KEY (instructor_id) REFERENCES Instructors (instructor_id),
    FOREIGN KEY (term_id) REFERENCES AcademicTerms (term_id),
    FOREIGN KEY (room_id) REFERENCES Rooms (room_id)
);

CREATE TABLE ClassSchedule
(
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    section_id  INT,
    day_of_week VARCHAR(20),
    start_time  TIME,
    end_time    TIME,
    FOREIGN KEY (section_id) REFERENCES CourseSections (section_id)
);

CREATE TABLE Prerequisites
(
    prerequisite_id    INT PRIMARY KEY AUTO_INCREMENT,
    course_id          INT,
    required_course_id INT,
    UNIQUE  (course_id, required_course_id),
    FOREIGN KEY (course_id) REFERENCES Courses (course_id),
    FOREIGN KEY (required_course_id) REFERENCES Courses (course_id)
);

CREATE TABLE Antirequisites
(
    antirequisite_id        INT PRIMARY KEY AUTO_INCREMENT,
    course_id               INT,
    antirequisite_course_id INT,
    UNIQUE (course_id, antirequisite_course_id),
    CHECK (course_id <> antirequisite_course_id),
    FOREIGN KEY (course_id) REFERENCES Courses (course_id),
    FOREIGN KEY (antirequisite_course_id) REFERENCES Courses (course_id)
);

CREATE TABLE Enrollments
(
    enrollment_id   INT PRIMARY KEY AUTO_INCREMENT,
    student_id      INT,
    section_id      INT,
    enrollment_date DATE,
    final_grade     VARCHAR(5),
    status          VARCHAR(50),
    UNIQUE (student_id, section_id),
    FOREIGN KEY (student_id) REFERENCES Students (student_id),
    FOREIGN KEY (section_id) REFERENCES CourseSections (section_id)
);

CREATE TABLE Waitlists
(
    waitlist_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id  INT,
    section_id  INT,
    position    INT,
    date_joined DATE,
    UNIQUE (student_id, section_id),
    FOREIGN KEY (student_id) REFERENCES Students (student_id),
    FOREIGN KEY (section_id) REFERENCES CourseSections (section_id)
);

CREATE TABLE CoursePlans
(
    plan_id    INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    plan_name  VARCHAR(100) DEFAULT 'Active Plan',
    created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    active     BOOLEAN      DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES Students (student_id)
);

CREATE TABLE CoursePlanItems
(
    plan_item_id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id      INT,
    section_id   INT,
    date_added   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (plan_id, section_id),
    FOREIGN KEY (plan_id) REFERENCES CoursePlans (plan_id),
    FOREIGN KEY (section_id) REFERENCES CourseSections (section_id)
);

CREATE TABLE RegistrationAttempts
(
    attempt_id     INT PRIMARY KEY AUTO_INCREMENT,
    student_id     INT,
    section_id     INT,
    attempt_date   DATETIME DEFAULT CURRENT_TIMESTAMP,
    result         VARCHAR(20),
    failure_reason VARCHAR(100),
    FOREIGN KEY (student_id) REFERENCES Students (student_id),
    FOREIGN KEY (section_id) REFERENCES CourseSections (section_id)
);

CREATE TABLE AuditLog
(
    audit_id    INT PRIMARY KEY AUTO_INCREMENT,
    student_id  INT,
    action_type VARCHAR(50),
    section_id  INT,
    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    details     VARCHAR(255),
    FOREIGN KEY (student_id) REFERENCES Students (student_id),
    FOREIGN KEY (section_id) REFERENCES CourseSections (section_id)
);

CREATE TABLE DegreeRequirements
(
    requirement_id       INT PRIMARY KEY AUTO_INCREMENT,
    program_id           INT,
    requirement_name     VARCHAR(100),
    requirement_category VARCHAR(50),
    required_credits     DECIMAL(4, 2),
    FOREIGN KEY (program_id) REFERENCES Programs (program_id)
);

CREATE TABLE RequirementCourses
(
    requirement_course_id INT PRIMARY KEY AUTO_INCREMENT,
    requirement_id        INT,
    course_id             INT,
    FOREIGN KEY (requirement_id) REFERENCES DegreeRequirements (requirement_id),
    FOREIGN KEY (course_id) REFERENCES Courses (course_id)
);

CREATE TABLE Holds
(
    hold_id    INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    hold_type  VARCHAR(50),
    reason     VARCHAR(255),
    start_date DATE,
    end_date   DATE,
    active     BOOLEAN,
    FOREIGN KEY (student_id) REFERENCES Students (student_id)
);

CREATE TABLE SavedFilters
(
    filter_id    INT PRIMARY KEY AUTO_INCREMENT,
    student_id   INT,
    term_id      INT,
    faculty_id   INT,
    course_level INT,
    time_band    VARCHAR(20),
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Students (student_id),
    FOREIGN KEY (term_id) REFERENCES AcademicTerms (term_id),
    FOREIGN KEY (faculty_id) REFERENCES Faculties (faculty_id)
);
