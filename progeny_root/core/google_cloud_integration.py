"""Google Cloud Integration for Sallie

Leverages existing Google Cloud subscriptions and free tiers:
- Google Cloud Storage for file storage
- Google Cloud Functions for serverless compute
- Google Cloud AI/ML services
- Google Cloud BigQuery for data analysis
- Google Cloud Pub/Sub for messaging
- Google Cloud Logging for monitoring
- Google Cloud APIs for various services

Uses existing subscriptions and free tiers where possible.
"""

import json
import logging
import time
import asyncio
import aiohttp
import requests
from typing import Dict, Any, List, Optional, Union
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
import os
import base64
from datetime import datetime

logger = logging.getLogger("google_cloud_integration")

class GoogleCloudService(str, Enum):
    """Google Cloud services Sallie can use"""
    STORAGE = "storage"
    FUNCTIONS = "functions"
    AI_PLATFORM = "ai_platform"
    BIGQUERY = "bigquery"
    PUBSUB = "pubsub"
    LOGGING = "logging"
    TRANSLATE = "translate"
    VISION = "vision"
    SPEECH = "speech"
    NATURAL_LANGUAGE = "natural_language"
    MAPS = "maps"
    PLACES = "places"
    DIRECTIONS = "directions"
    GEOCODING = "geocoding"
    YOUTUBE = "youtube"
    CALENDAR = "calendar"
    GMAIL = "gmail"
    DRIVE = "drive"
    SHEETS = "sheets"
    DOCS = "docs"
    PHOTOS = "photos"
    CONTACTS = "contacts"

@dataclass
class GoogleCloudConfig:
    """Google Cloud configuration"""
    project_id: str
    credentials_path: Optional[str] = None
    api_key: Optional[str] = None
    service_account_key: Optional[str] = None
    region: str = "us-central1"
    enabled_services: List[GoogleCloudService] = field(default_factory=list)
    free_tier_limits: Dict[str, Dict[str, Any]] = field(default_factory=dict)

@dataclass
class CloudResource:
    """Cloud resource information"""
    service: GoogleCloudService
    resource_id: str
    name: str
    type: str
    location: str
    status: str
    created_at: float
    last_accessed: float
    cost_info: Dict[str, Any]
    metadata: Dict[str, Any]

class GoogleCloudIntegration:
    """Google Cloud integration system for Sallie"""
    
    def __init__(self, config: Optional[GoogleCloudConfig] = None):
        self.config = config or self._load_default_config()
        self.session = None
        self.available_services = self._discover_available_services()
        self.resource_cache = {}
        self.usage_tracker = {}
        
    def _load_default_config(self) -> GoogleCloudConfig:
        """Load default Google Cloud configuration"""
        return GoogleCloudConfig(
            project_id=os.getenv("GOOGLE_CLOUD_PROJECT", "sallie-project"),
            credentials_path=os.getenv("GOOGLE_APPLICATION_CREDENTIALS"),
            api_key=os.getenv("GOOGLE_API_KEY"),
            service_account_key=os.getenv("GOOGLE_SERVICE_ACCOUNT_KEY"),
            region=os.getenv("GOOGLE_CLOUD_REGION", "us-central1"),
            enabled_services=[
                GoogleCloudService.STORAGE,
                GoogleCloudService.AI_PLATFORM,
                GoogleCloudService.TRANSLATE,
                GoogleCloudService.VISION,
                GoogleCloudService.NATURAL_LANGUAGE,
                GoogleCloudService.LOGGING,
            ],
            free_tier_limits={
                "storage": {"storage_gb": 5, "operations_per_month": 50000},
                "ai_platform": {"requests_per_minute": 60, "free_tier": True},
                "translate": {"characters_per_month": 500000},
                "vision": {"requests_per_minute": 1000},
                "natural_language": {"requests_per_minute": 600},
                "logging": {"log_entries_per_month": 1000000},
            }
        )
        
    def _discover_available_services(self) -> Dict[str, bool]:
        """Discover which Google Cloud services are available"""
        services = {}
        
        for service in GoogleCloudService:
            services[service.value] = self._check_service_availability(service)
            
        logger.info(f"[GoogleCloud] Available services: {sum(1 for v in services.values() if v)}/{len(services)}")
        return services
        
    def _check_service_availability(self, service: GoogleCloudService) -> bool:
        """Check if a specific Google Cloud service is available"""
        try:
            # Check if service is in enabled services
            if service not in self.config.enabled_services:
                return False
                
            # Check API key availability
            if not self.config.api_key and not self.config.service_account_key:
                return False
                
            # Test service availability with a simple API call
            if service == GoogleCloudService.STORAGE:
                return self._test_storage_service()
            elif service == GoogleCloudService.TRANSLATE:
                return self._test_translate_service()
            elif service == GoogleCloudService.VISION:
                return self._test_vision_service()
            elif service == GoogleCloudService.NATURAL_LANGUAGE:
                return self._test_natural_language_service()
            else:
                return True  # Assume available for other services
                
        except Exception as e:
            logger.error(f"[GoogleCloud] Service {service} not available: {e}")
            return False
            
    def _test_storage_service(self) -> bool:
        """Test Google Cloud Storage availability"""
        try:
            # Simple test - list buckets
            url = f"https://storage.googleapis.com/storage/v1/b"
            headers = self._get_auth_headers()
            response = requests.get(url, headers=headers, timeout=10)
            return response.status_code == 200
        except:
            return False
            
    def _test_translate_service(self) -> bool:
        """Test Google Translate API availability"""
        try:
            url = f"https://translation.googleapis.com/language/translate/v2/languages"
            params = {"key": self.config.api_key, "target": "en"}
            response = requests.get(url, params=params, timeout=10)
            return response.status_code == 200
        except:
            return False
            
    def _test_vision_service(self) -> bool:
        """Test Google Vision API availability"""
        try:
            url = f"https://vision.googleapis.com/v1/images:annotate"
            headers = self._get_auth_headers()
            test_data = {
                "requests": [{
                    "image": {"source": {"imageUri": "gs://bucket-name/image.jpg"}},
                    "features": [{"type": "LABEL_DETECTION"}]
                }]
            }
            response = requests.post(url, headers=headers, json=test_data, timeout=10)
            return response.status_code in [200, 400]  # 400 is ok (invalid image)
        except:
            return False
            
    def _test_natural_language_service(self) -> bool:
        """Test Google Natural Language API availability"""
        try:
            url = f"https://language.googleapis.com/v1/documents:analyzeEntities"
            headers = self._get_auth_headers()
            test_data = {
                "document": {
                    "type": "PLAIN_TEXT",
                    "content": "Hello world"
                }
            }
            response = requests.post(url, headers=headers, json=test_data, timeout=10)
            return response.status_code == 200
        except:
            return False
            
    def _get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers for Google Cloud APIs"""
        headers = {}
        
        if self.config.api_key:
            headers["x-goog-api-key"] = self.config.api_key
            
        if self.config.service_account_key:
            # In production, this would use proper OAuth2 flow
            headers["Authorization"] = f"Bearer {self.config.service_account_key}"
            
        return headers
        
    async def upload_to_storage(self, bucket_name: str, file_path: str, content: bytes) -> Dict[str, Any]:
        """Upload file to Google Cloud Storage"""
        if not self.available_services.get("storage", False):
            return {"error": "Storage service not available"}
            
        try:
            url = f"https://storage.googleapis.com/upload/storage/v1/b/{bucket_name}/o"
            headers = self._get_auth_headers()
            headers["Content-Type"] = "application/octet-stream"
            
            params = {
                "name": file_path,
                "uploadType": "media"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, params=params, data=content) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {
                            "success": True,
                            "bucket": bucket_name,
                            "file": file_path,
                            "size": len(content),
                            "generation": result.get("generation"),
                            "selfLink": result.get("selfLink")
                        }
                    else:
                        return {"error": f"Upload failed: {response.status}"}
                        
        except Exception as e:
            logger.error(f"[GoogleCloud] Storage upload failed: {e}")
            return {"error": str(e)}
            
    async def translate_text(self, text: str, target_language: str = "en", source_language: str = "auto") -> Dict[str, Any]:
        """Translate text using Google Translate API"""
        if not self.available_services.get("translate", False):
            return {"error": "Translate service not available"}
            
        try:
            url = f"https://translation.googleapis.com/language/translate/v2"
            params = {
                "key": self.config.api_key,
                "q": text,
                "target": target_language,
                "source": source_language,
                "format": "text"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        result = await response.json()
                        translations = result.get("data", {}).get("translations", [])
                        if translations:
                            return {
                                "success": True,
                                "translated_text": translations[0].get("translatedText"),
                                "detected_language": translations[0].get("detectedSourceLanguage"),
                                "original_text": text
                            }
                        else:
                            return {"error": "No translation returned"}
                    else:
                        return {"error": f"Translation failed: {response.status}"}
                        
        except Exception as e:
            logger.error(f"[GoogleCloud] Translation failed: {e}")
            return {"error": str(e)}
            
    async def analyze_image(self, image_url: str, features: List[str] = None) -> Dict[str, Any]:
        """Analyze image using Google Vision API"""
        if not self.available_services.get("vision", False):
            return {"error": "Vision service not available"}
            
        if features is None:
            features = ["LABEL_DETECTION", "WEB_DETECTION", "TEXT_DETECTION"]
            
        try:
            url = f"https://vision.googleapis.com/v1/images:annotate"
            headers = self._get_auth_headers()
            
            request_data = {
                "requests": [{
                    "image": {"source": {"imageUri": image_url}},
                    "features": [{"type": feature, "maxResults": 10} for feature in features]
                }]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=request_data) as response:
                    if response.status == 200:
                        result = await response.json()
                        responses = result.get("responses", [])
                        if responses:
                            return {
                                "success": True,
                                "annotations": responses[0],
                                "image_url": image_url,
                                "features": features
                            }
                        else:
                            return {"error": "No analysis returned"}
                    else:
                        return {"error": f"Vision analysis failed: {response.status}"}
                        
        except Exception as e:
            logger.error(f"[GoogleCloud] Vision analysis failed: {e}")
            return {"error": str(e)}
            
    async def analyze_text_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze text sentiment using Google Natural Language API"""
        if not self.available_services.get("natural_language", False):
            return {"error": "Natural Language service not available"}
            
        try:
            url = f"https://language.googleapis.com/v1/documents:analyzeSentiment"
            headers = self._get_auth_headers()
            
            request_data = {
                "document": {
                    "type": "PLAIN_TEXT",
                    "content": text
                },
                "encodingType": "UTF8"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=request_data) as response:
                    if response.status == 200:
                        result = await response.json()
                        document_sentiment = result.get("documentSentiment", {})
                        return {
                            "success": True,
                            "score": document_sentiment.get("score", 0),
                            "magnitude": document_sentiment.get("magnitude", 0),
                            "text": text,
                            "sentiment": self._classify_sentiment(document_sentiment.get("score", 0))
                        }
                    else:
                        return {"error": f"Sentiment analysis failed: {response.status}"}
                        
        except Exception as e:
            logger.error(f"[GoogleCloud] Sentiment analysis failed: {e}")
            return {"error": str(e)}
            
    def _classify_sentiment(self, score: float) -> str:
        """Classify sentiment based on score"""
        if score > 0.25:
            return "positive"
        elif score < -0.25:
            return "negative"
        else:
            return "neutral"
            
    async def log_to_cloud_logging(self, log_entry: Dict[str, Any]) -> Dict[str, Any]:
        """Log entry to Google Cloud Logging"""
        if not self.available_services.get("logging", False):
            return {"error": "Logging service not available"}
            
        try:
            url = f"https://logging.googleapis.com/v2/entries:write"
            headers = self._get_auth_headers()
            
            log_data = {
                "entries": [{
                    "logName": f"projects/{self.config.project_id}/logs/sallie",
                    "resource": {
                        "type": "global"
                    },
                    "severity": log_entry.get("severity", "INFO"),
                    "timestamp": log_entry.get("timestamp", time.time()),
                    "jsonPayload": log_entry
                }]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=log_data) as response:
                    if response.status == 200:
                        return {"success": True, "logged": True}
                    else:
                        return {"error": f"Logging failed: {response.status}"}
                        
        except Exception as e:
            logger.error(f"[GoogleCloud] Cloud logging failed: {e}")
            return {"error": str(e)}
            
    def get_service_status(self) -> Dict[str, Any]:
        """Get status of all Google Cloud services"""
        return {
            "project_id": self.config.project_id,
            "available_services": self.available_services,
            "enabled_services": [s.value for s in self.config.enabled_services],
            "total_services": len(GoogleCloudService),
            "available_count": sum(1 for v in self.available_services.values() if v),
            "free_tier_limits": self.config.free_tier_limits,
            "usage_tracker": self.usage_tracker
        }
        
    def get_free_tier_usage(self) -> Dict[str, Any]:
        """Get current free tier usage"""
        usage = {}
        
        for service, limits in self.config.free_tier_limits.items():
            current_usage = self.usage_tracker.get(service, {})
            usage[service] = {
                "limits": limits,
                "current": current_usage,
                "remaining": self._calculate_remaining(limits, current_usage),
                "percentage_used": self._calculate_percentage(limits, current_usage)
            }
            
        return usage
        
    def _calculate_remaining(self, limits: Dict[str, Any], usage: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate remaining free tier quota"""
        remaining = {}
        
        for limit_name, limit_value in limits.items():
            used_value = usage.get(limit_name, 0)
            remaining[limit_name] = max(0, limit_value - used_value)
            
        return remaining
        
    def _calculate_percentage(self, limits: Dict[str, Any], usage: Dict[str, Any]) -> float:
        """Calculate percentage of free tier used"""
        total_percentage = 0
        count = 0
        
        for limit_name, limit_value in limits.items():
            if limit_value > 0:
                used_value = usage.get(limit_name, 0)
                percentage = (used_value / limit_value) * 100
                total_percentage += percentage
                count += 1
                
        return total_percentage / count if count > 0 else 0

# Global instance
_google_cloud_integration = None

def get_google_cloud_integration(config: Optional[GoogleCloudConfig] = None) -> GoogleCloudIntegration:
    """Get global Google Cloud integration instance"""
    global _google_cloud_integration
    if _google_cloud_integration is None:
        _google_cloud_integration = GoogleCloudIntegration(config)
    return _google_cloud_integration
