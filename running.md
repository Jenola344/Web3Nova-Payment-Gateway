## 🚀 Quick Setup Steps - From Files to Deployment

### **Step 1: Copy All Files**
```bash
# Create project directory
mkdir web3nova-payment-gateway
cd web3nova-payment-gateway

# Copy all generated files maintaining this structure:
web3nova-payment-gateway/
├── src/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── database/
│   ├── jobs/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── websocket/
│   └── app.js
├── docker/
├── scripts/
├── data/
├── .env.example
├── .gitignore
├── DockerFile
├── docker-compose.dev.yml
├── server.js
├── package.json
└── README.md
```

### **Step 2: Install Dependencies**
```bash
npm install 
```

### **Step 3: Configure Environment**
```bash
cp .env.example .env
```

### **Step 4: Start Database & Redis**

```bash
#this is to create the image for the project
docker build -f docker/dockerfile -t web3nova-payment-gateway .
#this is to run the image
docker-compose -f docker/docker-compose-dev.yml --env-file .env up -d postgres redis
```

### **Step 5: Initialize Database**
```bash
# Run migrations
node scripts/migrate.js

# Seed initial data
node scripts/seed.js
```

### **Step 6: Start Application**
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

### **Step 7: Verify Setup**
```bash
# Health check
curl http://localhost:5000/health

# Test registration
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456",
    "confirmPassword": "Test@123456",
    "fullName": "Test User",
    "phoneNumber": "08012345678"
  }'

# Test login (default admin)
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@web3nova.com",
    "password": "Admin@123456"
  }'
```

---

## 🚢 **DEPLOYMENT STEPS**

### **Production Deployment (AWS/VPS)**

```bash
# 1. Server Setup
ssh user@your-server-ip

# 2. Install dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql redis docker.io docker-compose nginx

# 3. Clone/Upload project
git clone <your-repo>
cd web3nova-payment-gateway

# 4. Configure production environment
cp .env.example .env
nano .env
# Set NODE_ENV=production
# Set strong production secrets
# Set production database credentials
# Set Monnify production keys

# 5. Install dependencies
npm ci --only=production

# 6. Setup database
sudo -u postgres createdb web3nova_payments
node scripts/migrate.js
node scripts/seed.js

# 7. Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name web3nova-payment-gateway
pm2 startup
pm2 save

# 8. Configure Nginx (optional)
sudo nano /etc/nginx/sites-available/web3nova
# Add reverse proxy config

# 9. Enable SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### **Docker Production Deployment**

```bash
# 1. Build production image
docker-compose -f docker/docker-compose.yml build

# 2. Start services
docker-compose -f docker/docker-compose.yml up -d

# 3. Run migrations
docker-compose -f docker/docker-compose.yml exec app node scripts/migrate.js

# 4. Check logs
docker-compose -f docker/docker-compose.yml logs -f
```

---