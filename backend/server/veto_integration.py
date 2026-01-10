# Active Veto System Integration for Sallie Server
# Adds hypothesis review and management endpoints

import asyncio
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from active_veto_system import ActiveVetoSystem, DreamHypothesis, HypothesisStatus, HypothesisType

class ActiveVetoManager:
    """Manages the Active Veto System integration with the main server."""
    
    def __init__(self, brain_instance=None):
        self.brain = brain_instance
        self.veto_system: Optional[ActiveVetoSystem] = None
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize the Active Veto System."""
        try:
            self.veto_system = ActiveVetoSystem(self.brain)
            self.is_initialized = True
            logging.info("Active Veto System Manager initialized successfully")
            
        except Exception as e:
            logging.error(f"Failed to initialize Active Veto System Manager: {e}")
            raise
    
    def add_hypothesis(self, pattern: str, evidence: List[str], confidence: float, 
                      category: str = "behavioral_pattern") -> bool:
        """Add a new hypothesis to the review queue."""
        if not self.veto_system or not self.is_initialized:
            return False
        
        try:
            # Convert category string to enum
            category_map = {
                "behavioral_pattern": HypothesisType.BEHAVIORAL_PATTERN,
                "communication_style": HypothesisType.COMMUNICATION_STYLE,
                "preference_change": HypothesisType.PREFERENCE_CHANGE,
                "emotional_response": HypothesisType.EMOTIONAL_RESPONSE,
                "cognitive_bias": HypothesisType.COGNITIVE_BIAS,
                "relationship_dynamic": HypothesisType.RELATIONSHIP_DYNAMIC,
                "workflow_pattern": HypothesisType.WORKFLOW_PATTERN,
                "decision_making": HypothesisType.DECISION_MAKING
            }
            
            hypothesis_type = category_map.get(category, HypothesisType.BEHAVIORAL_PATTERN)
            
            hypothesis = DreamHypothesis(
                id=f"hyp_{int(asyncio.get_event_loop().time())}_{len(self.veto_system.pending_hypotheses)}",
                pattern=pattern,
                evidence=evidence,
                confidence=confidence,
                category=hypothesis_type
            )
            
            return self.veto_system.add_hypothesis(hypothesis)
            
        except Exception as e:
            logging.error(f"Failed to add hypothesis: {e}")
            return False
    
    def start_review_session(self) -> Dict[str, Any]:
        """Start a new hypothesis review session."""
        if not self.veto_system or not self.is_initialized:
            return {"error": "Active Veto System not initialized"}
        
        try:
            session = self.veto_system.start_review_session()
            
            return {
                "session_id": session.id,
                "hypotheses_count": len(session.hypotheses),
                "hypotheses": [
                    {
                        "id": h.id,
                        "pattern": h.pattern,
                        "evidence": h.evidence,
                        "confidence": h.confidence,
                        "category": h.category.value,
                        "created": h.created
                    }
                    for h in session.hypotheses
                ]
            }
            
        except Exception as e:
            logging.error(f"Failed to start review session: {e}")
            return {"error": str(e)}
    
    def confirm_hypothesis(self, hypothesis_id: str, creator_context: Optional[str] = None) -> Dict[str, Any]:
        """Confirm a hypothesis in the current session."""
        if not self.veto_system or not self.is_initialized:
            return {"error": "Active Veto System not initialized"}
        
        try:
            success = self.veto_system.confirm_hypothesis(hypothesis_id, creator_context)
            
            if success:
                hypothesis = self.veto_system.get_hypothesis_details(hypothesis_id)
                return {
                    "success": True,
                    "hypothesis_id": hypothesis_id,
                    "status": "confirmed",
                    "impact_score": hypothesis.impact_score if hypothesis else 0.0
                }
            else:
                return {"success": False, "error": "Failed to confirm hypothesis"}
                
        except Exception as e:
            logging.error(f"Failed to confirm hypothesis: {e}")
            return {"success": False, "error": str(e)}
    
    def deny_hypothesis(self, hypothesis_id: str, creator_context: Optional[str] = None) -> Dict[str, Any]:
        """Deny a hypothesis in the current session."""
        if not self.veto_system or not self.is_initialized:
            return {"error": "Active Veto System not initialized"}
        
        try:
            success = self.veto_system.deny_hypothesis(hypothesis_id, creator_context)
            
            if success:
                hypothesis = self.veto_system.get_hypothesis_details(hypothesis_id)
                return {
                    "success": True,
                    "hypothesis_id": hypothesis_id,
                    "status": "denied",
                    "impact_score": hypothesis.impact_score if hypothesis else 0.0
                }
            else:
                return {"success": False, "error": "Failed to deny hypothesis"}
                
        except Exception as e:
            logging.error(f"Failed to deny hypothesis: {e}")
            return {"success": False, "error": str(e)}
    
    def add_context_to_hypothesis(self, hypothesis_id: str, context: str) -> Dict[str, Any]:
        """Add context to a hypothesis (create conditional branch)."""
        if not self.veto_system or not self.is_initialized:
            return {"error": "Active Veto System not initialized"}
        
        try:
            success = self.veto_system.add_context_to_hypothesis(hypothesis_id, context)
            
            if success:
                hypothesis = self.veto_system.get_hypothesis_details(hypothesis_id)
                return {
                    "success": True,
                    "hypothesis_id": hypothesis_id,
                    "status": "conditional",
                    "context": context,
                    "impact_score": hypothesis.impact_score if hypothesis else 0.0
                }
            else:
                return {"success": False, "error": "Failed to add context to hypothesis"}
                
        except Exception as e:
            logging.error(f"Failed to add context to hypothesis: {e}")
            return {"success": False, "error": str(e)}
    
    def complete_session(self) -> Dict[str, Any]:
        """Complete the current review session."""
        if not self.veto_system or not self.is_initialized:
            return {"error": "Active Veto System not initialized"}
        
        try:
            summary = self.veto_system.complete_session()
            return summary
            
        except Exception as e:
            logging.error(f"Failed to complete session: {e}")
            return {"error": str(e)}
    
    def get_session_status(self) -> Dict[str, Any]:
        """Get current session status."""
        if not self.veto_system or not self.is_initialized:
            return {"error": "Active Veto System not initialized"}
        
        try:
            return self.veto_system.get_session_status()
            
        except Exception as e:
            logging.error(f"Failed to get session status: {e}")
            return {"error": str(e)}
    
    def get_pending_hypotheses(self, limit: int = 10) -> Dict[str, Any]:
        """Get pending hypotheses for review."""
        if not self.veto_system or not self.is_initialized:
            return {"error": "Active Veto System not initialized"}
        
        try:
            hypotheses = self.veto_system.get_pending_hypotheses(limit)
            
            return {
                "pending_hypotheses": [
                    {
                        "id": h.id,
                        "pattern": h.pattern,
                        "evidence": h.evidence,
                        "confidence": h.confidence,
                        "category": h.category.value,
                        "created": h.created,
                        "status": h.status.value
                    }
                    for h in hypotheses
                ],
                "count": len(hypotheses)
            }
            
        except Exception as e:
            logging.error(f"Failed to get pending hypotheses: {e}")
            return {"error": str(e)}
    
    def get_hypothesis_details(self, hypothesis_id: str) -> Dict[str, Any]:
        """Get detailed information about a specific hypothesis."""
        if not self.veto_system or not self.is_initialized:
            return {"error": "Active Veto System not initialized"}
        
        try:
            hypothesis = self.veto_system.get_hypothesis_details(hypothesis_id)
            
            if hypothesis:
                return {
                    "id": hypothesis.id,
                    "pattern": hypothesis.pattern,
                    "evidence": hypothesis.evidence,
                    "confidence": hypothesis.confidence,
                    "category": hypothesis.category.value,
                    "status": hypothesis.status.value,
                    "created": hypothesis.created,
                    "reviewed_at": hypothesis.reviewed_at,
                    "creator_response": hypothesis.creator_response,
                    "conditional_context": hypothesis.conditional_context,
                    "impact_score": hypothesis.impact_score
                }
            else:
                return {"error": "Hypothesis not found"}
                
        except Exception as e:
            logging.error(f"Failed to get hypothesis details: {e}")
            return {"error": str(e)}
    
    def get_review_statistics(self) -> Dict[str, Any]:
        """Get comprehensive review statistics."""
        if not self.veto_system or not self.is_initialized:
            return {"error": "Active Veto System not initialized"}
        
        try:
            return self.veto_system.get_review_statistics()
            
        except Exception as e:
            logging.error(f"Failed to get review statistics: {e}")
            return {"error": str(e)}
    
    def auto_generate_hypothesis(self, interaction_data: Dict[str, Any]) -> bool:
        """Automatically generate hypotheses from interaction data."""
        if not self.veto_system or not self.is_initialized:
            return False
        
        try:
            # Extract patterns from interaction data
            patterns = self._extract_patterns(interaction_data)
            
            for pattern in patterns:
                self.add_hypothesis(
                    pattern=pattern["pattern"],
                    evidence=pattern["evidence"],
                    confidence=pattern["confidence"],
                    category=pattern["category"]
                )
            
            return True
            
        except Exception as e:
            logging.error(f"Failed to auto-generate hypotheses: {e}")
            return False
    
    def _extract_patterns(self, interaction_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract patterns from interaction data for hypothesis generation."""
        patterns = []
        
        try:
            # Extract behavioral patterns
            if "behavior" in interaction_data:
                behavior = interaction_data["behavior"]
                if "repeated_actions" in behavior:
                    for action in behavior["repeated_actions"]:
                        if action["frequency"] > 0.7:  # High frequency
                            patterns.append({
                                "pattern": f"User frequently performs: {action['action']}",
                                "evidence": [f"Frequency: {action['frequency']}", f"Context: {action['context']}"],
                                "confidence": action["frequency"],
                                "category": "behavioral_pattern"
                            })
            
            # Extract communication patterns
            if "communication" in interaction_data:
                comm = interaction_data["communication"]
                if "tone_changes" in comm:
                    for tone in comm["tone_changes"]:
                        if tone["consistency"] > 0.6:
                            patterns.append({
                                "pattern": f"User's communication tone shifts to {tone['tone']} in {tone['context']}",
                                "evidence": [f"Consistency: {tone['consistency']}", f"Triggers: {tone['triggers']}"],
                                "confidence": tone["consistency"],
                                "category": "communication_style"
                            })
            
            # Extract preference changes
            if "preferences" in interaction_data:
                prefs = interaction_data["preferences"]
                if "recent_changes" in prefs:
                    for change in prefs["recent_changes"]:
                        if change["significance"] > 0.5:
                            patterns.append({
                                "pattern": f"User's preference for {change['preference']} has changed to {change['new_value']}",
                                "evidence": [f"Previous value: {change['old_value']}", f"Significance: {change['significance']}"],
                                "confidence": change["significance"],
                                "category": "preference_change"
                            })
            
        except Exception as e:
            logging.error(f"Error extracting patterns: {e}")
        
        return patterns
    
    async def run(self):
        """Run the Active Veto System."""
        try:
            # The Active Veto System is primarily event-driven
            # It doesn't need a continuous run loop
            while True:
                await asyncio.sleep(60)  # Check every minute
                
                # Auto-generate hypotheses from recent interactions
                if self.brain and hasattr(self.brain, 'get_recent_interactions'):
                    recent_interactions = self.brain.get_recent_interactions()
                    for interaction in recent_interactions:
                        self.auto_generate_hypothesis(interaction)
                
        except Exception as e:
            logging.error(f"Active Veto System runtime error: {e}")
    
    async def shutdown(self):
        """Gracefully shutdown the Active Veto System."""
        try:
            # Complete any active session
            if self.veto_system and self.veto_system.current_session:
                self.veto_system.complete_session()
            
            logging.info("Active Veto System shutdown complete")
            
        except Exception as e:
            logging.error(f"Failed to shutdown Active Veto System: {e}")

# Global instance
veto_manager: Optional[ActiveVetoManager] = None

async def initialize_active_veto_system(brain_instance=None):
    """Initialize the global Active Veto Manager."""
    global veto_manager
    try:
        veto_manager = ActiveVetoManager(brain_instance)
        await veto_manager.initialize()
        return veto_manager
    
    except Exception as e:
        logging.error(f"Failed to initialize Active Veto System: {e}")
        return None

def get_veto_manager() -> Optional[ActiveVetoManager]:
    """Get the global Active Veto Manager."""
    return veto_manager
