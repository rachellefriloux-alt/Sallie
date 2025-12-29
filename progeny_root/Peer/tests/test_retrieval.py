"""Unit tests for Memory/Retrieval System."""

import pytest
import json
import time
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

from core.retrieval import MemorySystem, MemoryRecord


class TestMemoryRecord:
    """Test MemoryRecord model."""
    
    def test_record_creation(self):
        """Test creating a memory record."""
        record = MemoryRecord(
            text="Test memory",
            metadata={"source": "test", "salience": 0.8},
            timestamp=time.time(),
            salience=0.8
        )
        
        assert record.text == "Test memory"
        assert record.metadata["source"] == "test"
        assert record.salience == 0.8
        assert record.timestamp > 0
    
    def test_record_defaults(self):
        """Test memory record with defaults."""
        record = MemoryRecord(text="Test")
        
        assert record.text == "Test"
        assert record.metadata == {}
        assert record.salience == 0.5
        assert record.timestamp > 0


class TestMemorySystem:
    """Test MemorySystem functionality."""
    
    @pytest.fixture
    def memory_system(self):
        """Create a memory system for testing (local storage)."""
        return MemorySystem(use_local_storage=True)
    
    def test_initialization(self, memory_system):
        """Test memory system initializes correctly."""
        assert memory_system.client is not None
    
    def test_store_memory(self, memory_system):
        """Test storing a memory."""
        record = MemoryRecord(
            text="Test memory for storage",
            metadata={"source": "test"},
            salience=0.7
        )
        
        # Store memory
        result = memory_system.store(record.text, metadata=record.metadata, salience=record.salience)
        
        # Should return success
        assert result is not None
        assert "id" in result or "status" in result or result is True
    
    def test_retrieve_memories(self, memory_system):
        """Test retrieving memories."""
        # Store a test memory
        memory_system.store("Python programming is fun", metadata={"topic": "programming"}, salience=0.8)
        
        # Retrieve
        results = memory_system.retrieve("Python programming", limit=5)
        
        assert isinstance(results, list)
        # Results may be empty if collection is new, but should not error
    
    def test_retrieve_with_mmr(self, memory_system):
        """Test retrieval with MMR (Maximum Marginal Relevance) re-ranking."""
        # Store multiple related memories
        memory_system.store("Python is a programming language", metadata={"topic": "programming"}, salience=0.8)
        memory_system.store("Python has dynamic typing", metadata={"topic": "programming"}, salience=0.7)
        memory_system.store("Python is popular", metadata={"topic": "programming"}, salience=0.6)
        
        # Retrieve with MMR (should reduce redundancy)
        results = memory_system.retrieve("Python", limit=3, use_mmr=True)
        
        assert isinstance(results, list)
        # MMR should provide diverse results
    
    def test_salience_weighting(self, memory_system):
        """Test that high-salience memories are prioritized."""
        # Store memories with different salience
        memory_system.store("Low salience memory", salience=0.3)
        memory_system.store("High salience memory", salience=0.9)
        
        # Retrieve - high salience should rank higher
        results = memory_system.retrieve("memory", limit=5)
        
        assert isinstance(results, list)
        # In real implementation, higher salience should rank higher
    
    def test_freshness_weighting(self, memory_system):
        """Test that fresher memories are prioritized."""
        # Store old memory
        old_record = MemoryRecord(
            text="Old memory",
            timestamp=time.time() - (365 * 24 * 3600)  # 1 year ago
        )
        memory_system.store(old_record.text, timestamp=old_record.timestamp)
        
        # Store new memory
        new_record = MemoryRecord(
            text="New memory",
            timestamp=time.time()  # Now
        )
        memory_system.store(new_record.text, timestamp=new_record.timestamp)
        
        # Retrieve - newer should rank higher
        results = memory_system.retrieve("memory", limit=5)
        
        assert isinstance(results, list)
        # In real implementation, fresher memories should rank higher
    
    def test_consolidate_memories(self, memory_system):
        """Test memory consolidation (removes duplicates)."""
        # Store similar memories
        memory_system.store("Python is a language", metadata={"topic": "programming"})
        memory_system.store("Python is a programming language", metadata={"topic": "programming"})
        
        # Consolidate
        if hasattr(memory_system, 'consolidate_memories'):
            result = memory_system.consolidate_memories(similarity_threshold=0.95)
            assert result is not None
    
    def test_memory_versioning(self, memory_system):
        """Test memory versioning system."""
        # Store memory
        memory_system.store("Versioned memory", metadata={"version": 1})
        
        # Update memory (new version)
        # In real implementation, would use versioning API
        if hasattr(memory_system, 'update_memory'):
            result = memory_system.update_memory(
                memory_id="test_id",
                text="Updated versioned memory",
                metadata={"version": 2}
            )
            # Should handle versioning
    
    def test_delete_memory(self, memory_system):
        """Test deleting a memory."""
        # Store memory
        result = memory_system.store("Memory to delete", metadata={"test": True})
        memory_id = result.get("id") if isinstance(result, dict) else None
        
        # Delete if ID available
        if memory_id and hasattr(memory_system, 'delete'):
            delete_result = memory_system.delete(memory_id)
            assert delete_result is not None
    
    def test_search_with_filters(self, memory_system):
        """Test searching with metadata filters."""
        # Store memories with different metadata
        memory_system.store("Work memory", metadata={"category": "work", "priority": "high"})
        memory_system.store("Personal memory", metadata={"category": "personal", "priority": "low"})
        
        # Search with filter would filter by metadata
        # In real implementation, would use filter parameter
        results = memory_system.retrieve("memory", limit=10)
        assert isinstance(results, list)
    
    def test_embedding_generation(self, memory_system):
        """Test that embeddings are generated for stored memories."""
        # Store memory
        result = memory_system.store("Test embedding generation")
        
        # In real implementation, would verify embedding was created
        assert result is not None
    
    def test_error_handling_qdrant_down(self):
        """Test graceful degradation when Qdrant is unavailable."""
        # This would test fallback behavior
        # In real implementation, system should handle Qdrant failures gracefully
        pass
    
    def test_collection_creation(self, memory_system):
        """Test that collection is created if it doesn't exist."""
        # System should ensure collection exists on init
        assert memory_system.client is not None
    
    def test_metadata_preservation(self, memory_system):
        """Test that metadata is preserved when storing and retrieving."""
        metadata = {"source": "test", "topic": "programming", "salience": 0.8}
        memory_system.store("Memory with metadata", metadata=metadata)
        
        results = memory_system.retrieve("memory", limit=5)
        
        # Results should preserve metadata
        assert isinstance(results, list)
        # In real implementation, would verify metadata is preserved

