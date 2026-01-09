#!/bin/bash

# Sallie Studio Azure Deployment Script
# This script deploys the entire backend to Azure

set -e

echo "🚀 Starting Sallie Studio Azure Deployment..."

# Configuration
RESOURCE_GROUP="sallie"
LOCATION="centralus"
ACR_NAME="salliestudioregistry"
APP_SERVICE_PLAN="sallie"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Azure CLI is installed
check_azure_cli() {
    log_info "Checking Azure CLI installation..."
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if logged in
    if ! az account show &> /dev/null; then
        log_warn "Not logged into Azure. Please run 'az login' first."
        exit 1
    fi
    
    log_info "Azure CLI is installed and configured."
}

# Create resource group if it doesn't exist
create_resource_group() {
    log_info "Creating resource group: $RESOURCE_GROUP"
    
    if az group show --name "$RESOURCE_GROUP" &> /dev/null; then
        log_warn "Resource group already exists."
    else
        az group create \
            --name "$RESOURCE_GROUP" \
            --location "$LOCATION" \
            --tags "project=sallie-studio" "environment=production"
        log_info "Resource group created successfully."
    fi
}

# Create Azure Container Registry
create_acr() {
    log_info "Creating Azure Container Registry: $ACR_NAME"
    
    if az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        log_warn "ACR already exists."
    else
        az acr create \
            --resource-group "$RESOURCE_GROUP" \
            --name "$ACR_NAME" \
            --sku "Basic" \
            --admin-enabled true
        log_info "ACR created successfully."
    fi
    
    # Login to ACR
    az acr login --name "$ACR_NAME"
}

# Build and push Docker images
build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    services=("api-gateway" "auth-service" "chat-service" "analytics-service" 
              "notification-service" "file-service" "ai-service" "websocket-service" 
              "python-ai-service")
    
    for service in "${services[@]}"; do
        log_info "Building $service..."
        
        # Build Docker image
        docker build -t "$ACR_NAME.azurecr.io/$service:latest" "../../services/$service"
        
        # Push to ACR
        docker push "$ACR_NAME.azurecr.io/$service:latest"
        
        log_info "$service built and pushed successfully."
    done
}

# Create App Service Plan
create_app_service_plan() {
    log_info "Creating App Service Plan: $APP_SERVICE_PLAN"
    
    if az appservice plan show \
        --name "$APP_SERVICE_PLAN" \
        --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        log_warn "App Service Plan already exists."
    else
        az appservice plan create \
            --name "$APP_SERVICE_PLAN" \
            --resource-group "$RESOURCE_GROUP" \
            --location "$LOCATION" \
            --sku "B1" \
            --is-linux
        log_info "App Service Plan created successfully."
    fi
}

# Create Web Apps for each service
create_web_apps() {
    log_info "Creating Web Apps..."
    
    services=("api-gateway" "auth-service" "chat-service" "analytics-service" 
              "notification-service" "file-service" "ai-service" "websocket-service" 
              "python-ai-service")
    
    for service in "${services[@]}"; do
        app_name="sallie-$service"
        
        log_info "Creating Web App: $app_name"
        
        if az webapp show \
            --name "$app_name" \
            --resource-group "$RESOURCE_GROUP" &> /dev/null; then
            log_warn "Web App $app_name already exists."
        else
            az webapp create \
                --resource-group "$RESOURCE_GROUP" \
                --plan "$APP_SERVICE_PLAN" \
                --name "$app_name" \
                --deployment-container-image-name "$ACR_NAME.azurecr.io/$service:latest"
            
            # Configure app settings
            configure_app_settings "$app_name" "$service"
            
            log_info "Web App $app_name created successfully."
        fi
    done
}

# Configure app settings for each service
configure_app_settings() {
    local app_name=$1
    local service=$2
    
    log_info "Configuring app settings for $app_name"
    
    # Base settings
    az webapp config appsettings set \
        --resource-group "$RESOURCE_GROUP" \
        --name "$app_name" \
        --settings \
        NODE_ENV=production \
        WEBSITES_PORT=3000 \
        DOCKER_CUSTOM_IMAGE_NAME="$ACR_NAME.azurecr.io/$service:latest"
    
    # Service-specific settings
    case $service in
        "api-gateway")
            az webapp config appsettings set \
                --resource-group "$RESOURCE_GROUP" \
                --name "$app_name" \
                --settings \
                DATABASE_URL="$DATABASE_URL" \
                REDIS_URL="$REDIS_URL" \
                AUTH_SERVICE_URL="https://sallie-auth-service.azurewebsites.net" \
                CHAT_SERVICE_URL="https://sallie-chat-service.azurewebsites.net" \
                ANALYTICS_SERVICE_URL="https://sallie-analytics-service.azurewebsites.net" \
                NOTIFICATION_SERVICE_URL="https://sallie-notification-service.azurewebsites.net" \
                FILE_SERVICE_URL="https://sallie-file-service.azurewebsites.net" \
                AI_SERVICE_URL="https://sallie-ai-service.azurewebsites.net" \
                WEBSOCKET_SERVICE_URL="https://sallie-websocket-service.azurewebsites.net" \
                PYTHON_AI_SERVICE_URL="https://sallie-python-ai-service.azurewebsites.net"
            ;;
        "auth-service")
            az webapp config appsettings set \
                --resource-group "$RESOURCE_GROUP" \
                --name "$app_name" \
                --settings \
                DATABASE_URL="$DATABASE_URL" \
                REDIS_URL="$REDIS_URL" \
                JWT_SECRET="$JWT_SECRET"
            ;;
        "chat-service")
            az webapp config appsettings set \
                --resource-group "$RESOURCE_GROUP" \
                --name "$app_name" \
                --settings \
                DATABASE_URL="$DATABASE_URL" \
                REDIS_URL="$REDIS_URL" \
                JWT_SECRET="$JWT_SECRET"
            ;;
        "file-service")
            az webapp config appsettings set \
                --resource-group "$RESOURCE_GROUP" \
                --name "$app_name" \
                --settings \
                DATABASE_URL="$DATABASE_URL" \
                REDIS_URL="$REDIS_URL" \
                AZURE_STORAGE_ACCOUNT="$AZURE_STORAGE_ACCOUNT" \
                AZURE_STORAGE_KEY="$AZURE_STORAGE_KEY" \
                AZURE_CONTAINER_NAME="$AZURE_CONTAINER_NAME"
            ;;
        "ai-service")
            az webapp config appsettings set \
                --resource-group "$RESOURCE_GROUP" \
                --name "$app_name" \
                --settings \
                DATABASE_URL="$DATABASE_URL" \
                REDIS_URL="$REDIS_URL" \
                OPENAI_API_KEY="$OPENAI_API_KEY" \
                ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
            ;;
        "python-ai-service")
            az webapp config appsettings set \
                --resource-group "$RESOURCE_GROUP" \
                --name "$app_name" \
                --settings \
                DATABASE_URL="$DATABASE_URL" \
                REDIS_URL="$REDIS_URL" \
                OPENAI_API_KEY="$OPENAI_API_KEY" \
                ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
            ;;
    esac
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Create Application Insights
    if ! az monitor app-insights component show \
        --app "sallie-studio-appinsights" \
        --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        az monitor app-insights component create \
            --app "sallie-studio-appinsights" \
            --location "$LOCATION" \
            --resource-group "$RESOURCE_GROUP" \
            --application-type "web"
        log_info "Application Insights created."
    fi
    
    # Get connection string
    APPINSIGHTS_CONNECTION_STRING=$(az monitor app-insights component show \
        --app "sallie-studio-appinsights" \
        --resource-group "$RESOURCE_GROUP" \
        --query "connectionString" \
        --output tsv)
    
    # Update all apps with Application Insights
    services=("api-gateway" "auth-service" "chat-service" "analytics-service" 
              "notification-service" "file-service" "ai-service" "websocket-service" 
              "python-ai-service")
    
    for service in "${services[@]}"; do
        app_name="sallie-$service"
        az webapp config appsettings set \
            --resource-group "$RESOURCE_GROUP" \
            --name "$app_name" \
            --settings \
            APPINSIGHTS_CONNECTION_STRING="$APPINSIGHTS_CONNECTION_STRING"
    done
    
    log_info "Monitoring setup completed."
}

# Create deployment script
create_deployment_script() {
    log_info "Creating deployment script for future updates..."
    
    cat > azure-update.sh << 'EOF'
#!/bin/bash

# Update deployment script
ACR_NAME="salliestudioregistry"
RESOURCE_GROUP="sallie-studio-rg"

# Build and push updated images
services=("api-gateway" "auth-service" "chat-service" "analytics-service" 
          "notification-service" "file-service" "ai-service" "websocket-service" 
          "python-ai-service")

for service in "${services[@]}"; do
    echo "Updating $service..."
    docker build -t "$ACR_NAME.azurecr.io/$service:latest" "../../services/$service"
    docker push "$ACR_NAME.azurecr.io/$service:latest"
    
    # Restart the web app
    az webapp restart --name "sallie-$service" --resource-group "$RESOURCE_GROUP"
done

echo "Deployment update completed!"
EOF
    
    chmod +x azure-update.sh
    log_info "Deployment script created: azure-update.sh"
}

# Main deployment function
main() {
    log_info "Starting Sallie Studio Azure Deployment..."
    
    # Load environment variables
    if [ -f ".env.azure" ]; then
        export $(cat .env.azure | grep -v '^#' | xargs)
        log_info "Environment variables loaded from .env.azure"
    else
        log_error ".env.azure file not found. Please create it first."
        exit 1
    fi
    
    # Run deployment steps
    check_azure_cli
    create_resource_group
    create_acr
    build_and_push_images
    create_app_service_plan
    create_web_apps
    setup_monitoring
    create_deployment_script
    
    log_info "🎉 Sallie Studio Azure Deployment completed successfully!"
    log_info "📊 Monitor your deployment at: https://portal.azure.com"
    log_info "🔍 Application Insights: https://ms.portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Insights%2Fcomponents"
    
    echo ""
    echo "🌐 Service URLs:"
    echo "API Gateway: https://sallie-api-gateway.azurewebsites.net"
    echo "Auth Service: https://sallie-auth-service.azurewebsites.net"
    echo "Chat Service: https://sallie-chat-service.azurewebsites.net"
    echo "Analytics Service: https://sallie-analytics-service.azurewebsites.net"
    echo "Notification Service: https://sallie-notification-service.azurewebsites.net"
    echo "File Service: https://sallie-file-service.azurewebsites.net"
    echo "AI Service: https://sallie-ai-service.azurewebsites.net"
    echo "WebSocket Service: https://sallie-websocket-service.azurewebsites.net"
    echo "Python AI Service: https://sallie-python-ai-service.azurewebsites.net"
}

# Run main function
main "$@"
