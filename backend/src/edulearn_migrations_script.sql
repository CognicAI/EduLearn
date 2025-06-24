-- EduLearn Database Reset Script
-- This script will drop all existing tables and recreate the complete database schema
-- Version 2.0 - PostgreSQL Optimized

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

---
-- Section 1: Drop All Tables (in reverse dependency order)
---

-- Drop indexes first
DROP INDEX IF EXISTS idx_platform_analytics_date;
DROP INDEX IF EXISTS idx_events_course_user;
DROP INDEX IF EXISTS idx_events_datetime_type;
DROP INDEX IF EXISTS idx_course_analytics_course_date;
DROP INDEX IF EXISTS idx_user_analytics_user_created;
DROP INDEX IF EXISTS idx_messages_recipient_read;
DROP INDEX IF EXISTS idx_notifications_user_unread;
DROP INDEX IF EXISTS idx_grades_submission_released;
DROP INDEX IF EXISTS idx_submissions_assignment_student;
DROP INDEX IF EXISTS idx_assignments_course_due;
DROP INDEX IF EXISTS idx_lesson_progress_enrollment;
DROP INDEX IF EXISTS idx_enrollments_course_active;
DROP INDEX IF EXISTS idx_enrollments_student_status;
DROP INDEX IF EXISTS idx_categories_slug;
DROP INDEX IF EXISTS idx_courses_status_published;
DROP INDEX IF EXISTS idx_courses_category_featured;
DROP INDEX IF EXISTS idx_courses_instructor_status;
DROP INDEX IF EXISTS idx_users_last_login;
DROP INDEX IF EXISTS idx_users_role_active;
DROP INDEX IF EXISTS idx_users_email;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS instructor_reviews CASCADE;
DROP TABLE IF EXISTS course_reviews CASCADE;
DROP TABLE IF EXISTS file_associations CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS platform_analytics CASCADE;
DROP TABLE IF EXISTS course_analytics CASCADE;
DROP TABLE IF EXISTS user_analytics CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS calendar_preferences CASCADE;
DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS discussion_posts CASCADE;
DROP TABLE IF EXISTS discussions CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS assignment_analytics CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS course_prerequisites CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_activity_logs CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS review_status;
DROP TYPE IF EXISTS virus_scan_status;
DROP TYPE IF EXISTS coupon_discount_type;
DROP TYPE IF EXISTS transaction_status;
DROP TYPE IF EXISTS transaction_type;
DROP TYPE IF EXISTS payment_method_type;
DROP TYPE IF EXISTS log_level;
DROP TYPE IF EXISTS email_status;
DROP TYPE IF EXISTS notification_priority;
DROP TYPE IF EXISTS notification_category;
DROP TYPE IF EXISTS notification_type;
DROP TYPE IF EXISTS calendar_view;
DROP TYPE IF EXISTS attendee_status;
DROP TYPE IF EXISTS event_status;
DROP TYPE IF EXISTS event_type;
DROP TYPE IF EXISTS message_type;
DROP TYPE IF EXISTS audience_target;
DROP TYPE IF EXISTS priority_level;
DROP TYPE IF EXISTS quiz_attempt_status;
DROP TYPE IF EXISTS submission_status;
DROP TYPE IF EXISTS assignment_status;
DROP TYPE IF EXISTS assignment_type;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS enrollment_status;
DROP TYPE IF EXISTS course_status;
DROP TYPE IF EXISTS course_level;
DROP TYPE IF EXISTS activity_type;
DROP TYPE IF EXISTS theme_setting;
DROP TYPE IF EXISTS device_type;
DROP TYPE IF EXISTS experience_level;
DROP TYPE IF EXISTS user_role;

---
-- Section 2: ENUM Type Definitions
---
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE experience_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE device_type AS ENUM ('desktop', 'mobile', 'tablet');
CREATE TYPE theme_setting AS ENUM ('light', 'dark', 'auto');
CREATE TYPE activity_type AS ENUM ('login', 'logout', 'course_access', 'assignment_submit',
'discussion_post', 'profile_update');
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'dropped', 'suspended');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'free');

CREATE TYPE assignment_type AS ENUM ('essay', 'code', 'quiz', 'project', 'file_upload',
'discussion');
CREATE TYPE assignment_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE submission_status AS ENUM ('submitted', 'graded', 'returned');
CREATE TYPE quiz_attempt_status AS ENUM ('in_progress', 'submitted', 'abandoned');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE audience_target AS ENUM ('all', 'students', 'teachers', 'course_specific');
CREATE TYPE message_type AS ENUM ('direct', 'system', 'notification');
CREATE TYPE event_type AS ENUM ('class', 'assignment_due', 'exam', 'meeting', 'webinar',
'holiday', 'announcement', 'maintenance');
CREATE TYPE event_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE attendee_status AS ENUM ('invited', 'accepted', 'declined', 'tentative');
CREATE TYPE calendar_view AS ENUM ('month', 'week', 'day', 'agenda');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
CREATE TYPE notification_category AS ENUM ('assignment', 'grade', 'announcement', 'course',
'system', 'message', 'calendar');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE email_status AS ENUM ('pending', 'sent', 'failed', 'bounced');
CREATE TYPE log_level AS ENUM ('debug', 'info', 'warning', 'error', 'critical');
CREATE TYPE payment_method_type AS ENUM ('credit_card', 'debit_card', 'paypal',
'bank_transfer', 'wallet');
CREATE TYPE transaction_type AS ENUM ('purchase', 'refund', 'subscription', 'credit',
'discount');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled',
'refunded');
CREATE TYPE coupon_discount_type AS ENUM ('percentage', 'fixed_amount');
CREATE TYPE virus_scan_status AS ENUM ('pending', 'clean', 'infected', 'failed');

CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

---
-- Section 3: User Management Tables (5 tables)
---
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    profile_image VARCHAR(500),
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    website VARCHAR(255),
    linkedin VARCHAR(255),
    github VARCHAR(255),
    skills JSON,
    interests JSON,
    academic_background JSON,
    experience_level experience_level DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    refresh_token TEXT UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type device_type DEFAULT 'desktop',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_email BOOLEAN DEFAULT true,
    notification_push BOOLEAN DEFAULT true,
    notification_sms BOOLEAN DEFAULT false,
    theme theme_setting DEFAULT 'light',
    dashboard_layout JSON,
    privacy_settings JSON,
    language_preference VARCHAR(10) DEFAULT 'en',
    timezone_preference VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---
-- Section 4: Course Management Tables (7 tables)
---
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7) DEFAULT '#3B82F6',
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    course_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    thumbnail VARCHAR(500),
    cover_image VARCHAR(500),
    level course_level DEFAULT 'beginner',
    price DECIMAL(10,2) DEFAULT 0.00,
    discount_price DECIMAL(10,2),
    duration_weeks INTEGER,
    duration_hours INTEGER,
    max_students INTEGER,
    prerequisites JSON,
    learning_outcomes JSON,
    status course_status DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    lesson_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    video_duration INTEGER DEFAULT 0,
    sort_order INTEGER NOT NULL,
    is_free BOOLEAN DEFAULT false,
    attachments JSON,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    status enrollment_status DEFAULT 'active',
    payment_status payment_status DEFAULT 'pending',
    certificate_issued BOOLEAN DEFAULT false,
    last_accessed TIMESTAMP,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    watched_percentage DECIMAL(5,2) DEFAULT 0.00,
    completed BOOLEAN DEFAULT false,
    first_watched_at TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent_minutes INTEGER DEFAULT 0,
    notes TEXT,
    bookmark_time INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, lesson_id)
);

CREATE TABLE course_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, prerequisite_course_id)
);

---
-- Section 5: Assignment & Assessment Tables (6 tables)
---
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES course_modules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    assignment_type assignment_type NOT NULL,
    max_points INTEGER NOT NULL DEFAULT 100,
    due_date TIMESTAMP,
    late_submission_allowed BOOLEAN DEFAULT false,
    late_penalty_percentage INTEGER DEFAULT 0,
    allow_multiple_attempts BOOLEAN DEFAULT false,
    max_attempts INTEGER DEFAULT 1,
    rubric JSON,
    attachments JSON,
    status assignment_status DEFAULT 'draft',
    submission_count INTEGER DEFAULT 0,
    graded_count INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_number INTEGER DEFAULT 1,
    content TEXT,
    attachments JSON,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_late BOOLEAN DEFAULT false,
    status submission_status DEFAULT 'submitted',
    plagiarism_score DECIMAL(5,2),
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    grader_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    points_earned DECIMAL(5,2) NOT NULL,
    points_possible DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    letter_grade VARCHAR(5),
    feedback TEXT,
    rubric_scores JSON,
    graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    time_limit_minutes INTEGER,
    shuffle_questions BOOLEAN DEFAULT false,
    show_results_immediately BOOLEAN DEFAULT true,
    allow_backtrack BOOLEAN DEFAULT true,
    passing_score DECIMAL(5,2) DEFAULT 60.00,
    questions JSON NOT NULL,
    question_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    answers JSON,
    score DECIMAL(5,2) DEFAULT 0.00,
    percentage DECIMAL(5,2) DEFAULT 0.00,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    time_taken_minutes INTEGER DEFAULT 0,
    status quiz_attempt_status DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignment_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    submissions_count INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    late_submissions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, metric_date)
);

---
-- Section 6: Communication & Collaboration Tables (4 tables)
---
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority priority_level DEFAULT 'medium',
    target_audience audience_target DEFAULT 'all',
    scheduled_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    post_count INTEGER DEFAULT 0,
    participant_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE discussion_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES discussion_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments JSON,
    is_solution BOOLEAN DEFAULT false,
    vote_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    attachments JSON,
    message_type message_type DEFAULT 'direct',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---
-- Section 7: Events & Calendar Tables (3 tables)
---
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    location VARCHAR(255),
    meeting_url VARCHAR(500),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule VARCHAR(255),
    attendee_limit INTEGER,
    is_public BOOLEAN DEFAULT true,
    color VARCHAR(7) DEFAULT '#3B82F6',
    status event_status DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status attendee_status DEFAULT 'invited',
    response_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

CREATE TABLE calendar_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    default_view calendar_view DEFAULT 'month',
    show_weekends BOOLEAN DEFAULT true,
    event_colors JSON,
    notification_settings JSON,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---
-- Section 8: Notification & Alert Tables (2 tables)
---
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    category notification_category NOT NULL,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSON,
    priority notification_priority DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email_type VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT,
    status email_status DEFAULT 'pending',
    sent_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    error_message TEXT,
    external_id VARCHAR(255),
    template_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---
-- Section 9: Analytics & Tracking Tables (4 tables)
---
CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(100) NOT NULL,
    event_action VARCHAR(100) NOT NULL,
    page_url VARCHAR(500),
    referrer_url VARCHAR(500),
    user_agent TEXT,
    ip_address VARCHAR(45),
    session_id VARCHAR(255),
    device_type device_type,
    browser_name VARCHAR(100),
    os_name VARCHAR(100),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    enrollments_count INTEGER DEFAULT 0,
    completions_count INTEGER DEFAULT 0,
    average_progress DECIMAL(5,2) DEFAULT 0.00,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_time_spent INTEGER DEFAULT 0,
    active_students INTEGER DEFAULT 0,
    dropout_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, metric_date)
);

CREATE TABLE platform_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_registrations INTEGER DEFAULT 0,
    total_courses INTEGER DEFAULT 0,
    active_courses INTEGER DEFAULT 0,
    total_enrollments INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    average_grade DECIMAL(5,2) DEFAULT 0.00,
    platform_uptime DECIMAL(5,2) DEFAULT 100.00,
    server_response_time INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date)
);

CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level log_level NOT NULL,
    message TEXT NOT NULL,
    context JSON,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    request_url VARCHAR(500),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---
-- Section 10: Payment & Subscription Tables (3 tables)
---
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type payment_method_type NOT NULL,
    provider VARCHAR(50) NOT NULL,
    external_id VARCHAR(255),
    last_four VARCHAR(4),
    expiry_month INTEGER,
    expiry_year INTEGER,
    cardholder_name VARCHAR(255),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    transaction_type transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status transaction_status DEFAULT 'pending',
    external_transaction_id VARCHAR(255),
    payment_gateway VARCHAR(50),
    gateway_response JSON,
    description TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type coupon_discount_type NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2) DEFAULT 0.00,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---
-- Section 11: File & Media Management Tables (2 tables)
---
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(255),
    storage_provider VARCHAR(50) DEFAULT 'local',
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    virus_scan_status virus_scan_status DEFAULT 'pending',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE file_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    association_type VARCHAR(50) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---
-- Section 12: Review & Rating Tables (2 tables)
---
CREATE TABLE course_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    status review_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, student_id)
);

CREATE TABLE instructor_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    criteria_scores JSON,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---
-- Section 13: Essential Indexes for Performance
---

-- User performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_users_last_login ON users(last_login);

-- Course discovery and management
CREATE INDEX idx_courses_instructor_status ON courses(instructor_id, status);
CREATE INDEX idx_courses_category_featured ON courses(category_id, featured);
CREATE INDEX idx_courses_status_published ON courses(status, published_at);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Enrollment and progress tracking
CREATE INDEX idx_enrollments_student_status ON enrollments(student_id, status);
CREATE INDEX idx_enrollments_course_active ON enrollments(course_id, status);
CREATE INDEX idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);

-- Assignment and grading workflow
CREATE INDEX idx_assignments_course_due ON assignments(course_id, due_date);
CREATE INDEX idx_submissions_assignment_student ON submissions(assignment_id, student_id);
CREATE INDEX idx_grades_submission_released ON grades(submission_id, released_at);

-- Communication and notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_messages_recipient_read ON messages(recipient_id, is_read);

-- Analytics and reporting
CREATE INDEX idx_user_analytics_user_created ON user_analytics(user_id, created_at);
CREATE INDEX idx_course_analytics_course_date ON course_analytics(course_id, metric_date);
CREATE INDEX idx_platform_analytics_date ON platform_analytics(metric_date);

-- Events and calendar
CREATE INDEX idx_events_datetime_type ON events(start_datetime, event_type);
CREATE INDEX idx_events_course_user ON events(course_id, created_by);

---
-- Section 14: Database Reset Complete
---
-- All tables have been dropped and recreated with proper indexes
-- The database is now ready for use with the EduLearn application