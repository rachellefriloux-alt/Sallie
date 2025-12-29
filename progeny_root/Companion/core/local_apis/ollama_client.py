"""Ollama Client for Local APIs.

Simple client for interacting with Ollama API.
"""

import requests
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("local_apis.ollama")


class OllamaClient:
    """Client for Ollama API."""
    
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url.rstrip("/")
    
    def embeddings(self, model: str, prompt: str) -> Dict[str, Any]:
        """
        Get embeddings from Ollama.
        
        Args:
            model: Model name (e.g., "nomic-embed-text")
            prompt: Text to embed
            
        Returns:
            Response dict with "embedding" key
        """
        try:
            response = requests.post(
                f"{self.base_url}/api/embeddings",
                json={"model": model, "prompt": prompt},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Ollama embeddings request failed: {e}")
            return {}
    
    def generate(self, model: str, prompt: str, **kwargs) -> str:
        """
        Generate text from Ollama.
        
        Args:
            model: Model name
            prompt: Input prompt
            **kwargs: Additional parameters (temperature, etc.)
            
        Returns:
            Generated text
        """
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={"model": model, "prompt": prompt, **kwargs},
                timeout=60,
                stream=False
            )
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
        except Exception as e:
            logger.error(f"Ollama generate request failed: {e}")
            return ""

