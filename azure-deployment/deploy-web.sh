#!/bin/bash

# 🚀 Sallie Studio Web Application Deployment Script
# Azure Static Web Apps Deployment

set -e

echo "🚀 Starting Sallie Studio Web Deployment..."

# Configuration
RESOURCE_GROUP="SallieStudioRG"
LOCATION="East US"
WEB_APP_NAME="sallie-studio-web"
API_URL="https://sallie-studio-backend.azurewebsites.net"

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

# Create Static Web App
log "Creating Static Web App..."
az staticwebapp create \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --location "$LOCATION" \
    --output none || warning "Static Web App already exists"

# Navigate to web directory
cd "$(dirname "$0")/../web" || error "Web directory not found"

# Install dependencies
log "Installing dependencies..."
npm install

# Build the application
log "Building application..."
npm run build

# Deploy to Azure
log "Deploying to Azure Static Web Apps..."
az staticwebapp deploy \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --source . \
    --output none

# Set environment variables
log "Setting environment variables..."
az staticwebapp config appsettings set \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings "NEXT_PUBLIC_API_URL=$API_URL" \
    --output none || warning "Failed to set environment variables"

# Get the deployment URL
WEB_URL=$(az staticwebapp show \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "defaultHostname" \
    --output tsv)

success "Web application deployed successfully!"
echo -e "${GREEN}🌐 Web URL: https://$WEB_URL${NC}"

# Optional: Open in browser
if command -v open &> /dev/null; then
    log "Opening in browser..."
    open "https://$WEB_URL"
elif command -v xdg-open &> /dev/null; then
    log "Opening in browser..."
    xdg-open "https://$WEB_URL"
fi

echo -e "${GREEN}✅ Web deployment completed successfully!${NC}"
