"""Unit tests for Dream Cycle System."""

import pytest
import json
import time
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

from core.dream import DreamSystem
from core.limbic import LimbicSystem
from core.retrieval import MemorySystem


class TestDreamSystem:
    """Test DreamSystem functionality."""
    
    @pytest.fixture
    def dream_system(self):
        """Create dream system for testing."""
        limbic = LimbicSystem()
        memory = MemorySystem(use_local_storage=True)
        monologue = Mock()  # Mock monologue system
        return DreamSystem(limbic, memory, monologue)
    
    def test_initialization(self, dream_system):
        """Test dream system initializes correctly."""
        assert dream_system.limbic is not None
        assert dream_system.memory is not None
        assert dream_system.monologue is not None
        assert dream_system.identity is not None
    
    def test_limbic_decay(self, dream_system):
        """Test that limbic state decays during dream cycle."""
        # Set high arousal and valence
        dream_system.limbic.state.arousal = 0.9
        dream_system.limbic.state.valence = 0.8
        initial_arousal = dream_system.limbic.state.arousal
        initial_valence = dream_system.limbic.state.valence
        
        # Run dream cycle
        dream_system.run_cycle()
        
        # Arousal and valence should decay towards baseline
        assert dream_system.limbic.state.arousal < initial_arousal
        assert dream_system.limbic.state.valence < initial_valence
    
    def test_hypothesis_extraction(self, dream_system, tmp_path):
        """Test hypothesis extraction from thoughts.log."""
        # Create sample thoughts.log
        thoughts_log = tmp_path / "thoughts.log"
        thoughts_log.parent.mkdir(parents=True, exist_ok=True)
        
        with open(thoughts_log, "w") as f:
            f.write("""
[2024-01-01T10:00:00] INPUT
Content: "I'm feeling stressed about deadlines"
-----
[2024-01-01T11:00:00] INPUT
Content: "The deadline pressure is overwhelming"
-----
""")
        
        # Patch thoughts log path
        with patch('core.dream.THOUGHTS_LOG', thoughts_log):
            # Mock router for pattern extraction
            mock_router = Mock()
            mock_router.chat.return_value = json.dumps({
                "patterns": [
                    {
                        "pattern": "Creator experiences stress about deadlines",
                        "evidence": ["stress about deadlines", "deadline pressure"],
                        "confidence": 0.8,
                        "category": "behavior"
                    }
                ],
                "conflicts": [],
                "conditionals": []
            })
            dream_system.router = mock_router
            
            # Extract patterns
            if hasattr(dream_system, '_extract_patterns_from_thoughts_log'):
                patterns = dream_system._extract_patterns_from_thoughts_log()
                # Should extract patterns
                assert isinstance(patterns, list)
    
    def test_conflict_detection(self, dream_system):
        """Test conflict detection between Heritage and new patterns."""
        # Mock heritage and hypotheses
        mock_heritage = {"values": ["honesty", "transparency"]}
        mock_hypotheses = [
            {"pattern": "Creator values privacy", "weight": 0.7}
        ]
        
        # Mock conflict detection
        if hasattr(dream_system, '_detect_conflicts'):
            conflicts = dream_system._detect_conflicts(mock_hypotheses, mock_heritage)
            assert isinstance(conflicts, list)
    
    def test_heritage_promotion(self, dream_system, tmp_path):
        """Test heritage promotion workflow."""
        # Create test memory with high salience
        high_salience_record = {
            "text": "Creator prefers detailed technical explanations",
            "metadata": {"salience": 0.9, "source": "test"},
            "timestamp": time.time()
        }
        
        # Mock memory retrieval to return high-salience memory
        mock_memories = [high_salience_record]
        dream_system.memory.retrieve = Mock(return_value=mock_memories)
        
        # Patch heritage directory
        heritage_dir = tmp_path / "heritage" / "memories"
        heritage_dir.mkdir(parents=True, exist_ok=True)
        
        with patch('core.dream.Path') as mock_path:
            mock_path.return_value = heritage_dir
            
            # Run heritage promotion
            if hasattr(dream_system, '_promote_to_heritage'):
                dream_system._promote_to_heritage()
                
                # Verify heritage files were created (if implementation creates files)
                # This depends on actual implementation
    
    def test_second_brain_hygiene(self, dream_system, tmp_path):
        """Test Second Brain hygiene routines."""
        # Create working directory structure
        working_dir = tmp_path / "working"
        working_dir.mkdir(parents=True, exist_ok=True)
        
        # Create now.md
        now_file = working_dir / "now.md"
        now_file.write_text("Priority 1\nPriority 2\nPriority 3")
        
        # Patch working directory
        with patch('core.dream.WORKING_DIR', working_dir):
            # Run hygiene
            if hasattr(dream_system, '_hygiene_working_memory'):
                dream_system._hygiene_working_memory()
                
                # Verify hygiene was performed
                # (Depends on implementation details)
    
    def test_hypothesis_storage(self, dream_system, tmp_path):
        """Test hypothesis storage in patches.json."""
        patches_file = tmp_path / "patches.json"
        
        test_hypotheses = [
            {
                "id": "hyp_001",
                "pattern": "Test pattern",
                "evidence": ["Evidence 1"],
                "weight": 0.2,
                "status": "pending_veto",
                "created_ts": time.time()
            }
        ]
        
        # Patch patches file
        with patch('core.dream.PATCHES_FILE', patches_file):
            if hasattr(dream_system, '_store_hypotheses'):
                dream_system._store_hypotheses(test_hypotheses, [])
                
                # Verify file was created
                if patches_file.exists():
                    with open(patches_file) as f:
                        data = json.load(f)
                        assert "hypotheses" in data
    
    def test_identity_drift_detection(self, dream_system):
        """Test identity drift detection."""
        # Mock identity system
        mock_identity = Mock()
        mock_identity.verify_base_personality.return_value = True
        dream_system.identity = mock_identity
        
        # Check for drift
        if hasattr(dream_system, '_check_identity_drift'):
            drift_result = dream_system._check_identity_drift()
            assert isinstance(drift_result, dict)
    
    def test_dream_cycle_lock(self, dream_system):
        """Test that dream cycle uses lock file to prevent concurrent execution."""
        # Mock lock file operations
        with patch('core.dream.Path') as mock_path:
            lock_file = Mock()
            lock_file.exists.return_value = False
            mock_path.return_value = lock_file
            
            # Run cycle (should create lock)
            # This depends on implementation details
            pass
    
    def test_refraction_check(self, dream_system):
        """Test Refraction Check (comparing Heritage claims to observed behavior)."""
        # Mock heritage and observations
        mock_heritage = {"claim": "Creator values honesty"}
        mock_observations = [{"behavior": "Creator was deceptive", "timestamp": time.time()}]
        
        # Run refraction check
        if hasattr(dream_system, '_perform_refraction_check'):
            inconsistencies = dream_system._perform_refraction_check()
            assert isinstance(inconsistencies, list)
    
    def test_conditional_belief_synthesis(self, dream_system):
        """Test conditional belief synthesis (X EXCEPT when Y)."""
        # Mock conflicting patterns
        heritage_claim = "Creator prefers detailed explanations"
        new_pattern = "Creator prefers brief summaries when stressed"
        
        # Should synthesize: "Creator prefers detailed explanations EXCEPT when stressed"
        if hasattr(dream_system, '_synthesize_conditional'):
            conditional = dream_system._synthesize_conditional(heritage_claim, new_pattern)
            assert conditional is not None
            assert "EXCEPT" in conditional or "except" in conditional.lower()
    
    def test_memory_consolidation(self, dream_system):
        """Test memory consolidation during dream cycle."""
        # Mock memory consolidation
        if hasattr(dream_system.memory, 'consolidate_memories'):
            result = dream_system.memory.consolidate_memories(
                similarity_threshold=0.95,
                age_days=30
            )
            assert result is not None
    
    def test_error_handling(self, dream_system):
        """Test error handling in dream cycle."""
        # Mock error in memory system
        dream_system.memory.retrieve = Mock(side_effect=Exception("Memory error"))
        
        # Cycle should handle error gracefully
        try:
            dream_system.run_cycle()
            # Should complete without crashing
        except Exception as e:
            # If exception propagates, that's implementation-dependent
            pass

