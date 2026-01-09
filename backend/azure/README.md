# Sallie Studio Azure Deployment Guide

## 🎯 Overview

This guide helps you deploy your Sallie Studio backend from your local mini PC (192.168.1.47:8742) to Azure using your student account, while maintaining synchronization between local and cloud environments.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   HYBRID DEPLOYMENT                        │
├─────────────────────────────────────────────────────────────┤
│  Local Mini PC (192.168.1.47:8742)                        │
│  ├── Development Environment                               │
│  ├── Local Testing                                         │
│  ├── Code Repository                                       │
│  └── Primary Database                                      │
├─────────────────────────────────────────────────────────────┤
│  Azure Cloud (Student Account)                             │
│  ├── Production Web Apps                                   │
│  ├── Azure Database for Production                        │
│  ├── Azure Storage for Files                               │
│  ├── Azure Monitor & Logging                              │
│  └── Global CDN & Load Balancing                          │
├─────────────────────────────────────────────────────────────┤
│  Synchronization Layer                                       │
│  ├── Git Repository (Code Sync)                            │
│  ├── Database Replication                                   │
│  ├── File Storage Sync                                     │
│  └── Automated Deployment Scripts                          │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Prerequisites
- Azure Student Account with $200 credit
- Azure CLI installed
- Docker installed
- Git installed
- Local backend running on 192.168.1.47:8742

### 2. Setup Azure Environment
```bash
# Clone this repository or navigate to \\Sallie\b\azure
cd \\Sallie\b\azure

# Copy environment template
cp .env.azure .env

# Edit .env with your actual Azure credentials
notepad .env
```

### 3. Run Azure Setup
```bash
# Make deployment script executable (Linux/Mac) or run directly (Windows)
chmod +x deploy/azure-deploy.sh

# Run the deployment
./deploy/azure-deploy.sh
```

### 4. Setup Synchronization
```bash
# Install Python dependencies for sync scripts
pip install psycopg2-binary azure-storage-blob python-dotenv requests

# Test sync scripts
python sync/health-check.py
```

## 📁 File Structure

```
\\Sallie\b\azure\
├── setup\
│   └── azure-student-setup.md      # Azure account setup guide
├── docker\
│   └── azure-docker-compose.yml    # Docker configuration for Azure
├── deploy\
│   └── azure-deploy.sh             # Main deployment script
├── connect\
│   └── local-azure-sync.md        # Synchronization strategy
├── sync\
│   ├── local-azure-sync.sh         # Code sync script
│   ├── db-sync.py                  # Database sync script
│   ├── file-sync.py                # File sync script
│   └── health-check.py             # Health monitoring script
├── .env.azure                      # Environment template
└── README.md                       # This file
```

## 🔧 Configuration

### Environment Variables
Edit `.env` with your actual values:

```bash
# Azure Database
DATABASE_URL=postgresql://sallieadmin:password@sallie-studio-db.postgres.database.azure.com:5432/sallie_studio

# Azure Redis
REDIS_URL=redis://sallie-studio-redis.redis.cache.windows.net:6380,password=redis_password,ssl=True

# Azure Storage
AZURE_STORAGE_ACCOUNT=salliestudiostorage
AZURE_STORAGE_KEY=your_storage_key

# AI Service Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Service URLs
After deployment, your services will be available at:
- API Gateway: https://sallie-api-gateway.azurewebsites.net
- Auth Service: https://sallie-auth-service.azurewebsites.net
- Chat Service: https://sallie-chat-service.azurewebsites.net
- Analytics Service: https://sallie-analytics-service.azurewebsites.net
- Notification Service: https://sallie-notification-service.azurewebsites.net
- File Service: https://sallie-file-service.azurewebsites.net
- AI Service: https://sallie-ai-service.azurewebsites.net
- WebSocket Service: https://sallie-websocket-service.azurewebsites.net
- Python AI Service: https://sallie-python-ai-service.azurewebsites.net

## 🔄 Synchronization Workflow

### Daily Development
1. **Develop locally** on your mini PC
2. **Test locally** at 192.168.1.47:8742
3. **Sync to Azure**: Run `sync/local-azure-sync.sh`
4. **Monitor deployment** via Azure Portal

### Automated Sync
```bash
# Setup scheduled sync (Windows Task Scheduler)
# Runs every 30 minutes automatically
schtasks /create /tn "SallieSync" /tr "powershell.exe -ExecutionPolicy Bypass -File \\Sallie\b\sync\scheduled-sync.ps1" /sc minute /mo 30
```

### Manual Sync
```bash
# Sync code changes
cd \\Sallie\b
git add .
git commit -m "Update: $(date)"
git push azure main

# Sync database
python sync/db-sync.py

# Sync files
python sync/file-sync.py
```

## 📊 Monitoring

### Health Checks
```bash
# Check all services health
python sync/health-check.py

# Expected output:
# 🏥 Health Check - 2024-01-06 23:30:00
# ==================================================
# local               - ✅ Healthy (200)
# azure-gateway       - ✅ Healthy (200)
# azure-auth          - ✅ Healthy (200)
# azure-chat          - ✅ Healthy (200)
```

### Azure Monitor
- **Portal**: https://portal.azure.com
- **Application Insights**: Search for "sallie-studio-appinsights"
- **Metrics**: CPU, memory, response times, error rates
- **Logs**: Application logs and error tracking

## 🚨 Troubleshooting

### Common Issues

#### 1. Deployment Fails
```bash
# Check Azure CLI login
az login

# Check resource group exists
az group show --name "sallie-studio-rg"

# Check ACR login
az acr login --name "salliestudioregistry"
```

#### 2. Database Connection Issues
```bash
# Test database connection
psql "postgresql://sallieadmin:password@sallie-studio-db.postgres.database.azure.com:5432/sallie_studio"

# Check firewall rules
az postgres server firewall-rule list --resource-group "sallie-studio-rg" --server-name "sallie-studio-db"
```

#### 3. Sync Issues
```bash
# Check Git status
cd \\Sallie\b
git status

# Check Python dependencies
pip install -r requirements.txt

# Check environment variables
python -c "import os; print('DATABASE_URL:', os.getenv('DATABASE_URL'))"
```

### Rollback Procedure
```bash
# Rollback to previous version
cd \\Sallie\b
git log --oneline -5  # See recent commits
git reset --hard <previous-commit-hash>
git push azure main --force

# Restart Azure services
az webapp restart --name "sallie-api-gateway" --resource-group "sallie-studio-rg"
```

## 💰 Cost Management

### Student Account Benefits
- **$200 Free Credit**: Valid for 12 months
- **Free Services**: B1 App Service Plan, PostgreSQL, Redis, Storage
- **Monitoring**: Set up budget alerts

### Cost Optimization
```bash
# Check current spending
az consumption usage list --resource-group "sallie-studio-rg" --output table

# Set budget alerts
az consumption budget create \
  --name "sallie-studio-budget" \
  --resource-group "sallie-studio-rg" \
  --category "Cost" \
  --amount 150 \
  --time-grain "Monthly" \
  --notification-emails "your-email@example.com"
```

### Estimated Monthly Costs
- **App Service Plan**: ~$15/month
- **PostgreSQL**: ~$15/month
- **Redis Cache**: ~$7/month
- **Storage**: ~$2/month
- **Monitoring**: Free tier
- **Total**: ~$39/month (well within $200 credit)

## 🔒 Security

### Network Security
- **HTTPS**: All services use SSL/TLS
- **Firewall**: Database firewall configured
- **VNet**: Optional virtual network isolation
- **Private Endpoints**: Optional for enhanced security

### Authentication
- **JWT Tokens**: Secure authentication
- **API Keys**: Service-to-service communication
- **Environment Variables**: Sensitive data stored securely
- **Secrets**: Use Azure Key Vault for production

## 📚 Additional Resources

### Azure Documentation
- [Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure PostgreSQL](https://docs.microsoft.com/en-us/azure/postgresql/)
- [Azure Redis Cache](https://docs.microsoft.com/en-us/azure/redis-cache/)
- [Azure Storage](https://docs.microsoft.com/en-us/azure/storage/)

### Student Resources
- [Azure for Students](https://azure.microsoft.com/en-us/free/students/)
- [Student Credit Guide](https://docs.microsoft.com/en-us/azure/cost-management-billing/manage/students)
- [Free Services](https://azure.microsoft.com/en-us/free/)

## 🎉 Next Steps

1. **Complete Azure Setup**: Follow `setup/azure-student-setup.md`
2. **Deploy Services**: Run `deploy/azure-deploy.sh`
3. **Configure Sync**: Set up `sync/` scripts
4. **Test Integration**: Verify local-Azure connectivity
5. **Monitor Performance**: Set up Azure Monitor alerts
6. **Optimize Costs**: Monitor spending and optimize resources

## 🤝 Support

For issues and questions:
- **Azure Portal**: https://portal.azure.com
- **Azure Support**: Student account includes support
- **Documentation**: Check service-specific guides
- **Community**: Azure forums and Stack Overflow

---

**Your Sallie Studio backend is now ready for hybrid local-Azure deployment!** 🚀
