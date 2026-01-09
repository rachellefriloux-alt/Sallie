# Local-Azure Synchronization Strategy

## Overview
This guide shows how to keep your local mini PC backend (192.168.1.47:8742) synchronized with your Azure deployment.

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    SYNC ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────┤
│  Local Mini PC (192.168.1.47:8742)                        │
│  ├── Development Environment                               │
│  ├── Local Database                                         │
│  ├── Code Changes                                           │
│  └── Testing                                               │
├─────────────────────────────────────────────────────────────┤
│  Synchronization Layer                                       │
│  ├── Git Repository (Code Sync)                            │
│  ├── Database Replication                                   │
│  ├── File Sync (Azure Storage Sync)                        │
│  └── API Gateway (Load Balancing)                          │
├─────────────────────────────────────────────────────────────┤
│  Azure Cloud (Production)                                  │
│  ├── Azure Web Apps                                        │
│  ├── Azure Database                                        │
│  ├── Azure Storage                                         │
│  └── Azure Monitor                                         │
└─────────────────────────────────────────────────────────────┘
```

## 1. Code Synchronization

### Git Repository Setup
```bash
# Initialize Git repository (if not already done)
cd \\Sallie\b
git init
git add .
git commit -m "Initial commit - Local backend complete"

# Add Azure remote
git remote add azure https://github.com/yourusername/sallie-studio.git
git push azure main
```

### Automated Sync Script
Create `\\Sallie\b\sync\local-azure-sync.sh`:
```bash
#!/bin/bash

# Local-Azure Sync Script
LOCAL_PATH="\\Sallie\b"
REMOTE_REPO="https://github.com/yourusername/sallie-studio.git"

echo "🔄 Starting local-Azure synchronization..."

# Check for changes
cd "$LOCAL_PATH"
git status

# Add and commit changes
git add .
git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to remote
git push azure main

# Trigger Azure deployment
echo "🚀 Triggering Azure deployment..."
curl -X POST "https://sallie-api-gateway.azurewebsites.net/api/deploy" \
  -H "Content-Type: application/json" \
  -d '{"action": "sync", "source": "local"}'

echo "✅ Synchronization completed!"
```

## 2. Database Synchronization

### Azure Database Setup
```sql
-- Create replication user on Azure PostgreSQL
CREATE USER replication_user WITH REPLICATION ENCRYPTED PASSWORD 'secure_password';

-- Setup publication
CREATE PUBLICATION sallie_pub FOR ALL TABLES;

-- Create subscription on local
CREATE SUBSCRIPTION sallie_sub 
CONNECTION 'host=sallie-studio-db.postgres.database.azure.com port=5432 dbname=sallie_studio user=replication_user password=secure_password sslmode=require'
PUBLICATION sallie_pub;
```

### Sync Script for Database
Create `\\Sallie\b\sync\db-sync.py`:
```python
import psycopg2
import os
from datetime import datetime

# Local database connection
LOCAL_DB = {
    'host': 'localhost',
    'database': 'sallie_studio',
    'user': 'postgres',
    'password': os.getenv('LOCAL_DB_PASSWORD')
}

# Azure database connection
AZURE_DB = {
    'host': 'sallie-studio-db.postgres.database.azure.com',
    'database': 'sallie_studio',
    'user': 'sallieadmin',
    'password': os.getenv('AZURE_DB_PASSWORD')
}

def sync_databases():
    """Sync local database to Azure"""
    print(f"🔄 Starting database sync at {datetime.now()}")
    
    try:
        # Connect to both databases
        local_conn = psycopg2.connect(**LOCAL_DB)
        azure_conn = psycopg2.connect(**AZURE_DB)
        
        local_cursor = local_conn.cursor()
        azure_cursor = azure_conn.cursor()
        
        # Get all tables
        local_cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = [row[0] for row in local_cursor.fetchall()]
        
        # Sync each table
        for table in tables:
            print(f"  📋 Syncing table: {table}")
            
            # Get data from local
            local_cursor.execute(f"SELECT * FROM {table}")
            rows = local_cursor.fetchall()
            
            # Get column names
            local_cursor.execute(f"""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = '{table}' AND table_schema = 'public'
                ORDER BY ordinal_position
            """)
            columns = [row[0] for row in local_cursor.fetchall()]
            
            # Clear Azure table
            azure_cursor.execute(f"DELETE FROM {table}")
            
            # Insert data into Azure
            if rows:
                placeholders = ', '.join(['%s'] * len(columns))
                insert_query = f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({placeholders})"
                azure_cursor.executemany(insert_query, rows)
            
            azure_conn.commit()
        
        print("✅ Database sync completed!")
        
    except Exception as e:
        print(f"❌ Database sync failed: {e}")
    finally:
        local_conn.close()
        azure_conn.close()

if __name__ == "__main__":
    sync_databases()
```

## 3. File Synchronization

### Azure Storage Sync
Create `\\Sallie\b\sync\file-sync.py`:
```python
import os
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

load_dotenv()

# Azure Storage connection
AZURE_STORAGE_CONNECTION_STRING = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
CONTAINER_NAME = 'files'

def sync_files_to_azure():
    """Sync local files to Azure Storage"""
    print("🔄 Starting file sync to Azure...")
    
    try:
        # Create BlobServiceClient
        blob_service_client = BlobServiceClient.from_connection_string(
            AZURE_STORAGE_CONNECTION_STRING
        )
        
        # Get container client
        container_client = blob_service_client.get_container_client(CONTAINER_NAME)
        
        # Local upload directory
        local_upload_dir = '\\Sallie\\b\\uploads'
        
        # Sync files
        for root, dirs, files in os.walk(local_upload_dir):
            for file in files:
                local_path = os.path.join(root, file)
                blob_name = os.path.relpath(local_path, local_upload_dir).replace('\\', '/')
                
                # Upload to Azure
                blob_client = container_client.get_blob_client(blob_name)
                
                with open(local_path, 'rb') as data:
                    blob_client.upload_blob(data, overwrite=True)
                
                print(f"  📁 Uploaded: {blob_name}")
        
        print("✅ File sync completed!")
        
    except Exception as e:
        print(f"❌ File sync failed: {e}")

if __name__ == "__main__":
    sync_files_to_azure()
```

## 4. API Gateway Load Balancing

### Azure Application Gateway Setup
```bash
# Create Application Gateway
az network application-gateway create \
  --name "sallie-app-gateway" \
  --resource-group "sallie-studio-rg" \
  --location "eastus" \
  --sku "WAF_v2" \
  --capacity "2" \
  --frontend-port "80" \
  --public-ip-address "sallie-pip" \
  --http-settings-cookie-based-affinity "Enabled"

# Configure backend pool
az network application-gateway address-pool create \
  --gateway-name "sallie-app-gateway" \
  --resource-group "sallie-studio-rg" \
  --name "local-backend" \
  --servers "192.168.1.47:8742"

az network application-gateway address-pool create \
  --gateway-name "sallie-app-gateway" \
  --resource-group "sallie-studio-rg" \
  --name "azure-backend" \
  --servers "sallie-api-gateway.azurewebsites.net"
```

## 5. Automated Sync Schedule

### Windows Task Scheduler Setup
```powershell
# Create PowerShell script for scheduled sync
# Save as \\Sallie\b\sync\scheduled-sync.ps1

# Sync script content
$LocalPath = "\\Sallie\b"
$LogFile = "\\Sallie\b\sync\sync.log"

function Write-Log {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "$timestamp - $message"
}

Write-Log "🔄 Starting scheduled sync..."

# Code sync
Set-Location $LocalPath
git add .
git commit -m "Scheduled sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push azure main

# Database sync
python "\\Sallie\b\sync\db-sync.py"

# File sync
python "\\Sallie\b\sync\file-sync.py"

Write-Log "✅ Scheduled sync completed!"
```

### Schedule the task
```cmd
# Create scheduled task (run as Administrator)
schtasks /create /tn "SallieSync" /tr "powershell.exe -ExecutionPolicy Bypass -File \\Sallie\b\sync\scheduled-sync.ps1" /sc minute /mo 30 /f

# View the task
schtasks /query /tn "SallieSync"

# Delete the task if needed
schtasks /delete /tn "SallieSync" /f
```

## 6. Health Monitoring

### Health Check Script
Create `\\Sallie\b\sync\health-check.py`:
```python
import requests
import time
from datetime import datetime

def check_service_health():
    """Check health of local and Azure services"""
    services = {
        'local': 'http://192.168.1.47:8742/health',
        'azure-gateway': 'https://sallie-api-gateway.azurewebsites.net/health',
        'azure-auth': 'https://sallie-auth-service.azurewebsites.net/health',
        'azure-chat': 'https://sallie-chat-service.azurewebsites.net/health',
    }
    
    print(f"🏥 Health Check - {datetime.now()}")
    print("=" * 50)
    
    for name, url in services.items():
        try:
            response = requests.get(url, timeout=10)
            status = "✅ Healthy" if response.status_code == 200 else "❌ Unhealthy"
            print(f"{name:20} - {status} ({response.status_code})")
        except Exception as e:
            print(f"{name:20} - ❌ Error: {str(e)}")

if __name__ == "__main__":
    check_service_health()
```

## 7. Rollback Strategy

### Rollback Script
Create `\\Sallie\b\sync\rollback.sh`:
```bash
#!/bin/bash

# Rollback to previous version
echo "🔄 Starting rollback process..."

# Get previous commit
PREVIOUS_COMMIT=$(git log --oneline -2 | tail -1 | awk '{print $1}')

echo "📦 Rolling back to commit: $PREVIOUS_COMMIT"

# Reset to previous commit
git reset --hard $PREVIOUS_COMMIT

# Push to Azure
git push azure main --force

# Restart Azure services
services=("api-gateway" "auth-service" "chat-service" "analytics-service" 
          "notification-service" "file-service" "ai-service" "websocket-service" 
          "python-ai-service")

for service in "${services[@]}"; do
    echo "🔄 Restarting $service..."
    az webapp restart --name "sallie-$service" --resource-group "sallie-studio-rg"
done

echo "✅ Rollback completed!"
```

## 8. Configuration Management

### Environment-specific configs
Create `\\Sallie\b\config\azure.env`:
```bash
# Azure-specific environment variables
NODE_ENV=production
DATABASE_URL=postgresql://sallieadmin:password@sallie-studio-db.postgres.database.azure.com:5432/sallie_studio
REDIS_URL=redis://sallie-studio-redis.redis.cache.windows.net:6380,password=redis_password,ssl=True
AZURE_STORAGE_ACCOUNT=salliestudiostorage
AZURE_STORAGE_KEY=your_storage_key
AZURE_CONTAINER_NAME=files

# Service URLs
AUTH_SERVICE_URL=https://sallie-auth-service.azurewebsites.net
CHAT_SERVICE_URL=https://sallie-chat-service.azurewebsites.net
ANALYTICS_SERVICE_URL=https://sallie-analytics-service.azurewebsites.net
NOTIFICATION_SERVICE_URL=https://sallie-notification-service.azurewebsites.net
FILE_SERVICE_URL=https://sallie-file-service.azurewebsites.net
AI_SERVICE_URL=https://sallie-ai-service.azurewebsites.net
WEBSOCKET_SERVICE_URL=https://sallie-websocket-service.azurewebsites.net
PYTHON_AI_SERVICE_URL=https://sallie-python-ai-service.azurewebsites.net
```

## 9. Usage Instructions

### Daily Workflow
1. **Develop locally** on your mini PC
2. **Test changes** locally at 192.168.1.47:8742
3. **Run sync script**: `\\Sallie\b\sync\local-azure-sync.sh`
4. **Monitor deployment** via Azure Portal
5. **Check health**: `python \\Sallie\b\sync\health-check.py`

### Emergency Procedures
1. **Service down**: Check health script
2. **Data loss**: Use database sync to restore
3. **Code issues**: Use rollback script
4. **Performance issues**: Check Azure Monitor

This setup ensures your local mini PC remains the primary development environment while Azure provides production-scale hosting with automatic synchronization.
