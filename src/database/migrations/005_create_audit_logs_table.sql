-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path VARCHAR(500),
    status_code INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_action CHECK (action IN (
        'create', 'read', 'update', 'delete',
        'login', 'logout', 'register',
        'payment_initiated', 'payment_completed', 'payment_failed',
        'password_reset', 'email_verified',
        'enrollment_created', 'enrollment_updated',
        'webhook_received', 'admin_action'
    )),
    CONSTRAINT chk_entity_type CHECK (entity_type IN (
        'user', 'payment', 'enrollment', 'transaction',
        'auth', 'webhook', 'system'
    )),
    CONSTRAINT chk_request_method CHECK (request_method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE') OR request_method IS NULL)
);

-- Create indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Create GIN indexes for JSONB columns
CREATE INDEX idx_audit_logs_old_values ON audit_logs USING GIN (old_values);
CREATE INDEX idx_audit_logs_new_values ON audit_logs USING GIN (new_values);
CREATE INDEX idx_audit_logs_metadata ON audit_logs USING GIN (metadata);

-- Create webhook_logs table for webhook-specific logging
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    signature VARCHAR(500),
    signature_valid BOOLEAN,
    status VARCHAR(50) DEFAULT 'received',
    processing_result JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_webhook_provider CHECK (provider IN ('monnify', 'internal')),
    CONSTRAINT chk_webhook_status CHECK (status IN ('received', 'processing', 'processed', 'failed', 'ignored'))
);

-- Create indexes for webhook_logs
CREATE INDEX idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX idx_webhook_logs_processed_at ON webhook_logs(processed_at);

-- Create GIN index for webhook payload
CREATE INDEX idx_webhook_logs_payload ON webhook_logs USING GIN (payload);

-- Add comments
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system actions';
COMMENT ON COLUMN audit_logs.action IS 'Action performed';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity affected';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous values (for updates)';
COMMENT ON COLUMN audit_logs.new_values IS 'New values (for creates and updates)';

COMMENT ON TABLE webhook_logs IS 'Stores webhook event logs';
COMMENT ON COLUMN webhook_logs.provider IS 'Webhook provider (e.g., monnify)';
COMMENT ON COLUMN webhook_logs.signature_valid IS 'Whether the webhook signature was valid';