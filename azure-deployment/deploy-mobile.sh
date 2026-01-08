#!/bin/bash

# 🚀 Sallie Studio Mobile Backend Deployment Script
# Azure App Service Deployment

set -e

echo "🚀 Starting Sallie Studio Mobile Backend Deployment..."

# Configuration
RESOURCE_GROUP="SallieStudioRG"
LOCATION="East US"
MOBILE_API_NAME="sallie-studio-mobile-api"
PLAN_NAME="SallieStudioMobilePlan"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    error "Azure CLI is not installed. Please install it first."
fi

# Login to Azure (if not already logged in)
log "Checking Azure login status..."
if ! az account show &> /dev/null; then
    log "Please login to Azure..."
    az login
fi

# Create Resource Group (if it doesn't exist)
log "Creating resource group..."
az group create \
    --name $RESOURCE_GROUP \
    --location "$LOCATION" \
    --output none || warning "Resource group already exists"

# Create App Service Plan
log "Creating App Service Plan..."
az appservice plan create \
    --name $PLAN_NAME \
    --resource-group $RESOURCE_GROUP \
    --location "$LOCATION" \
    --sku B1 \
    --is-linux \
    --output none || warning "App Service Plan already exists"

# Navigate to mobile API directory
cd "$(dirname "$0")/../mobile/api" || error "Mobile API directory not found"

# Create package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    log "Creating package.json..."
    cat > package.json << EOF
{
  "name": "sallie-mobile-api",
  "version": "1.0.0",
  "description": "Sallie Studio Mobile Backend API",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^5.1.1",
    "mongoose": "^7.6.3",
    "multer": "^1.4.5-lts.1",
    "socket.io": "^4.7.4",
    "node-cron": "^3.0.3",
    "axios": "^1.6.2",
    "nodemailer": "^6.9.7",
    "firebase-admin": "^12.0.0",
    "react-native-firebase": "^18.6.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=18"
  }
}
EOF
fi

# Create index.js if it doesn't exist
if [ ! -f "index.js" ]; then
    log "Creating index.js..."
    cat > index.js << EOF
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mock authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Mock authentication
  if (username && password) {
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 1,
        username: username,
        email: `${username}@salliestudio.com`
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// Mock push notification endpoint
app.post('/api/notifications/send', (req, res) => {
  const { userId, title, message } = req.body;
  
  // Mock push notification
  console.log(`Push notification sent to user ${userId}: ${title} - ${message}`);
  
  res.json({
    success: true,
    notificationId: Date.now().toString()
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Mobile client connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  
  socket.on('message', (data) => {
    console.log('Message received:', data);
    socket.broadcast.emit('message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Mobile client disconnected:', socket.id);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(\`Mobile API server running on port \${PORT}\`);
});
EOF
fi

# Install dependencies
log "Installing dependencies..."
npm install

# Create web.config for Azure App Service
log "Creating web.config..."
cat > web.config << EOF
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="index.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^/node-inspector/*" ignoreCase="true" />
          <action type="Rewrite" url="/node-inspector/{R:1}" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{PATH_INFO}" />
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/node-inspector/" negate="true" />
          </conditions>
          <action type="Rewrite" url="index.js" />
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering allowDoubleEscaping="true" />
    </security>
  </system.webServer>
</configuration>
EOF

# Create startup script
log "Creating startup script..."
cat > startup.sh << EOF
#!/bin/sh
# App Service startup script
export NODE_ENV=production
export PORT=8080
npm start
EOF

chmod +x startup.sh

# Deploy to Azure App Service
log "Deploying to Azure App Service..."
az webapp create \
    --name $MOBILE_API_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $PLAN_NAME \
    --runtime "NODE|18-lts" \
    --output none || warning "Web App already exists"

# Configure web app
log "Configuring web app..."
az webapp config appsettings set \
    --name $MOBILE_API_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings "WEBSITE_NODE_DEFAULT_VERSION=18" \
    --output none

az webapp config appsettings set \
    --name $MOBILE_API_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings "WEBSITE_RUN_FROM_PACKAGE=1" \
    --output none

az webapp config appsettings set \
    --name $MOBILE_API_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings "WEBSITE_SITE_STARTUP_COMMAND=npm start" \
    --output none

# Deploy files
log "Deploying files..."
az webapp up \
    --name $MOBILE_API_NAME \
    --resource-group $RESOURCE_GROUP \
    --location "$LOCATION" \
    --runtime "NODE|18-lts" \
    --output none

# Get the deployment URL
MOBILE_API_URL=$(az webapp show \
    --name $MOBILE_API_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "defaultHostname" \
    --output tsv)

# Wait for deployment to complete
log "Waiting for deployment to complete..."
sleep 30

# Health check
log "Performing health check..."
for i in {1..10}; do
    if curl -f "https://$MOBILE_API_URL/health" &> /dev/null; then
        success "Mobile API is healthy!"
        break
    else
        if [ $i -eq 10 ]; then
            error "Mobile API health check failed after 10 attempts"
        fi
        log "Health check attempt $i/10 failed, retrying in 10 seconds..."
        sleep 10
    fi
done

success "Mobile API deployed successfully!"
echo -e "${GREEN}🌐 Mobile API URL: https://$MOBILE_API_URL${NC}"
echo -e "${GREEN}🔗 Health Check: https://$MOBILE_API_URL/health${NC}"

# Optional: Open in browser
if command -v open &> /dev/null; then
    log "Opening health check in browser..."
    open "https://$MOBILE_API_URL/health"
elif command -v xdg-open &> /dev/null; then
    log "Opening health check in browser..."
    xdg-open "https://$MOBILE_API_URL/health"
fi

echo -e "${GREEN}✅ Mobile API deployment completed successfully!${NC}"
