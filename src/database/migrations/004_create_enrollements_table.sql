-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill VARCHAR(100) NOT NULL,
    class_location VARCHAR(50) NOT NULL,
    scholarship_type VARCHAR(50) NOT NULL DEFAULT 'none',
    course_price DECIMAL(10, 2) NOT NULL,
    final_price DECIMAL(10, 2) NOT NULL,
    total_paid DECIMAL(10, 2) DEFAULT 0.00,
    payment_status VARCHAR(50) DEFAULT 'pending',
    enrollment_status VARCHAR(50) DEFAULT 'pending',
    start_date DATE,
    end_date DATE,
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_skill CHECK (skill IN ('Smart Contract', 'Backend Development', 'UI/UX Design', 'Frontend Development')),
    CONSTRAINT chk_class_location CHECK (class_location IN ('Online', 'Physical')),
    CONSTRAINT chk_scholarship_type CHECK (scholarship_type IN ('full', 'half', 'none')),
    CONSTRAINT chk_payment_status CHECK (payment_status IN ('pending', 'partial', 'completed')),
    CONSTRAINT chk_enrollment_status CHECK (enrollment_status IN ('pending', 'active', 'completed', 'cancelled', 'suspended')),
    CONSTRAINT chk_course_price CHECK (course_price >= 0),
    CONSTRAINT chk_final_price CHECK (final_price >= 0),
    CONSTRAINT chk_total_paid CHECK (total_paid >= 0),
    CONSTRAINT unique_user_skill UNIQUE (user_id, skill)
);

-- Create indexes
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_skill ON enrollments(skill);
CREATE INDEX idx_enrollments_payment_status ON enrollments(payment_status);
CREATE INDEX idx_enrollments_enrollment_status ON enrollments(enrollment_status);
CREATE INDEX idx_enrollments_scholarship_type ON enrollments(scholarship_type);
CREATE INDEX idx_enrollments_created_at ON enrollments(created_at);

-- Create trigger for enrollments table
CREATE TRIGGER update_enrollments_updated_at
    BEFORE UPDATE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE enrollments IS 'Stores student enrollment information';
COMMENT ON COLUMN enrollments.user_id IS 'Reference to users table';
COMMENT ON COLUMN enrollments.skill IS 'Course skill selected';
COMMENT ON COLUMN enrollments.class_location IS 'Class format: Online, Physical, or Hybrid';
COMMENT ON COLUMN enrollments.scholarship_type IS 'Scholarship type: full, half, or none';
COMMENT ON COLUMN enrollments.course_price IS 'Original course price';
COMMENT ON COLUMN enrollments.final_price IS 'Price after scholarship discount';
COMMENT ON COLUMN enrollments.total_paid IS 'Total amount paid so far';
COMMENT ON COLUMN enrollments.payment_status IS 'Payment status: pending, partial, or completed';
COMMENT ON COLUMN enrollments.enrollment_status IS 'Enrollment status';