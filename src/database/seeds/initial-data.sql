-- Initial seed data for Web3Nova Payment System
-- This file contains sample data for development and testing

-- Insert default admin user
-- Password: Admin@123456 (bcrypt hash)
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_email_verified, is_active)
VALUES 
(
    'a0000000-0000-0000-0000-000000000001',
    'admin@web3nova.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5QKJlKzCB3pei',
    'System Administrator',
    '08012345678',
    'super_admin',
    true,
    true
),
(
    'a0000000-0000-0000-0000-000000000002',
    'support@web3nova.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5QKJlKzCB3pei',
    'Support Admin',
    '08012345679',
    'admin',
    true,
    true
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample students from CSV data (Full Scholarship)
INSERT INTO users (email, password_hash, full_name, phone_number, role, is_email_verified, is_active)
VALUES 
('ismakinde@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5QKJlKzCB3pei', 'Isaac Makinde', '08053744603', 'student', true, true),
('shittuisrael004@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5QKJlKzCB3pei', 'Shittu Israel Oluwafisayomi', '08136695747', 'student', true, true),
('pamilerinfash@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5QKJlKzCB3pei', 'Fasumirin Pamilerin Israel', '09031955417', 'student', true, true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample enrollments for full scholarship students
INSERT INTO enrollments (user_id, skill, class_location, scholarship_type, course_price, final_price, payment_status, enrollment_status)
SELECT 
    u.id,
    'Smart Contract',
    'Physical',
    'full',
    100000.00,
    0.00,
    'completed',
    'active'
FROM users u
WHERE u.email = 'ismakinde@gmail.com'
ON CONFLICT (user_id, skill) DO NOTHING;

INSERT INTO enrollments (user_id, skill, class_location, scholarship_type, course_price, final_price, payment_status, enrollment_status)
SELECT 
    u.id,
    'Smart Contract',
    'Physical',
    'full',
    100000.00,
    0.00,
    'completed',
    'active'
FROM users u
WHERE u.email = 'shittuisrael004@gmail.com'
ON CONFLICT (user_id, skill) DO NOTHING;

-- Insert sample students (Half Scholarship)
INSERT INTO users (email, password_hash, full_name, phone_number, role, is_email_verified, is_active)
VALUES 
('oluwasinapromise@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5QKJlKzCB3pei', 'Oluwasina Dunsin', '09067124424', 'student', true, true),
('keendamiel03@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5QKJlKzCB3pei', 'Olugboja Kehinde Opeyemi', '07066576774', 'student', true, true)
ON CONFLICT (email) DO NOTHING;

-- Insert enrollments for half scholarship students
INSERT INTO enrollments (user_id, skill, class_location, scholarship_type, course_price, final_price, payment_status, enrollment_status)
SELECT 
    u.id,
    'Smart Contract',
    'Physical',
    'half',
    100000.00,
    50000.00,
    'pending',
    'pending'
FROM users u
WHERE u.email = 'oluwasinapromise@gmail.com'
ON CONFLICT (user_id, skill) DO NOTHING;

-- Insert sample audit log entries
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
SELECT 
    u.id,
    'register',
    'user',
    u.id,
    jsonb_build_object(
        'registration_source', 'seed_data',
        'timestamp', CURRENT_TIMESTAMP
    )
FROM users u
WHERE u.role = 'super_admin'
ON CONFLICT DO NOTHING;

-- Insert system configuration metadata

-- Create a view for easy reporting
CREATE OR REPLACE VIEW enrollment_summary AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    u.phone_number,
    e.skill,
    e.class_location,
    e.scholarship_type,
    e.course_price,
    e.final_price,
    e.total_paid,
    e.payment_status,
    e.enrollment_status,
    ROUND(((e.total_paid / NULLIF(e.final_price, 0)) * 100)::numeric, 2) as payment_progress_percentage,
    e.created_at as enrollment_date
FROM 
    users u
    INNER JOIN enrollments e ON u.id = e.user_id
WHERE 
    u.role = 'student';

-- Create a view for payment tracking
CREATE OR REPLACE VIEW payment_tracking AS
SELECT 
    p.id as payment_id,
    p.payment_reference,
    u.full_name,
    u.email,
    e.skill,
    p.stage,
    p.amount,
    p.status,
    p.payment_method,
    p.created_at as payment_initiated,
    p.paid_at,
    p.expires_at
FROM 
    payments p
    INNER JOIN users u ON p.user_id = u.id
    INNER JOIN enrollments e ON p.enrollment_id = e.id;

-- Create a view for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
    (SELECT COUNT(*) FROM enrollments) as total_enrollments,
    (SELECT COUNT(*) FROM enrollments WHERE enrollment_status = 'active') as active_enrollments,
    (SELECT COUNT(*) FROM payments) as total_payments,
    (SELECT COUNT(*) FROM payments WHERE status = 'completed') as completed_payments,
    (SELECT COUNT(*) FROM payments WHERE status = 'pending') as pending_payments,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed') as total_revenue,
    (SELECT COUNT(DISTINCT user_id) FROM payments WHERE status = 'completed') as paying_students;

-- Grant permissions (adjust as needed for your setup)
GRANT SELECT ON enrollment_summary TO postgres;
GRANT SELECT ON payment_tracking TO postgres;
GRANT SELECT ON dashboard_stats TO postgres;

-- Add helpful comments
COMMENT ON VIEW enrollment_summary IS 'Summary of all student enrollments with payment progress';
COMMENT ON VIEW payment_tracking IS 'Detailed payment tracking information';
COMMENT ON VIEW dashboard_stats IS 'Real-time dashboard statistics';

-- Insert welcome message in audit log
INSERT INTO audit_logs (action, entity_type, metadata)
VALUES (
    'system',
    'system',
    jsonb_build_object(
        'event', 'database_seeded',
        'message', 'Database initialized with seed data',
        'timestamp', CURRENT_TIMESTAMP,
        'version', '1.0.0'
    )
);