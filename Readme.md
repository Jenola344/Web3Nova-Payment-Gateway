# Web3Nova Academy Payment Backend

A secure, scalable payment backend system for managing student payments with stage-based payment support, real-time tracking, and comprehensive security features.

## Complete Folder Structure

```
web3nova-payment-gateway/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── src/
│   ├── config/
│   │   ├── db-config.js          # PostgreSQL configuration
│   │   ├── redis-config.js       # Redis configuration
│   │   ├── env-config.js         # Environment variables loader
│   │   ├── monnify-config.js     # Monnify payment gateway config
│   │   ├── aws-config.js         # AWS S3/SES configuration
│   │   └── logger-config.js      # Winston logger configuration
│   ├── controllers/
│   │   ├── auth-controller.js    # Authentication endpoints
│   │   ├── payment-controller.js # Payment processing endpoints
│   │   ├── user-controller.js    # User management endpoints
│   │   ├── admin-controller.js   # Admin dashboard endpoints
│   │   └── webhook-controller.js # Payment webhook handlers
│   ├── middleware/
│   │   ├── auth-middleware.js    # JWT verification
│   │   ├── access-control.js     # Role-based access control (RBAC)
│   │   ├── error-middleware.js   # Global error handler
│   │   ├── rate-limiter.js       # Rate limiting with Redis
│   │   ├── validator.js          # Request validation
│   │   ├── sanitizer.js          # Input sanitization
│   │   ├── cors-middleware.js    # CORS configuration
│   │   ├── csrf-protection.js    # CSRF token validation
│   │   └── audit-logger.js       # Audit trail logging
│   ├── routes/
│   │   ├── auth-routes.js        # /api/v1/auth
│   │   ├── payment-routes.js     # /api/v1/payments
│   │   ├── user-routes.js        # /api/v1/users
│   │   ├── admin-routes.js       # /api/v1/admin
│   │   └── webhook-routes.js     # /api/v1/webhooks
│   ├── services/
│   │   ├── auth-service.js       # Authentication logic
│   │   ├── payment-service.js    # Payment processing logic
│   │   ├── user-service.js       # User management logic
│   │   ├── redis-service.js      # Redis operations
│   │   ├── email-service.js      # Email notifications (AWS SES)
│   │   ├── sms-service.js        # SMS notifications
│   │   ├── notification-service.js # Multi-channel notifications
│   │   ├── security-service.js   # Encryption, hashing
│   │   ├── webhook-service.js    # Webhook signature verification
│   │   ├── transaction-service.js # Transaction management
│   │   └── analytics-service.js  # Payment analytics
│   ├── models/
│   │   ├── user-model.js         # User schema
│   │   ├── payment-model.js      # Payment schema
│   │   ├── transaction-model.js  # Transaction schema
│   │   ├── enrollment-model.js   # Student enrollment schema
│   │   ├── payment-plan-model.js # Payment plan schema
│   │   ├── audit-log-model.js    # Audit trail schema
│   │   └── webhook-log-model.js  # Webhook logs schema
│   ├── validators/
│   │   ├── auth-validator.js     # Auth request validation schemas
│   │   ├── payment-validator.js  # Payment validation schemas
│   │   └── user-validator.js     # User validation schemas
│   ├── utils/
│   │   ├── auth-utils.js         # JWT, password hashing
│   │   ├── crypto-utils.js       # Encryption/decryption
│   │   ├── response-utils.js     # Standardized API responses
│   │   ├── error-utils.js        # Custom error classes
│   │   ├── date-utils.js         # Date manipulation
│   │   ├── payment-utils.js      # Payment calculations
│   │   └── socket-utils.js       # WebSocket utilities
│   ├── constants/
│   │   ├── payment-constants.js  # Payment stages, statuses
│   │   ├── error-codes.js        # Error code definitions
│   │   └── roles.js              # User role definitions
│   ├── jobs/
│   │   ├── payment-reminder.js   # Scheduled payment reminders
│   │   ├── reconciliation.js     # Payment reconciliation
│   │   └── cleanup.js            # Database cleanup jobs
│   ├── websocket/
│   │   ├── socket-server.js      # Socket.IO server setup
│   │   └── socket-handlers.js    # Real-time event handlers
│   ├── database/
│   │   ├── migrations/           # Database migrations
│   │   │   ├── 001_create_users_table.sql
│   │   │   ├── 002_create_payments_table.sql
│   │   │   ├── 003_create_transactions_table.sql
│   │   │   ├── 004_create_enrollments_table.sql
│   │   │   └── 005_create_audit_logs_table.sql
│   │   ├── seeds/                # Seed data
│   │   │   └── initial-data.sql
│   │   └── db.js                 # Database connection pool
│   └── app.js                    # Express app configuration
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── payment.test.js
│   │   └── webhook.test.js
│   └── setup.js
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── nginx.conf
├── scripts/
│   ├── setup-db.sh              # Database setup script
│   ├── seed-data.sh             # Data seeding script
│   └── deploy.sh                # Deployment script
├── logs/                        # Application logs (gitignored)
├── .env.example
├── .env
├── .gitignore
├── server.js                    # Entry point
├── package.json
├── package-lock.json
├── README.md
```

## 🚀 Features

### Payment Features
- **Stage-based Payments**: 20%, 20%, 10% payment structure
- **Multiple Payment Methods**: Monnify integration (Cards, Bank Transfer, USSD)
- **Payment Tracking**: Real-time payment status updates
- **Automated Reminders**: Email/SMS reminders for pending payments
- **Payment Plans**: Flexible payment plan management
- **Reconciliation**: Automated payment reconciliation

### Security Features
- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control (Student, Admin, Super Admin)
- **Encryption**: AES-256 encryption for sensitive data
- **Rate Limiting**: Redis-based rate limiting (100 req/15min)
- **Input Sanitization**: XSS and SQL injection prevention
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Webhook Security**: Signature verification for webhooks
- **Audit Logging**: Comprehensive audit trail
- **Password Security**: Bcrypt hashing with salt rounds
- **Session Management**: Secure session handling with Redis

### Monitoring & Logging
- **Winston Logger**: Structured logging with log rotation
- **Audit Trails**: All payment actions logged
- **Error Tracking**: Centralized error logging
- **Performance Monitoring**: Request/response time tracking

### Real-time Features
- **WebSocket Support**: Real-time payment updates
- **Push Notifications**: Instant payment confirmations
- **Live Dashboard**: Admin dashboard with live metrics

## 📋 Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Redis >= 7.x
- Docker & Docker Compose
- AWS Account (for SES, S3)
- Monnify Account

## 🛠️ Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd web3nova-payment-gateway
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=web3nova_payments
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Monnify
MONNIFY_API_KEY=your_monnify_api_key
MONNIFY_SECRET_KEY=your_monnify_secret_key
MONNIFY_CONTRACT_CODE=your_contract_code
MONNIFY_BASE_URL=https://sandbox.monnify.com
MONNIFY_WEBHOOK_SECRET=your_webhook_secret

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=web3nova-payments
AWS_SES_FROM_EMAIL=noreply@web3nova.com

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key
ENCRYPTION_IV=your-16-character-iv

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://web3nova.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Payment Configuration
PAYMENT_STAGE_1_PERCENT=20
PAYMENT_STAGE_2_PERCENT=20
PAYMENT_STAGE_3_PERCENT=10
PAYMENT_EXPIRY_DAYS=7
```

### 4. Database Setup
```bash
# Using Docker
docker-compose up -d postgres redis

# Or manually
npm run db:setup
npm run db:migrate
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose -f docker/docker-compose.dev.yml up
```

### Production
```bash
docker-compose -f docker/docker-compose.yml up -d
```

## 📡 API Endpoints

### Authentication
```
POST   /api/v1/auth/register       - Register new user
POST   /api/v1/auth/login          - Login user
POST   /api/v1/auth/refresh        - Refresh access token
POST   /api/v1/auth/logout         - Logout user
POST   /api/v1/auth/forgot-password - Request password reset
POST   /api/v1/auth/reset-password - Reset password
GET    /api/v1/auth/verify-email   - Verify email address
```

### Payments
```
POST   /api/v1/payments/initialize    - Initialize payment
GET    /api/v1/payments/:id           - Get payment details
GET    /api/v1/payments/user/:userId  - Get user payments
POST   /api/v1/payments/:id/verify    - Verify payment
GET    /api/v1/payments/receipt/:id   - Download receipt
```

### Users
```
GET    /api/v1/users/profile          - Get user profile
PUT    /api/v1/users/profile          - Update profile
GET    /api/v1/users/payments         - Get user's payments
GET    /api/v1/users/enrollment       - Get enrollment status
```

### Admin
```
GET    /api/v1/admin/dashboard        - Dashboard metrics
GET    /api/v1/admin/payments         - All payments
GET    /api/v1/admin/users            - All users
PUT    /api/v1/admin/payments/:id     - Update payment status
GET    /api/v1/admin/analytics        - Payment analytics
GET    /api/v1/admin/audit-logs       - Audit trail
```

### Webhooks
```
POST   /api/v1/webhooks/monnify      - Monnify webhook
```

## 🔐 Security Best Practices

1. **Never commit `.env` file**
2. **Use strong JWT secrets** (min 32 characters)
3. **Enable SSL in production**
4. **Regularly update dependencies**
5. **Implement IP whitelisting for admin routes**
6. **Use prepared statements for SQL queries**
7. **Validate all webhook signatures**
8. **Encrypt sensitive data at rest**
9. **Implement request signing for critical operations**
10. **Regular security audits**

## 📊 Database Schema

### Users Table
```sql
- id (UUID, PK)
- email (UNIQUE)
- password_hash
- full_name
- phone_number
- role (student/admin/super_admin)
- is_email_verified
- created_at
- updated_at
```

### Payments Table
```sql
- id (UUID, PK)
- user_id (FK)
- enrollment_id (FK)
- amount
- stage (1/2/3)
- status (pending/completed/failed)
- payment_reference
- monnify_transaction_ref
- payment_method
- created_at
- completed_at
```

### Transactions Table
```sql
- id (UUID, PK)
- payment_id (FK)
- transaction_type
- amount
- status
- metadata (JSONB)
- created_at
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Test coverage
npm run test:coverage
```

## 📈 Monitoring

- Logs are stored in `/logs` directory
- Use `npm run logs` to tail logs
- Metrics available at `/api/v1/health`

## 🚀 Deployment

### AWS EC2 Deployment
1. Launch EC2 instance (Ubuntu 22.04)
2. Install Docker & Docker Compose
3. Clone repository
4. Configure environment variables
5. Run deployment script: `./scripts/deploy.sh`

### Environment-Specific Configs
- Development: `docker-compose.dev.yml`
- Production: `docker-compose.yml`