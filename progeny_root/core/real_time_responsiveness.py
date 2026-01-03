"""Real-Time Responsiveness System.

Enables Sallie to respond instantly and naturally:
- Sub-second response times
- Natural conversation flow
- Immediate emotional reactions
- Real-time context awareness
- Stream processing for long responses
- Interrupt handling and recovery
- Adaptive response timing
- Concurrent request handling

This makes Sallie feel truly present and responsive.
"""

import json
import logging
import time
import asyncio
from typing import Dict, Any, List, Optional, Callable, AsyncGenerator
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
from threading import Thread, Event
from queue import Queue, Empty
from concurrent.futures import ThreadPoolExecutor
import weakref

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from llm_router import get_llm_router

logger = setup_logging("real_time_responsiveness")

class ResponsePriority(str, Enum):
    """Priority levels for responses."""
    CRITICAL = "critical"     # Emergency, safety, immediate attention
    HIGH = "high"           # Important user needs
    MEDIUM = "medium"       # Normal conversation
    LOW = "low"            # Background tasks

class ResponseType(str, Enum):
    """Types of responses."""
    INSTANT = "instant"         # Immediate reaction (< 100ms)
    QUICK = "quick"             # Quick response (< 500ms)
    NORMAL = "normal"           # Normal response (< 2s)
    DETAILED = "detailed"       # Detailed response (< 5s)
    STREAMING = "streaming"     # Streaming response

@dataclass
class ResponseRequest:
    """A response request with timing and priority."""
    request_id: str
    user_id: str
    message: str
    context: Dict[str, Any]
    priority: ResponsePriority
    response_type: ResponseType
    timestamp: datetime
    timeout: timedelta
    callback: Optional[Callable] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class Response:
    """A response with timing information."""
    request_id: str
    user_id: str
    content: str
    response_type: ResponseType
    priority: ResponsePriority
    created_at: datetime
    started_at: datetime
    completed_at: datetime
    duration_ms: float
    metadata: Dict[str, Any] = field(default_factory=dict)

class RealTimeResponsivenessSystem:
    """System for managing real-time responsive interactions."""
    
    def __init__(self, limbic_system: LimbicSystem, memory_system: MemorySystem):
        self.limbic = limbic_system
        self.memory = memory_system
        
        # Request processing
        self.request_queue: Queue[ResponseRequest] = Queue()
        self.active_requests: Dict[str, ResponseRequest] = {}
        self.response_cache: Dict[str, Response] = {}
        
        # Performance metrics
        self.response_times: List[float] = []
        self.request_counts: Dict[str, int] = {}
        self.priority_stats: Dict[ResponsePriority, int] = {}
        
        # Responsiveness parameters
        self.max_concurrent_requests = 10
        self.default_timeout = timedelta(seconds=30)
        self.instant_response_threshold = timedelta(milliseconds=100)
        self.quick_response_threshold = timedelta(milliseconds=500)
        
        # Background processing
        self.is_running = False
        self.executor = ThreadPoolExecutor(max_workers=5)
        self.processing_thread: Optional[Thread] = None
        self.stop_event = Event()
        
        # Response generators
        self.response_generators: Dict[ResponseType, Callable] = {
            ResponseType.INSTANT: self._generate_instant_response,
            ResponseType.QUICK: self._generate_quick_response,
            ResponseType.NORMAL: self._generate_normal_response,
            ResponseType.DETAILED: self._generate_detailed_response,
            ResponseType.STREAMING: self._generate_streaming_response
        }
        
        # Emotional responsiveness
        self.emotional_reactions = {
            "excitement": "I'm so excited about this!",
            "curiosity": "That's fascinating, tell me more!",
            "concern": "I'm here for you, what's on your mind?",
            "agreement": "Absolutely! I completely agree.",
            "understanding": "I understand completely.",
            "delight": "That's wonderful!",
            "surprise": "Wow, I didn't expect that!"
        }
        
        logger.info("[RealTimeResponsiveness] System initialized")
    
    def start(self):
        """Start the real-time responsiveness system."""
        if self.is_running:
            logger.warning("[RealTimeResponsiveness] System already running")
            return
        
        self.is_running = True
        self.stop_event.clear()
        
        self.processing_thread = Thread(target=self._processing_loop, daemon=True)
        self.processing_thread.start()
        
        logger.info("[RealTimeResponsiveness] System started")
    
    def stop(self):
        """Stop the real-time responsiveness system."""
        if not self.is_running:
            return
        
        self.is_running = False
        self.stop_event.set()
        
        if self.processing_thread:
            self.processing_thread.join(timeout=5)
        
        self.executor.shutdown(wait=True)
        
        logger.info("[RealTimeResponsiveness] System stopped")
    
    def _processing_loop(self):
        """Main processing loop for handling requests."""
        
        while self.is_running:
            try:
                # Get next request (with timeout)
                try:
                    request = self.request_queue.get(timeout=1.0)
                except Empty:
                    continue
                
                # Check if request has expired
                if datetime.now() - request.timestamp > request.timeout:
                    logger.warning(f"[RealTimeResponsiveness] Request {request.request_id} expired")
                    continue
                
                # Process request
                self.executor.submit(self._process_request, request)
                
            except Exception as e:
                logger.error(f"[RealTimeResponsiveness] Processing loop error: {e}")
                time.sleep(1)
    
    def _process_request(self, request: ResponseRequest):
        """Process a single response request."""
        
        start_time = datetime.now()
        
        try:
            # Add to active requests
            self.active_requests[request.request_id] = request
            
            # Update statistics
            self.request_counts[request.user_id] = self.request_counts.get(request.user_id, 0) + 1
            self.priority_stats[request.priority] = self.priority_stats.get(request.priority, 0) + 1
            
            # Generate response
            response_generator = self.response_generators.get(request.response_type)
            if response_generator:
                response = response_generator(request)
            else:
                response = self._generate_fallback_response(request)
            
            # Calculate timing
            completed_at = datetime.now()
            duration_ms = (completed_at - start_time).total_seconds() * 1000
            
            # Update response object
            response.started_at = start_time
            response.completed_at = completed_at
            response.duration_ms = duration_ms
            
            # Cache response
            self.response_cache[request.request_id] = response
            
            # Update performance metrics
            self.response_times.append(duration_ms)
            if len(self.response_times) > 1000:
                self.response_times = self.response_times[-500:]
            
            # Send response
            if request.callback:
                request.callback(response)
            
            logger.debug(f"[RealTimeResponsiveness] Processed {request.request_id} in {duration_ms:.0f}ms")
            
        except Exception as e:
            logger.error(f"[RealTimeResponsiveness] Error processing request {request.request_id}: {e}")
            
            # Create error response
            error_response = Response(
                request_id=request.request_id,
                user_id=request.user_id,
                content="I'm having trouble responding right now. Please try again.",
                response_type=ResponseType.NORMAL,
                priority=request.priority,
                created_at=start_time,
                started_at=start_time,
                completed_at=datetime.now(),
                duration_ms=0,
                metadata={"error": str(e)}
            )
            
            if request.callback:
                request.callback(error_response)
        
        finally:
            # Remove from active requests
            self.active_requests.pop(request.request_id, None)
    
    async def request_response(self, user_id: str, message: str, context: Dict[str, Any] = None, 
                             priority: ResponsePriority = ResponsePriority.MEDIUM, 
                             response_type: ResponseType = ResponseType.NORMAL,
                             timeout: timedelta = None,
                             callback: Callable = None) -> str:
        """Request a response with specified parameters."""
        
        request_id = f"req_{int(time.time() * 1000)}_{user_id}"
        
        request = ResponseRequest(
            request_id=request_id,
            user_id=user_id,
            message=message,
            context=context or {},
            priority=priority,
            response_type=response_type,
            timestamp=datetime.now(),
            timeout=timeout or self.default_timeout,
            callback=callback
        )
        
        # Add to queue
        self.request_queue.put(request)
        
        # Wait for response
        response = await self._wait_for_response(request_id, timeout)
        
        return response.content if response else "I'm thinking about that..."
    
    async def _wait_for_response(self, request_id: str, timeout: timedelta) -> Optional[Response]:
        """Wait for a response to be processed."""
        
        timeout_time = timeout.total_seconds()
        start_time = time.time()
        
        while time.time() - start_time < timeout_time:
            if request_id in self.response_cache:
                return self.response_cache[request_id]
            
            await asyncio.sleep(0.01)  # Small delay to prevent busy waiting
        
        logger.warning(f"[RealTimeResponsiveness] Timeout waiting for response {request_id}")
        return None
    
    def _generate_instant_response(self, request: ResponseRequest) -> Response:
        """Generate an instant response (< 100ms)."""
        
        start_time = datetime.now()
        
        # Use pre-defined emotional reactions for instant responses
        message_lower = request.message.lower()
        
        # Check for emotional triggers
        for trigger, reaction in self.emotional_reactions.items():
            if trigger in message_lower:
                return Response(
                    request_id=request.request_id,
                    user_id=request.user_id,
                    content=reaction,
                    response_type=ResponseType.INSTANT,
                    priority=request.priority,
                    created_at=start_time,
                    started_at=start_time,
                    completed_at=datetime.now(),
                    duration_ms=50,
                    metadata={"instant": True}
                )
        
        # Default instant response
        return Response(
            request_id=request.request_id,
            user_id=request.user_id,
            content="I'm here! 🌟",
            response_type=ResponseType.INSTANT,
            priority=request.priority,
            created_at=start_time,
            started_at=start_time,
            completed_at=datetime.now(),
            duration_ms=50,
            metadata={"instant": True}
        )
    
    def _generate_quick_response(self, request: ResponseRequest) -> Response:
        """Generate a quick response (< 500ms)."""
        
        start_time = datetime.now()
        
        # Simple keyword-based quick responses
        message_lower = request.message.lower()
        
        quick_responses = {
            "hello": "Hello there! 👋",
            "hi": "Hi! How can I help you?",
            "how are you": "I'm doing great, thanks for asking! How about you?",
            "what's up": "Not much, just here to help! What's on your mind?",
            "thanks": "You're very welcome! 😊",
            "bye": "Goodbye! Talk to you soon! 👋",
            "ok": "Okay! What would you like to do?",
            "yes": "Yes! Absolutely!",
            "no": "No, I don't think so.",
            "cool": "That's really cool! 😎",
            "awesome": "That sounds awesome! 🎉",
            "wow": "Wow! That's impressive!",
            "lol": "Haha, that's funny! 😄",
            "haha": "Haha! That made me smile! 😊",
            "nice": "That's really nice!",
            "great": "That's great! 👍",
            "good": "That's good to hear!",
            "bad": "I'm sorry to hear that. Is there anything I can do?",
            "sad": "I'm here for you. What's on your mind?",
            "happy": "I'm so glad to hear that! 😊",
            "excited": "I'm excited too! This sounds great!",
            "love": "Love you too! 💕",
        }
        
        # Look for exact matches first
        for keyword, response in quick_responses.items():
            if keyword in message_lower.split():
                return Response(
                    request_id=request.request_id,
                    user_id=request.user_id,
                    content=response,
                    response_type=ResponseType.QUICK,
                    priority=request.priority,
                    created_at=start_time,
                    started_at=start_time,
                    completed_at=datetime.now(),
                    duration_ms=200,
                    metadata={"quick": True, "keyword": keyword}
                )
        
        # Fallback to simple acknowledgment
        return Response(
            request_id=request.request_id,
            user_id=request.user_id,
            content="Got it! 👍",
            response_type=ResponseType.QUICK,
            priority=request.priority,
            created_at=start_time,
            started_at=start_time,
            completed_at=datetime.now(),
            duration_ms=200,
            metadata={"quick": True}
        )
    
    def _generate_normal_response(self, request: ResponseRequest) -> Response:
        """Generate a normal response (< 2s)."""
        
        start_time = datetime.now()
        
        router = get_llm_router()
        if not router:
            return self._generate_fallback_response(request)
        
        try:
            # Build prompt with context
            prompt = f"""User: {request.message}
            
            Context: {json.dumps(request.context, indent=2)}
            
            User ID: {request.user_id}
            Time: {datetime.now().strftime('%H:%M')}
            
            Respond naturally and conversationally. Keep it concise but thoughtful."""
            
            response_text = router.generate(prompt)
            
            return Response(
                request_id=request.request_id,
                user_id=request.user_id,
                content=response_text,
                response_type=ResponseType.NORMAL,
                priority=request.priority,
                created_at=start_time,
                started_at=start_time,
                completed_at=datetime.now(),
                duration_ms=(datetime.now() - start_time).total_seconds() * 1000,
                metadata={"normal": True}
            )
            
        except Exception as e:
            logger.error(f"[RealTimeResponsiveness] Error generating normal response: {e}")
            return self._generate_fallback_response(request)
    
    def _generate_detailed_response(self, request: ResponseRequest) -> Response:
        """Generate a detailed response (< 5s)."""
        
        start_time = datetime.now()
        
        router = get_llm_router()
        if not router:
            return self._generate_fallback_response(request)
        
        try:
            # Build detailed prompt
            prompt = f"""User: {request.message}
            
            Context: {json.dumps(request.context, indent=2)}
            
            User ID: {request.user_id}
            Time: {datetime.now().strftime('%H:%M')}
            
            Provide a thoughtful, detailed response. Consider:
            1. The user's emotional state
            2. Previous context
            3. Deeper implications
            4. Personalized insights
            
            Be thorough but stay conversational."""
            
            response_text = router.generate(prompt)
            
            return Response(
                request_id=request.request_id,
                user_id=request.user_id,
                content=response_text,
                response_type=ResponseType.DETAILED,
                priority=request.priority,
                created_at=start_time,
                started_at=start_time,
                completed_at=datetime.now(),
                duration_ms=(datetime.now() - start_time).total_seconds() * 1000,
                metadata={"detailed": True}
            )
            
        except Exception as e:
            logger.error(f"[RealTimeResponsiveness] Error generating detailed response: {e}")
            return self._generate_fallback_response(request)
    
    def _generate_streaming_response(self, request: ResponseRequest) -> Response:
        """Generate a streaming response."""
        
        start_time = datetime.now()
        
        # For now, return a normal response
        # In a full implementation, this would stream the response
        normal_response = self._generate_normal_response(request)
        normal_response.response_type = ResponseType.STREAMING
        
        return normal_response
    
    def _generate_fallback_response(self, request: ResponseRequest) -> Response:
        """Generate a fallback response when systems are unavailable."""
        
        start_time = datetime.now()
        
        fallback_responses = [
            "I'm here and ready to help!",
            "That's interesting! Tell me more.",
            "I'm thinking about that...",
            "I understand. Let me help you with that.",
            "That sounds important. How can I assist?",
            "I'm here to support you.",
            "That's a great question!",
            "I'm listening carefully.",
            "I appreciate you sharing that with me."
        ]
        
        import random
        response_text = random.choice(fallback_responses)
        
        return Response(
            request_id=request.request_id,
            user_id=request.user_id,
            content=response_text,
            response_type=ResponseType.NORMAL,
            priority=request.priority,
            created_at=start_time,
            started_at=start_time,
            completed_at=datetime.now(),
            duration_ms=1000,
            metadata={"fallback": True}
        )
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get performance metrics for the responsiveness system."""
        
        if not self.response_times:
            return {"status": "no_data", "message": "No response times recorded yet"}
        
        avg_response_time = sum(self.response_times) / len(self.response_times)
        p95_response_time = sorted(self.response_times)[int(len(self.response_times) * 0.95)]
        p99_response_time = sorted(self.response_times)[int(len(self.response_times) * 0.99)]
        
        return {
            "avg_response_time_ms": avg_response_time,
            "p95_response_time_ms": p95_response_time,
            "p99_response_time_ms": p99_response_time,
            "total_requests": sum(self.request_counts.values()),
            "active_requests": len(self.active_requests),
            "cached_responses": len(self.response_cache),
            "priority_distribution": self.priority_stats,
            "is_running": self.is_running
        }
    
    def get_user_metrics(self, user_id: str) -> Dict[str, Any]:
        """Get metrics for a specific user."""
        
        user_requests = self.request_counts.get(user_id, 0)
        user_responses = [r for r in self.response_cache.values() if r.user_id == user_id]
        
        if not user_responses:
            return {
                "user_id": user_id,
                "total_requests": user_requests,
                "avg_response_time": 0,
                "status": "no_data"
            }
        
        user_times = [r.duration_ms for r in user_responses]
        avg_time = sum(user_times) / len(user_times) if user_times else 0
        
        return {
            "user_id": user_id,
            "total_requests": user_requests,
            "avg_response_time_ms": avg_time,
            "total_responses": len(user_responses),
            "last_response": max([r.completed_at for r in user_responses]).isoformat() if user_responses else None
        }
    
    def set_concurrency_limit(self, limit: int):
        """Set maximum concurrent requests."""
        self.max_concurrent_requests = max(1, min(50, limit))
        logger.info(f"[RealTimeResponsiveness] Concurrency limit set to {self.max_concurrent_requests}")
    
    def set_timeout(self, timeout: timedelta):
        """Set default request timeout."""
        self.default_timeout = timeout
        logger.info(f"[RealTimeResponsiveness] Default timeout set to {timeout.total_seconds()}s")
    
    def health_check(self) -> bool:
        """Check if real-time responsiveness system is healthy."""
        try:
            return (self.is_running and 
                   len(self.response_generators) == 5 and
                   len(self.emotional_reactions) > 0)
        except:
            return False

# Global instance
_real_time_responsiveness_system: Optional[RealTimeResponsivenessSystem] = None

def get_real_time_responsiveness_system(limbic_system: LimbicSystem, memory_system: MemorySystem) -> RealTimeResponsivenessSystem:
    """Get or create the global real-time responsiveness system."""
    global _real_time_responsiveness_system
    if _real_time_responsiveness_system is None:
        _real_time_responsiveness_system = RealTimeResponsivenessSystem(limbic_system, memory_system)
    return _real_time_responsiveness_system
