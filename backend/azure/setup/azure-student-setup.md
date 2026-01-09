# Azure Student Account Setup for Sallie Studio

## Prerequisites
- Azure Student Account (free $200 credit)
- Azure CLI installed
- Git installed
- Docker installed

## 1. Azure Student Account Benefits
- **$200 Free Credit**: Valid for 12 months
- **Free Services**: 
  - 12 months of popular free services
  - 25+ always free services
  - 750 hours of B1s Linux VM
  - 250 GB Azure SQL Database
  - 5 GB Azure Blob Storage
  - Azure App Service (10 web/mobile apps)

## 2. Initial Setup

### Install Azure CLI
```bash
# Windows (PowerShell - Run as Administrator)
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile AzureCLI.msi
Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'

# Alternative: Download and install from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows

# Login to Azure
az login

# List all available subscriptions to find your student subscription
az account list --output table

# Look for subscription with "Student" or "Azure for Students" in the name
# Then set the correct subscription (replace with your actual subscription name or ID)
az account set --subscription "YOUR-ACTUAL-SUBSCRIPTION-NAME-OR-ID"

# Or use subscription ID if you prefer
az account set --subscription "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Create Resource Group
```bash
# Check if resource group already exists
az group show --name "sallie-studio-rg"

# If it doesn't exist, create it:
az group create \
  --name "sallie-studio-rg" \
  --location "eastus"

# Or use your existing resource group
az group show --name "sallie"
```

## 3. Azure Services Setup

### Azure Container Registry (ACR)
```bash
# Configuration
RESOURCE_GROUP="sallie"
LOCATION="centralus"
ACR_NAME="salliestudioregistry"
APP_SERVICE_PLAN="sallie"

# If it doesn't exist, create it:
az acr create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$ACR_NAME" \
  --sku "Basic" \
  --location "$LOCATION"
  --sku "Basic"

# Login to ACR
az acr login --name "salliestudioregistry"
```

### Azure App Service Plan
```bash
# Check if App Service Plan already exists
az appservice plan show --name "sallie-studio-plan" --resource-group "sallie"

# If it doesn't exist, create it:
az appservice plan create \
  --name "sallie-studio-plan" \
  --resource-group "sallie" \
  --sku "B1" \
  --is-linux

# Verify
az appservice plan show \
  --name "sallie-studio-plan" \
  --resource-group "sallie"
```

### Azure PostgreSQL Database
```bash
# Create PostgreSQL Server
az postgres server create \
  --name "sallie-studio-db" \
  --resource-group "sallie" \
  --location "eastus" \
  --admin-user "sallieadmin" \
  --admin-password "YourSecurePassword123!" \
  --sku-name "B_Gen5_1"

# Create Database
az postgres db create \
  --name "sallie_studio" \
  --resource-group "sallie" \
  --server-name "sallie-studio-db"

# Configure firewall (allow Azure services)
az postgres server firewall-rule create \
  --resource-group "sallie" \
  --server-name "sallie-studio-db" \
  --name "allow-azure" \
  --start-ip-address "0.0.0.0" \
  --end-ip-address "0.0.0.0"
```

### Azure Redis Cache
```bash
# Create Redis Cache
az redis create \
  --name "sallie-studio-redis" \
  --resource-group "sallie" \
  --location "eastus" \
  --sku "Basic" \
  --vm-size "C0"

# Get connection string
az redis show \
  --name "sallie-studio-redis" \
  --resource-group "sallie" \
  --query "hostName" \
  --output tsv
```

### Azure Storage Account
```bash
# Create Storage Account
az storage account create \
  --name "salliestudiostorage" \
  --resource-group "sallie" \
  --location "eastus" \
  --sku "Standard_LRS"

# Create Blob containers
az storage container create \
  --name "files" \
  --account-name "salliestudiostorage"

az storage container create \
  --name "backups" \
  --account-name "salliestudiostorage"
```

## 4. Network Configuration

### Virtual Network (Optional)
```bash
# Create VNet
az network vnet create \
  --name "sallie-studio-vnet" \
  --resource-group "sallie" \
  --address-prefix "10.0.0.0/16" \
  --subnet-name "default" \
  --subnet-prefix "10.0.1.0/24"
```

## 5. Monitoring & Logging

### Azure Monitor
```bash
# Create Log Analytics Workspace
az monitor log-analytics workspace create \
  --name "sallie-studio-logs" \
  --resource-group "sallie" \
  --location "eastus"

# Create Application Insights
az monitor app-insights component create \
  --app "sallie-studio-appinsights" \
  --location "eastus" \
  --resource-group "sallie" \
  --application-type "web"
```

## 6. Environment Variables Setup

Create `.env.azure` file:
```bash
# Azure Database
DATABASE_URL=postgresql://sallieadmin:YourSecurePassword123!@sallie-studio-db.postgres.database.azure.com:5432/sallie_studio

# Azure Redis
REDIS_URL=redis://sallie-studio-redis.redis.cache.windows.net:6380,password=YourRedisPassword,ssl=True

# Azure Storage
AZURE_STORAGE_ACCOUNT=salliestudiostorage
AZURE_STORAGE_KEY=YourStorageKey
AZURE_CONTAINER_NAME=files

# Azure App Insights
APPINSIGHTS_CONNECTION_STRING=YourAppInsightsConnectionString

# Service URLs (Azure)
AUTH_SERVICE_URL=https://sallie-auth.azurewebsites.net
CHAT_SERVICE_URL=https://sallie-chat.azurewebsites.net
ANALYTICS_SERVICE_URL=https://sallie-analytics.azurewebsites.net
NOTIFICATION_SERVICE_URL=https://sallie-notifications.azurewebsites.net
FILE_SERVICE_URL=https://sallie-files.azurewebsites.net
AI_SERVICE_URL=https://sallie-ai.azurewebsites.net
WEBSOCKET_SERVICE_URL=https://sallie-websocket.azurewebsites.net
PYTHON_AI_SERVICE_URL=https://sallie-python-ai.azurewebsites.net
```

## 7. Cost Management

### Monitor Usage
```bash
# Check current usage
az consumption usage list \
  --resource-group "sallie" \
  --output table

# Check credit balance
az billing account list \
  --output table
```

### Budget Alerts
```bash
# Create budget
az consumption budget create \
  --name "sallie-studio-budget" \
  --resource-group "sallie" \
  --category "Cost" \
  --amount 150 \
  --time-grain "Monthly" \
  --notification-emails "your-email@example.com"
```

## 8. Next Steps

1. **Deploy Services**: Use Azure DevOps or GitHub Actions
2. **Setup CI/CD**: Automated deployment pipeline
3. **Configure Monitoring**: Set up alerts and dashboards
4. **Setup Backup**: Automated backup strategy
5. **Security Hardening**: Network security groups, SSL certificates

## 9. Student Account Limitations

- **$200 Credit**: Use wisely, monitor spending
- **Service Limits**: Some services have usage limits
- **Duration**: 12 months validity
- **Region Restrictions**: Some services not available in all regions

## 10. Cost Optimization Tips

- Use **B1/B2** tier App Service plans
- Use **Basic** tier databases for development
- Enable **Auto-shutdown** for VMs
- Use **Azure Reserved Instances** for long-term
- Monitor and **right-size** resources regularly
