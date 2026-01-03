"""Cloud Hosting Integration for Sallie

Provides cloud hosting options to avoid local computer crashes:
- Railway (Easy deployment)
- Render (Modern hosting)
- Vercel (Web hosting)
- DigitalOcean (Full control)
- Heroku (Traditional hosting)
- AWS/Google Cloud (Enterprise)
- Self-hosted options
"""

import os
import json
import asyncio
import aiohttp
import subprocess
from typing import Dict, Any, List, Optional, Union
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
import logging

logger = logging.getLogger("cloud_hosting")

class CloudProvider(str, Enum):
    """Cloud hosting providers"""
    RAILWAY = "railway"
    RENDER = "render"
    VERCEL = "vercel"
    DIGITAL_OCEAN = "digital_ocean"
    HEROKU = "heroku"
    AWS = "aws"
    GOOGLE_CLOUD = "google_cloud"
    AZURE = "azure"
    SELF_HOSTED = "self_hosted"

class HostingTier(str, Enum):
    """Hosting tiers"""
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    BUSINESS = "business"
    ENTERPRISE = "enterprise"

@dataclass
class CloudConfig:
    """Cloud hosting configuration"""
    provider: CloudProvider
    tier: HostingTier
    api_key: Optional[str] = None
    project_id: Optional[str] = None
    region: str = "us-east-1"
    domain: Optional[str] = None
    environment: str = "production"
    auto_deploy: bool = True
    backup_enabled: bool = True
    monitoring_enabled: bool = True

@dataclass
class DeploymentConfig:
    """Deployment configuration"""
    app_name: str
    repository_url: str
    build_command: str
    start_command: str
    environment_variables: Dict[str, str] = field(default_factory=dict)
    port: int = 8000
    health_check_path: str = "/health"
    auto_restart: bool = True

class CloudHostingManager:
    """Manages cloud hosting for Sallie"""
    
    def __init__(self):
        self.configs: Dict[str, CloudConfig] = {}
        self.deployment_configs: Dict[str, DeploymentConfig] = {}
        self.active_deployments: Dict[str, Dict[str, Any]] = {}
        
    def add_provider(self, name: str, config: CloudConfig):
        """Add a cloud provider configuration"""
        self.configs[name] = config
        logger.info(f"[CloudHosting] Added provider: {name} ({config.provider})")
        
    def add_deployment(self, name: str, config: DeploymentConfig):
        """Add a deployment configuration"""
        self.deployment_configs[name] = config
        logger.info(f"[CloudHosting] Added deployment: {name}")
        
    async def deploy_to_railway(self, config: CloudConfig, deployment: DeploymentConfig) -> Dict[str, Any]:
        """Deploy to Railway"""
        try:
            # Railway CLI deployment
            commands = [
                "railway login",
                f"railway link {deployment.repository_url}",
                "railway up",
                "railway domain"
            ]
            
            results = []
            for cmd in commands:
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                results.append({
                    "command": cmd,
                    "exit_code": result.returncode,
                    "stdout": result.stdout,
                    "stderr": result.stderr
                })
                
            return {
                "success": all(r["exit_code"] == 0 for r in results),
                "provider": "railway",
                "results": results,
                "url": self._extract_railway_url(results)
            }
            
        except Exception as e:
            logger.error(f"[CloudHosting] Railway deployment failed: {e}")
            return {"success": False, "error": str(e)}
            
    async def deploy_to_render(self, config: CloudConfig, deployment: DeploymentConfig) -> Dict[str, Any]:
        """Deploy to Render"""
        try:
            # Render API deployment
            url = "https://api.render.com/v1/services"
            headers = {
                "Authorization": f"Bearer {config.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "type": "web_service",
                "name": deployment.app_name,
                "repo": deployment.repository_url,
                "buildCommand": deployment.build_command,
                "startCommand": deployment.start_command,
                "envVars": [{"key": k, "value": v} for k, v in deployment.environment_variables.items()],
                "healthCheckPath": deployment.health_check_path
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    if response.status == 201:
                        result = await response.json()
                        return {
                            "success": True,
                            "provider": "render",
                            "service_id": result.get("id"),
                            "url": result.get("url"),
                            "status": result.get("status")
                        }
                    else:
                        return {"success": False, "error": f"HTTP {response.status}"}
                        
        except Exception as e:
            logger.error(f"[CloudHosting] Render deployment failed: {e}")
            return {"success": False, "error": str(e)}
            
    async def deploy_to_vercel(self, config: CloudConfig, deployment: DeploymentConfig) -> Dict[str, Any]:
        """Deploy to Vercel"""
        try:
            # Vercel CLI deployment
            commands = [
                "vercel login",
                "vercel link",
                "vercel --prod"
            ]
            
            results = []
            for cmd in commands:
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                results.append({
                    "command": cmd,
                    "exit_code": result.returncode,
                    "stdout": result.stdout,
                    "stderr": result.stderr
                })
                
            return {
                "success": all(r["exit_code"] == 0 for r in results),
                "provider": "vercel",
                "results": results,
                "url": self._extract_vercel_url(results)
            }
            
        except Exception as e:
            logger.error(f"[CloudHosting] Vercel deployment failed: {e}")
            return {"success": False, "error": str(e)}
            
    async def deploy_to_digital_ocean(self, config: CloudConfig, deployment: DeploymentConfig) -> Dict[str, Any]:
        """Deploy to DigitalOcean"""
        try:
            # DigitalOcean App Platform deployment
            url = "https://api.digitalocean.com/v2/apps"
            headers = {
                "Authorization": f"Bearer {config.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "name": deployment.app_name,
                "region": config.region,
                "services": [{
                    "name": deployment.app_name,
                    "github": {
                        "repo": deployment.repository_url,
                        "branch": "main"
                    },
                    "source_dir": "/",
                    "run_command": deployment.start_command,
                    "build_command": deployment.build_command,
                    "http_port": deployment.port,
                    "instance_count": 1,
                    "instance_size_slug": "basic-xxs"
                }]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    if response.status == 201:
                        result = await response.json()
                        return {
                            "success": True,
                            "provider": "digital_ocean",
                            "app_id": result.get("app", {}).get("id"),
                            "url": result.get("app", {}).get("live_url"),
                            "status": result.get("app", {}).get("status")
                        }
                    else:
                        return {"success": False, "error": f"HTTP {response.status}"}
                        
        except Exception as e:
            logger.error(f"[CloudHosting] DigitalOcean deployment failed: {e}")
            return {"success": False, "error": str(e)}
            
    async def deploy_to_heroku(self, config: CloudConfig, deployment: DeploymentConfig) -> Dict[str, Any]:
        """Deploy to Heroku"""
        try:
            # Heroku CLI deployment
            commands = [
                "heroku login",
                f"heroku create {deployment.app_name}",
                "heroku config:set $(echo 'ENV_VAR=value' | tr '\\n' ' ')",
                "git push heroku main"
            ]
            
            results = []
            for cmd in commands:
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                results.append({
                    "command": cmd,
                    "exit_code": result.returncode,
                    "stdout": result.stdout,
                    "stderr": result.stderr
                })
                
            return {
                "success": all(r["exit_code"] == 0 for r in results),
                "provider": "heroku",
                "results": results,
                "url": self._extract_heroku_url(results)
            }
            
        except Exception as e:
            logger.error(f"[CloudHosting] Heroku deployment failed: {e}")
            return {"success": False, "error": str(e)}
            
    def _extract_railway_url(self, results: List[Dict[str, Any]]) -> Optional[str]:
        """Extract Railway URL from deployment results"""
        for result in results:
            if "railway.app" in result.get("stdout", ""):
                lines = result["stdout"].split("\n")
                for line in lines:
                    if "railway.app" in line:
                        return line.strip()
        return None
        
    def _extract_vercel_url(self, results: List[Dict[str, Any]]) -> Optional[str]:
        """Extract Vercel URL from deployment results"""
        for result in results:
            if "vercel.app" in result.get("stdout", ""):
                lines = result["stdout"].split("\n")
                for line in lines:
                    if "vercel.app" in line:
                        return line.strip()
        return None
        
    def _extract_heroku_url(self, results: List[Dict[str, Any]]) -> Optional[str]:
        """Extract Heroku URL from deployment results"""
        for result in results:
            if "herokuapp.com" in result.get("stdout", ""):
                lines = result["stdout"].split("\n")
                for line in lines:
                    if "herokuapp.com" in line:
                        return line.strip()
        return None
        
    async def deploy(self, provider_name: str, deployment_name: str) -> Dict[str, Any]:
        """Deploy to specified provider"""
        if provider_name not in self.configs:
            return {"success": False, "error": f"Provider {provider_name} not configured"}
            
        if deployment_name not in self.deployment_configs:
            return {"success": False, "error": f"Deployment {deployment_name} not configured"}
            
        config = self.configs[provider_name]
        deployment = self.deployment_configs[deployment_name]
        
        # Route to appropriate deployment method
        if config.provider == CloudProvider.RAILWAY:
            return await self.deploy_to_railway(config, deployment)
        elif config.provider == CloudProvider.RENDER:
            return await self.deploy_to_render(config, deployment)
        elif config.provider == CloudProvider.VERCEL:
            return await self.deploy_to_vercel(config, deployment)
        elif config.provider == CloudProvider.DIGITAL_OCEAN:
            return await self.deploy_to_digital_ocean(config, deployment)
        elif config.provider == CloudProvider.HEROKU:
            return await self.deploy_to_heroku(config, deployment)
        else:
            return {"success": False, "error": f"Provider {config.provider} not supported"}
            
    async def get_deployment_status(self, provider_name: str, deployment_id: str) -> Dict[str, Any]:
        """Get deployment status"""
        config = self.configs.get(provider_name)
        if not config:
            return {"success": False, "error": "Provider not configured"}
            
        # Implementation would vary by provider
        # This is a placeholder for status checking
        return {
            "success": True,
            "status": "running",
            "url": f"https://{deployment_id}.{config.provider.value}.com",
            "health": "healthy"
        }
        
    def get_free_tier_options(self) -> Dict[str, Any]:
        """Get free tier hosting options"""
        return {
            "railway": {
                "name": "Railway",
                "free_tier": "$5/month credit",
                "features": ["PostgreSQL", "Redis", "Docker", "Auto-deploy"],
                "limitations": ["Limited hours", "No custom domains"],
                "recommended": True
            },
            "render": {
                "name": "Render",
                "free_tier": "750 hours/month",
                "features": ["PostgreSQL", "Redis", "Auto-deploy", "SSL"],
                "limitations": ["Sleeps after 15min inactivity", "No background workers"],
                "recommended": True
            },
            "vercel": {
                "name": "Vercel",
                "free_tier": "Unlimited personal projects",
                "features": ["Serverless", "Edge functions", "CDN", "Analytics"],
                "limitations": ["No backend databases", "Function timeouts"],
                "recommended": True
            },
            "heroku": {
                "name": "Heroku",
                "free_tier": "Limited (eco dynos)",
                "features": ["Add-ons", "CI/CD", "SSL", "Logging"],
                "limitations": ["Sleeps after 30min", "Limited resources"],
                "recommended": False
            }
        }
        
    def create_deployment_configs(self) -> Dict[str, DeploymentConfig]:
        """Create default deployment configurations for Sallie"""
        return {
            "backend": DeploymentConfig(
                app_name="sallie-backend",
                repository_url="https://github.com/yourusername/sallie",
                build_command="pip install -r requirements.txt",
                start_command="python main.py",
                environment_variables={
                    "PORT": "8000",
                    "ENVIRONMENT": "production"
                },
                port=8000,
                health_check_path="/health"
            ),
            "web": DeploymentConfig(
                app_name="sallie-web",
                repository_url="https://github.com/yourusername/sallie-web",
                build_command="npm run build",
                start_command="npm start",
                environment_variables={
                    "PORT": "3000",
                    "NEXT_PUBLIC_API_URL": "https://sallie-backend.railway.app"
                },
                port=3000,
                health_check_path="/api/health"
            ),
            "mobile": DeploymentConfig(
                app_name="sallie-mobile",
                repository_url="https://github.com/yourusername/sallie-mobile",
                build_command="expo build:web",
                start_command="expo start --web",
                environment_variables={
                    "PORT": "19006",
                    "EXPO_PUBLIC_API_URL": "https://sallie-backend.railway.app"
                },
                port=19006,
                health_check_path="/health"
            )
        }

# Global instance
_cloud_hosting_manager = None

def get_cloud_hosting_manager() -> CloudHostingManager:
    """Get global cloud hosting manager instance"""
    global _cloud_hosting_manager
    if _cloud_hosting_manager is None:
        _cloud_hosting_manager = CloudHostingManager()
        # Add default configurations
        configs = _cloud_hosting_manager.create_deployment_configs()
        for name, config in configs.items():
            _cloud_hosting_manager.add_deployment(name, config)
    return _cloud_hosting_manager
