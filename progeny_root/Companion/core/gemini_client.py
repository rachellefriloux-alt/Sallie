"""Gemini API client for LLM and embedding calls."""

import json
import logging
import time
from typing import Dict, Any, List, Optional

import httpx

from .utils import setup_logging

logger = setup_logging("gemini")

# Rate limiting: 15 requests per minute for free tier
RATE_LIMIT_DELAY = 4.0  # seconds between requests
MAX_RETRIES = 3
RETRY_DELAY = 2.0


class GeminiClient:
    """
    Async-compatible client for Google's Gemini API.
    Handles both text generation and embeddings.
    """

    def __init__(
        self,
        api_key: str,
        model: str = "gemini-1.5-pro",
        embedding_model: str = "text-embedding-004",
    ):
        self.api_key = api_key
        self.model = model
        self.embedding_model = embedding_model
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self._last_request_time = 0.0
        
        logger.info(f"GeminiClient initialized with model={model}, embedding={embedding_model}")

    def _rate_limit(self):
        """Enforce rate limiting between requests."""
        elapsed = time.time() - self._last_request_time
        if elapsed < RATE_LIMIT_DELAY:
            time.sleep(RATE_LIMIT_DELAY - elapsed)
        self._last_request_time = time.time()

    def chat(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.7,
        expect_json: bool = False,
    ) -> str:
        """
        Send a chat completion request to Gemini.
        
        Args:
            system_prompt: System instructions
            user_prompt: User message
            model: Override model (optional)
            temperature: Creativity (0.0-1.0)
            expect_json: If True, request JSON output format
            
        Returns:
            Generated text response
        """
        target_model = model or self.model
        url = f"{self.base_url}/models/{target_model}:generateContent?key={self.api_key}"
        
        # Build the request payload
        contents = [
            {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}
        ]
        
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "topP": 0.95,
                "topK": 40,
                "maxOutputTokens": 2048,
            }
        }
        
        # Request JSON output if needed
        if expect_json or "json" in system_prompt.lower():
            payload["generationConfig"]["responseMimeType"] = "application/json"
        
        # Retry logic
        for attempt in range(MAX_RETRIES):
            try:
                self._rate_limit()
                
                response = httpx.post(url, json=payload, timeout=60.0)
                
                if response.status_code == 429:
                    # Rate limited - wait and retry
                    logger.warning(f"Rate limited, waiting {RETRY_DELAY * (attempt + 1)}s...")
                    time.sleep(RETRY_DELAY * (attempt + 1))
                    continue
                    
                response.raise_for_status()
                
                data = response.json()
                
                # Extract text from response
                if "candidates" in data and len(data["candidates"]) > 0:
                    candidate = data["candidates"][0]
                    if "content" in candidate and "parts" in candidate["content"]:
                        parts = candidate["content"]["parts"]
                        if len(parts) > 0 and "text" in parts[0]:
                            return parts[0]["text"]
                
                logger.warning(f"Unexpected Gemini response structure: {data}")
                return "{}"
                
            except httpx.HTTPStatusError as e:
                logger.error(f"Gemini HTTP error (attempt {attempt + 1}): {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                continue
                
            except Exception as e:
                logger.error(f"Gemini error (attempt {attempt + 1}): {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                continue
        
        # All retries failed
        logger.error("All Gemini retries failed")
        return "{}"

    def embed(self, text: str, model: Optional[str] = None) -> List[float]:
        """
        Get embedding vector for text using Gemini's embedding model.
        
        Args:
            text: Text to embed
            model: Override embedding model (optional)
            
        Returns:
            List of floats representing the embedding vector
        """
        target_model = model or self.embedding_model
        url = f"{self.base_url}/models/{target_model}:embedContent?key={self.api_key}"
        
        payload = {
            "model": f"models/{target_model}",
            "content": {
                "parts": [{"text": text}]
            }
        }
        
        for attempt in range(MAX_RETRIES):
            try:
                self._rate_limit()
                
                response = httpx.post(url, json=payload, timeout=30.0)
                
                if response.status_code == 429:
                    logger.warning(f"Rate limited on embedding, waiting...")
                    time.sleep(RETRY_DELAY * (attempt + 1))
                    continue
                    
                response.raise_for_status()
                
                data = response.json()
                
                if "embedding" in data and "values" in data["embedding"]:
                    return data["embedding"]["values"]
                
                logger.warning(f"Unexpected embedding response: {data}")
                return []
                
            except Exception as e:
                logger.error(f"Gemini embedding error (attempt {attempt + 1}): {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))
                continue
        
        logger.error("All Gemini embedding retries failed")
        return []

    def is_available(self) -> bool:
        """
        Check if Gemini API is reachable.
        
        Returns:
            True if API responds successfully
        """
        try:
            # Simple test with minimal request
            url = f"{self.base_url}/models/{self.model}?key={self.api_key}"
            response = httpx.get(url, timeout=10.0)
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"Gemini availability check failed: {e}")
            return False


# Singleton instance (initialized when config is loaded)
_client: Optional[GeminiClient] = None


def get_gemini_client() -> Optional[GeminiClient]:
    """Get or create the global Gemini client."""
    global _client
    if _client is None:
        try:
            from .config import load_config
            config = load_config()
            api_key = config.get("llm", {}).get("gemini_api_key", "")
            if api_key:
                _client = GeminiClient(
                    api_key=api_key,
                    model=config.get("llm", {}).get("gemini_model", "gemini-1.5-pro"),
                    embedding_model=config.get("embeddings", {}).get("gemini_model", "text-embedding-004"),
                )
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
    return _client


def init_gemini_client(api_key: str, model: str = "gemini-1.5-pro", embedding_model: str = "text-embedding-004") -> GeminiClient:
    """Initialize the global Gemini client with explicit parameters."""
    global _client
    _client = GeminiClient(api_key=api_key, model=model, embedding_model=embedding_model)
    return _client
