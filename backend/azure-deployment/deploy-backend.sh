#!/bin/bash

# 🚀 Sallie Studio Backend Deployment Script
# Azure Container Instances Deployment

set -e

echo "🚀 Starting Sallie Studio Backend Deployment..."

# Configuration
RESOURCE_GROUP="SallieStudioRG"
LOCATION="East US"
BACKEND_NAME="sallie-studio-backend"
ACR_NAME="salliestudioregistry"
DB_NAME="sallie-db"
DB_USER="sallieadmin"
DB_PASSWORD="YourSecurePassword123!"
IMAGE_NAME="sallie-backend"

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

# Create PostgreSQL Database
log "Creating PostgreSQL database..."
az postgres server create \
    --name $DB_NAME \
    --resource-group $RESOURCE_GROUP \
    --location "$LOCATION" \
    --admin-user $DB_USER \
    --admin-password "$DB_PASSWORD" \
    --sku-name B_Gen5_2 \
    --output none || warning "Database already exists"

# Get database connection string
DB_CONNECTION_STRING=$(az postgres server show \
    --name $DB_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "fullyQualifiedDomainName" \
    --output tsv)

# Create Container Registry
log "Creating Azure Container Registry..."
az acr create \
    --name $ACR_NAME \
    --resource-group $RESOURCE_GROUP \
    --location "$LOCATION" \
    --sku Basic \
    --output none || warning "Container Registry already exists"

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || error "Backend directory not found"

# Create Dockerfile if it doesn't exist
if [ ! -f "Dockerfile" ]; then
    log "Creating Dockerfile..."
    cat > Dockerfile << EOF
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF
fi

# Create requirements.txt if it doesn't exist
if [ ! -f "requirements.txt" ]; then
    log "Creating requirements.txt..."
    cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.7
pydantic==2.5.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0
alembic==1.12.1
redis==5.0.1
celery==5.3.4
websockets==12.0
aiofiles==23.2.1
Pillow==10.1.0
numpy==1.24.3
pandas==2.1.4
scikit-learn==1.3.2
EOF
fi

# Build and push to Azure Container Registry
log "Building and pushing Docker image..."
az acr build \
    --registry $ACR_NAME \
    --image $IMAGE_NAME \
    --file Dockerfile \
    --output none

# Create Container Instance
log "Creating Container Instance..."
az container create \
    --name $BACKEND_NAME \
    --resource-group $RESOURCE_GROUP \
    --image "$ACR_NAME.azurecr.io/$IMAGE_NAME:latest" \
    --cpu 2 \
    --memory 4 \
    --ports 8000 \
    --environment-variables \
        DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_CONNECTION_STRING:5432/salliedb" \
        REDIS_URL="redis://sallie-redis:6379/0" \
        ENVIRONMENT="production" \
    --dns-name-label $BACKEND_NAME \
    --output none || warning "Container Instance already exists"

# Get the deployment URL
BACKEND_URL=$(az container show \
    --name $BACKEND_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "ipAddress.fqdn" \
    --output tsv)

# Wait for container to be ready
log "Waiting for container to be ready..."
sleep 30

# Health check
log "Performing health check..."
for i in {1..10}; do
    if curl -f "http://$BACKEND_URL:8000/health" &> /dev/null; then
        success "Backend is healthy!"
        break
    else
        if [ $i -eq 10 ]; then
            error "Backend health check failed after 10 attempts"
        fi
        log "Health check attempt $i/10 failed, retrying in 10 seconds..."
        sleep 10
    fi
done

success "Backend deployed successfully!"
echo -e "${GREEN}🌐 Backend URL: http://$BACKEND_URL:8000${NC}"
echo -e "${GREEN}🔗 API Documentation: http://$BACKEND_URL:8000/docs${NC}"

# Optional: Open in browser
if command -v open &> /dev/null; then
    log "Opening API documentation in browser..."
    open "http://$BACKEND_URL:8000/docs"
elif command -v xdg-open &> /dev/null; then
    log "Opening API documentation in browser..."
    xdg-open "http://$BACKEND_URL:8000/docs"
fi

echo -e "${GREEN}✅ Backend deployment completed successfully!${NC}"
