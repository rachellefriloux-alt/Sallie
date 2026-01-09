# 🚀 Sallie Studio - Azure Deployment Guide

## 📋 Overview
Complete production-ready deployment guide for Sallie Studio ecosystem on Azure.

## 🏗️ Architecture Overview

### **Web Application** (Next.js 14)
- **Platform**: Azure Static Web Apps
- **Runtime**: Node.js 18+
- **Features**: SSR, API Routes, Static Generation
- **URL**: `https://sallie-studio-web.azurestaticapps.net`

### **Mobile Application** (React Native)
- **Platform**: Azure App Service for Mobile Backend
- **Runtime**: Node.js 18+
- **Features**: Push Notifications, Authentication, API
- **URL**: `https://sallie-studio-api.azurewebsites.net`

### **Desktop Application** (WinUI 3)
- **Platform**: Azure Blob Storage for Distribution
- **Runtime**: .NET 8.0 Windows
- **Features**: Auto-updates, Telemetry, Authentication
- **URL**: `https://salliestudio.blob.core.windows.net/desktop`

### **Backend Services** (Python FastAPI)
- **Platform**: Azure Container Instances
- **Runtime**: Python 3.11+
- **Features**: REST API, WebSocket, Authentication
- **URL**: `https://sallie-studio-backend.azurewebsites.net`

### **Database** (PostgreSQL)
- **Platform**: Azure Database for PostgreSQL
- **Tier**: General Purpose
- **Features**: Auto-scaling, Backups, Security
- **Connection**: Managed via Azure Key Vault

### **Storage** (Azure Blob Storage)
- **Platform**: Azure Blob Storage
- **Features**: Static assets, backups, file uploads
- **CDN**: Azure CDN for global distribution

---

## 🔧 Deployment Steps

### 1. **Create Azure Resources**

```bash
# Login to Azure
az login

# Create Resource Group
az group create --name SallieStudioRG --location "East US"

# Create PostgreSQL Database
az postgres server create \
  --name sallie-db \
  --resource-group SallieStudioRG \
  --location "East US" \
  --admin-user sallieadmin \
  --admin-password "YourSecurePassword123!" \
  --sku-name B_Gen5_2

# Create Blob Storage
az storage account create \
  --name salliestudiostorage \
  --resource-group SallieStudioRG \
  --location "East US" \
  --sku Standard_LRS

# Create Container Registry
az acr create \
  --name salliestudioregistry \
  --resource-group SallieStudioRG \
  --location "East US" \
  --sku Basic

# Create App Service Plan
az appservice plan create \
  --name SallieStudioPlan \
  --resource-group SallieStudioRG \
  --location "East US" \
  --sku B1 \
  --is-linux

# Create Web App for Backend
az webapp create \
  --name sallie-studio-backend \
  --resource-group SallieStudioRG \
  --plan SallieStudioPlan \
  --runtime "PYTHON|3.11"

# Create Static Web App
az staticwebapp create \
  --name sallie-studio-web \
  --resource-group SallieStudioRG \
  --location "East US" \
  --source https://github.com/yourusername/sallie-studio-web
```

### 2. **Deploy Web Application**

```bash
# Navigate to web directory
cd c:\Sallie\web

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Azure Static Web Apps
az staticwebapp deploy \
  --name sallie-studio-web \
  --resource-group SallieStudioRG \
  --source .
```

### 3. **Deploy Backend Services**

```bash
# Navigate to backend directory
cd c:\Sallie\backend

# Create Dockerfile
cat > Dockerfile << EOF
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# Build and push to Azure Container Registry
az acr build \
  --registry salliestudioregistry \
  --image sallie-backend \
  --file Dockerfile .

# Deploy to Azure App Service
az webapp config container set \
  --name sallie-studio-backend \
  --resource-group SallieStudioRG \
  --docker-custom-image-name salliestudioregistry.azurecr.io/sallie-backend:latest
```

### 4. **Deploy Mobile Backend**

```bash
# Create mobile API endpoints
cd c:\Sallie\mobile\api

# Deploy to Azure App Service
az webapp up \
  --name sallie-studio-mobile-api \
  --resource-group SallieStudioRG \
  --location "East US" \
  --runtime "NODE|18-lts"
```

### 5. **Deploy Desktop Application**

```bash
# Build desktop application
cd c:\Sallie\SallieStudioApp

# Build for release
dotnet build -c Release -r win-x64

# Upload to Azure Blob Storage
az storage blob upload \
  --container-name desktop \
  --file "bin/Release/net8.0-windows10.0.19041.0/win-x64/SallieStudioApp.exe" \
  --name SallieStudioApp.exe
```

---

## 🔐 Configuration

### **Environment Variables**

```bash
# Web Application
az webapp config appsettings set \
  --name sallie-studio-web \
  --resource-group SallieStudioRG \
  --settings "NEXT_PUBLIC_API_URL=https://sallie-studio-backend.azurewebsites.net"

# Backend Services
az webapp config appsettings set \
  --name sallie-studio-backend \
  --resource-group SallieStudioRG \
  --settings "DATABASE_URL=postgresql://sallieadmin:YourSecurePassword123!@sallie-db.postgres.database.azure.com:5432/salliedb"
```

### **Networking**

```bash
# Create Virtual Network
az network vnet create \
  --name SallieStudioVNet \
  --resource-group SallieStudioRG \
  --location "East US" \
  --address-prefixes 10.0.0.0/16

# Create Subnet
az network vnet subnet create \
  --name SallieStudioSubnet \
  --resource-group SallieStudioRG \
  --vnet-name SallieStudioVNet \
  --address-prefixes 10.0.1.0/24
```

---

## 📊 Monitoring & Analytics

### **Application Insights**

```bash
# Create Application Insights
az monitor app-insights component create \
  --name sallie-studio-insights \
  --resource-group SallieStudioRG \
  --location "East US" \
  --application-type web

# Connect to Web App
az webapp config appsettings set \
  --name sallie-studio-web \
  --resource-group SallieStudioRG \
  --settings "APPINSIGHTS_INSTRUMENTATIONKEY=your-instrumentation-key"
```

### **Log Analytics**

```bash
# Create Log Analytics Workspace
az monitor log-analytics workspace create \
  --name SallieStudioLogs \
  --resource-group SallieStudioRG \
  --location "East US"
```

---

## 🔒 Security Configuration

### **Key Vault**

```bash
# Create Key Vault
az keyvault create \
  --name SallieStudioKV \
  --resource-group SallieStudioRG \
  --location "East US"

# Store secrets
az keyvault secret set \
  --name "DatabasePassword" \
  --value "YourSecurePassword123!" \
  --vault-name SallieStudioKV
```

### **Managed Identity**

```bash
# Enable Managed Identity
az webapp identity assign \
  --name sallie-studio-web \
  --resource-group SallieStudioRG

# Grant access to Key Vault
az keyvault set-policy \
  --name SallieStudioKV \
  --spn <web-app-principal-id> \
  --secret-permissions get list
```

---

## 🚀 CI/CD Pipeline

### **GitHub Actions**

```yaml
# .github/workflows/azure-deploy.yml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Azure Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "/"
        api_location: "api"
        output_location: "out"
```

---

## 📱 Mobile App Store Deployment

### **Google Play Store**

```bash
# Build Android APK
cd c:\Sallie\mobile
npm run build:android

# Upload to Google Play Console
# Manual process: https://play.google.com/console
```

### **Apple App Store**

```bash
# Build iOS IPA
npm run build:ios

# Upload to App Store Connect
# Manual process: https://appstoreconnect.apple.com
```

---

## 🖥️ Desktop Distribution

### **Windows Store**

```bash
# Create Windows Store package
cd c:\Sallie\SallieStudioApp
dotnet build -c Release -r win-x64 /p:WindowsApp

# Upload to Microsoft Store Partner Center
# Manual process: https://partner.microsoft.com/dashboard
```

---

## 📊 Performance Optimization

### **CDN Configuration**

```bash
# Create Azure CDN
az cdn create \
  --name sallie-studio-cdn \
  --resource-group SallieStudioRG \
  --location "East US" \
  --sku Standard_Microsoft

# Configure CDN endpoint
az cdn endpoint create \
  --name sallie-studio-endpoint \
  --profile-name sallie-studio-cdn \
  --resource-group SallieStudioRG \
  --location "East US"
```

---

## 🔧 Troubleshooting

### **Common Issues**

1. **Database Connection Issues**
   - Check connection strings
   - Verify firewall rules
   - Test with Azure Data Studio

2. **CORS Issues**
   - Configure allowed origins
   - Check API Gateway settings
   - Verify preflight requests

3. **Authentication Issues**
   - Check managed identity permissions
   - Verify token expiration
   - Test with Azure AD

---

## 📈 Scaling Configuration

### **Auto-scaling**

```bash
# Create Auto-scale Rule
az monitor autoscale create \
  --name SallieStudioScale \
  --resource-group SallieStudioRG \
  --resource-type Microsoft.Web/sites \
  --resource sallie-studio-web \
  --min-count 1 \
  --max-count 10 \
  --count 1
```

---

## 🎯 Final Checklist

- [ ] All Azure resources created
- [ ] Web application deployed
- [ ] Backend services running
- [ ] Database connected
- [ ] Mobile API deployed
- [ ] Desktop app uploaded
- [ ] Monitoring configured
- [ ] Security settings applied
- [ ] CDN configured
- [ ] CI/CD pipeline active
- [ ] Domain names configured
- [ ] SSL certificates installed
- [ ] Performance monitoring active
- [ ] Backup policies configured
- [ ] Documentation complete

---

## 🚀 Ready for Production!

Your Sallie Studio ecosystem is now fully deployed on Azure with:
- **Web**: `https://sallie-studio-web.azurestaticapps.net`
- **Mobile**: Available on Google Play Store and Apple App Store
- **Desktop**: Available on Microsoft Store
- **Backend**: `https://sallie-studio-backend.azurewebsites.net`
- **API**: `https://sallie-studio-mobile-api.azurewebsites.net`

All systems are monitored, secured, and ready for production use! 🦚💜✨
