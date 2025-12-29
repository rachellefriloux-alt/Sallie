"""Batch processing for performance optimization."""

import time
import logging
from typing import List, Dict, Any, Callable, Optional
from collections import deque
from threading import Lock

logger = logging.getLogger("performance.batch")


class BatchProcessor:
    """
    Batch processor for grouping operations.
    
    Used for:
    - Memory writes (batch insert to Qdrant)
    - API requests (group similar requests)
    - File operations (batch file writes)
    """
    
    def __init__(
        self,
        batch_size: int = 10,
        flush_interval: float = 5.0,
        processor: Optional[Callable] = None
    ):
        """
        Initialize batch processor.
        
        Args:
            batch_size: Maximum items per batch
            flush_interval: Seconds between automatic flushes
            processor: Function to process batches
        """
        self.batch_size = batch_size
        self.flush_interval = flush_interval
        self.processor = processor or self._default_processor
        
        self.queue: deque = deque()
        self.lock = Lock()
        self.last_flush = time.time()
        self.total_processed = 0
        
        logger.info(f"[BatchProcessor] Initialized (batch_size={batch_size}, flush_interval={flush_interval})")
    
    def add(self, item: Any):
        """Add item to batch queue."""
        with self.lock:
            self.queue.append({
                "item": item,
                "timestamp": time.time()
            })
            
            # Auto-flush if batch size reached
            if len(self.queue) >= self.batch_size:
                self._flush()
    
    def flush(self) -> int:
        """Manually flush current batch."""
        with self.lock:
            return self._flush()
    
    def _flush(self) -> int:
        """Internal flush (must be called with lock held)."""
        if not self.queue:
            return 0
        
        batch = list(self.queue)
        self.queue.clear()
        
        try:
            self.processor(batch)
            processed = len(batch)
            self.total_processed += processed
            self.last_flush = time.time()
            logger.info(f"[BatchProcessor] Processed batch of {processed} items")
            return processed
        except Exception as e:
            logger.error(f"[BatchProcessor] Batch processing failed: {e}")
            # Re-queue items on failure
            self.queue.extendleft(reversed(batch))
            return 0
    
    def auto_flush(self):
        """Check if auto-flush is needed and flush if so."""
        current_time = time.time()
        if current_time - self.last_flush >= self.flush_interval:
            with self.lock:
                if self.queue:
                    self._flush()
    
    def _default_processor(self, batch: List[Dict[str, Any]]):
        """Default batch processor (logs items)."""
        logger.info(f"[BatchProcessor] Processing {len(batch)} items")
        for item in batch:
            logger.debug(f"[BatchProcessor] Item: {item['item']}")
    
    def stats(self) -> Dict[str, Any]:
        """Get batch processor statistics."""
        with self.lock:
            return {
                "queue_size": len(self.queue),
                "batch_size": self.batch_size,
                "flush_interval": self.flush_interval,
                "total_processed": self.total_processed,
                "last_flush": self.last_flush,
                "time_since_flush": time.time() - self.last_flush
            }


class MemoryWriteBatcher:
    """
    Specialized batch processor for memory writes.
    
    Batches memory writes to Qdrant for better performance.
    """
    
    def __init__(self, memory_system, batch_size: int = 20, flush_interval: float = 10.0):
        """
        Initialize memory write batcher.
        
        Args:
            memory_system: MemorySystem instance
            batch_size: Maximum writes per batch
            flush_interval: Seconds between automatic flushes
        """
        self.memory_system = memory_system
        self.batcher = BatchProcessor(
            batch_size=batch_size,
            flush_interval=flush_interval,
            processor=self._process_memory_batch
        )
        logger.info("[MemoryWriteBatcher] Initialized")
    
    def add(self, text: str, metadata: Dict[str, Any], salience: float = 0.5):
        """Add memory write to batch."""
        self.batcher.add({
            "text": text,
            "metadata": metadata,
            "salience": salience
        })
    
    def _process_memory_batch(self, batch: List[Dict[str, Any]]):
        """Process batch of memory writes."""
        try:
            # Extract items
            texts = [item["item"]["text"] for item in batch]
            metadatas = [item["item"]["metadata"] for item in batch]
            saliences = [item["item"]["salience"] for item in batch]
            
            # Batch insert to Qdrant
            # Note: This would use Qdrant's batch insert API
            for i, text in enumerate(texts):
                self.memory_system.add(
                    text=text,
                    metadata=metadatas[i],
                    salience=saliences[i]
                )
            
            logger.info(f"[MemoryWriteBatcher] Processed {len(batch)} memory writes")
        except Exception as e:
            logger.error(f"[MemoryWriteBatcher] Batch processing failed: {e}")
            raise
    
    def flush(self):
        """Flush pending memory writes."""
        return self.batcher.flush()

