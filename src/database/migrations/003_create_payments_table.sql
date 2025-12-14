-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    payment_reference VARCHAR(255) UNIQUE NOT NULL,
    monnify_transaction_ref VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    stage INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_url TEXT,
    checkout_url TEXT,
    payment_description TEXT,
    currency VARCHAR(10) DEFAULT 'NGN',
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    transaction_fee DECIMAL(10, 2) DEFAULT 0.00,
    paid_at TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_amount CHECK (amount > 0),
    CONSTRAINT chk_stage CHECK (stage IN (1, 2, 3)),
    CONSTRAINT chk_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'expired', 'refunded')),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('card', 'bank_transfer', 'ussd', 'account_transfer') OR payment_method IS NULL),
    CONSTRAINT chk_currency CHECK (currency IN ('NGN', 'USD')),
    CONSTRAINT chk_transaction_fee CHECK (transaction_fee >= 0),
    CONSTRAINT unique_user_enrollment_stage UNIQUE (user_id, enrollment_id, stage)
);

-- Create indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_enrollment_id ON payments(enrollment_id);
CREATE INDEX idx_payments_reference ON payments(payment_reference);
CREATE INDEX idx_payments_monnify_ref ON payments(monnify_transaction_ref);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stage ON payments(stage);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);
CREATE INDEX idx_payments_expires_at ON payments(expires_at);

-- Create GIN index for JSONB metadata
CREATE INDEX idx_payments_metadata ON payments USING GIN (metadata);

-- Create trigger for payments table
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update enrollment total_paid and payment_status
CREATE OR REPLACE FUNCTION update_enrollment_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Update total_paid in enrollments
        UPDATE enrollments
        SET total_paid = total_paid + NEW.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.enrollment_id;
        
        -- Check if all payments are completed and update payment_status
        UPDATE enrollments e
        SET payment_status = CASE
            WHEN e.total_paid >= e.final_price THEN 'completed'
            WHEN e.total_paid > 0 THEN 'partial'
            ELSE 'pending'
        END,
        updated_at = CURRENT_TIMESTAMP
        WHERE e.id = NEW.enrollment_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update enrollment when payment is completed
CREATE TRIGGER update_enrollment_on_payment
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_enrollment_payment_status();

-- Add comments
COMMENT ON TABLE payments IS 'Stores payment transaction information';
COMMENT ON COLUMN payments.payment_reference IS 'Unique payment reference';
COMMENT ON COLUMN payments.monnify_transaction_ref IS 'Monnify transaction reference';
COMMENT ON COLUMN payments.stage IS 'Payment stage: 1, 2, or 3';
COMMENT ON COLUMN payments.status IS 'Payment status';
COMMENT ON COLUMN payments.metadata IS 'Additional payment metadata in JSON format';