-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'initiated',
    transaction_reference VARCHAR(255),
    external_reference VARCHAR(255),
    payment_method VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'NGN',
    description TEXT,
    metadata JSONB,
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    error_message TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_transaction_type CHECK (transaction_type IN ('payment', 'refund', 'reversal', 'chargeback')),
    CONSTRAINT chk_transaction_status CHECK (status IN ('initiated', 'pending', 'successful', 'failed', 'reversed')),
    CONSTRAINT chk_transaction_amount CHECK (amount >= 0),
    CONSTRAINT chk_transaction_payment_method CHECK (payment_method IN ('card', 'bank_transfer', 'ussd', 'account_transfer') OR payment_method IS NULL),
    CONSTRAINT chk_transaction_currency CHECK (currency IN ('NGN', 'USD'))
);

-- Create indexes
CREATE INDEX idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_transaction_reference ON transactions(transaction_reference);
CREATE INDEX idx_transactions_external_reference ON transactions(external_reference);
CREATE INDEX idx_transactions_transaction_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_completed_at ON transactions(completed_at);

-- Create GIN index for JSONB metadata
CREATE INDEX idx_transactions_metadata ON transactions USING GIN (metadata);

-- Create trigger for transactions table
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE transactions IS 'Stores detailed transaction records';
COMMENT ON COLUMN transactions.payment_id IS 'Reference to payments table (nullable for standalone transactions)';
COMMENT ON COLUMN transactions.transaction_type IS 'Type of transaction: payment, refund, reversal, or chargeback';
COMMENT ON COLUMN transactions.transaction_reference IS 'Internal transaction reference';
COMMENT ON COLUMN transactions.external_reference IS 'External gateway transaction reference';
COMMENT ON COLUMN transactions.metadata IS 'Additional transaction data in JSON format';