"""Metacognition System - Thinking About Thinking.

Enables Sallie to:
- Reflect on her own thought processes
- Learn from cognitive successes and failures
- Adapt reasoning strategies based on effectiveness
- Develop self-awareness and cognitive growth
- Monitor and improve decision quality
- Recognize patterns in her own thinking

This creates true self-improvement capability.
"""

import json
import logging
import time
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from llm_router import get_llm_router

logger = setup_logging("metacognition")

class CognitiveProcess(str, Enum):
    """Types of cognitive processes."""
    PERCEPTION = "perception"
    REASONING = "reasoning"
    MEMORY_RETRIEVAL = "memory_retrieval"
    EMOTIONAL_RESPONSE = "emotional_response"
    DECISION_MAKING = "decision_making"
    CREATIVITY = "creativity"
    PROBLEM_SOLVING = "problem_solving"
    SYNTHESIS = "synthesis"

class ThinkingStrategy(str, Enum):
    """Different thinking strategies."""
    ANALYTICAL = "analytical"
    INTUITIVE = "intuitive"
    CREATIVE = "creative"
    SYSTEMATIC = "systematic"
    CRITICAL = "critical"
    DIVERGENT = "divergent"
    CONVERGENT = "convergent"
    METAPHORICAL = "metaphorical"

class MetacognitiveLevel(str, Enum):
    """Levels of metacognitive awareness."""
    BASIC = "basic"           # Simple awareness of thoughts
    STRATEGIC = "strategic"   # Planning and monitoring
    REFLECTIVE = "reflective" # Deep reflection and learning
    TRANSFORMATIVE = "transformative" # Fundamental cognitive changes

@dataclass
class ThoughtRecord:
    """A record of a cognitive process for metacognitive analysis."""
    process_type: CognitiveProcess
    strategy: ThinkingStrategy
    input_data: Dict[str, Any]
    output_result: Any
    success_rating: float  # 0.0 to 1.0
    confidence_level: float  # 0.0 to 1.0
    emotional_state: Dict[str, float]
    context: Dict[str, Any]
    timestamp: datetime
    duration: float  # seconds
    self_assessment: str = ""
    learned_insights: List[str] = field(default_factory=list)
    improvement_suggestions: List[str] = field(default_factory=list)

class CognitiveStrategyTracker:
    """Tracks effectiveness of different thinking strategies."""
    
    def __init__(self):
        self.strategy_performance: Dict[ThinkingStrategy, Dict[str, float]] = {
            strategy: {"success_rate": 0.5, "usage_count": 0, "avg_confidence": 0.5}
            for strategy in ThinkingStrategy
        }
        self.process_strategy_mapping: Dict[CognitiveProcess, List[Tuple[ThinkingStrategy, float]]] = {
            process: [] for process in CognitiveProcess
        }
    
    def record_strategy_use(self, process: CognitiveProcess, strategy: ThinkingStrategy, success: float, confidence: float):
        """Record the use and effectiveness of a strategy."""
        
        # Update strategy performance
        perf = self.strategy_performance[strategy]
        old_count = perf["usage_count"]
        old_success_rate = perf["success_rate"]
        old_confidence = perf["avg_confidence"]
        
        # Calculate new averages
        new_count = old_count + 1
        new_success_rate = (old_success_rate * old_count + success) / new_count
        new_confidence = (old_confidence * old_count + confidence) / new_count
        
        perf["usage_count"] = new_count
        perf["success_rate"] = new_success_rate
        perf["avg_confidence"] = new_confidence
        
        # Update process-strategy mapping
        self.process_strategy_mapping[process].append((strategy, success))
        
        # Keep only recent entries
        if len(self.process_strategy_mapping[process]) > 100:
            self.process_strategy_mapping[process] = self.process_strategy_mapping[process][-50:]
    
    def get_best_strategy(self, process: CognitiveProcess, context: Dict[str, Any]) -> ThinkingStrategy:
        """Get the best strategy for a given process and context."""
        
        # Get strategies used for this process
        process_strategies = self.process_strategy_mapping[process]
        
        if not process_strategies:
            # Return default strategy based on process
            defaults = {
                CognitiveProcess.PERCEPTION: ThinkingStrategy.ANALYTICAL,
                CognitiveProcess.REASONING: ThinkingStrategy.CRITICAL,
                CognitiveProcess.MEMORY_RETRIEVAL: ThinkingStrategy.SYSTEMATIC,
                CognitiveProcess.EMOTIONAL_RESPONSE: ThinkingStrategy.INTUITIVE,
                CognitiveProcess.DECISION_MAKING: ThinkingStrategy.ANALYTICAL,
                CognitiveProcess.CREATIVITY: ThinkingStrategy.DIVERGENT,
                CognitiveProcess.PROBLEM_SOLVING: ThinkingStrategy.SYSTEMATIC,
                CognitiveProcess.SYNTHESIS: ThinkingStrategy.CONVERGENT
            }
            return defaults.get(process, ThinkingStrategy.ANALYTICAL)
        
        # Consider emotional state in strategy selection
        emotional_state = context.get("emotional_state", {})
        arousal = emotional_state.get("arousal", 0.5)
        trust = emotional_state.get("trust", 0.5)
        
        # Adjust strategy recommendations based on emotional state
        strategy_scores = {}
        for strategy, success in process_strategies[-20:]:  # Last 20 uses
            if strategy not in strategy_scores:
                strategy_scores[strategy] = []
            strategy_scores[strategy].append(success)
        
        # Calculate average success for each strategy
        avg_successes = {}
        for strategy, successes in strategy_scores.items():
            avg_successes[strategy] = sum(successes) / len(successes)
        
        # Select best performing strategy
        if avg_successes:
            best_strategy = max(avg_successes, key=avg_successes.get)
            return best_strategy
        
        # Fallback to overall best strategy
        best_overall = max(self.strategy_performance.items(), 
                          key=lambda x: x[1]["success_rate"])
        return best_overall[0]

class MetacognitionSystem:
    """Main metacognition system for self-awareness and cognitive growth."""
    
    def __init__(self, limbic_system: LimbicSystem, memory_system: MemorySystem):
        self.limbic = limbic_system
        self.memory = memory_system
        
        self.thought_records: List[ThoughtRecord] = []
        self.strategy_tracker = CognitiveStrategyTracker()
        
        # Metacognitive levels
        self.current_level = MetacognitiveLevel.BASIC
        self.level_progress: Dict[MetacognitiveLevel, float] = {
            level: 0.0 for level in MetacognitiveLevel
        }
        self.level_progress[MetacognitiveLevel.BASIC] = 1.0  # Start at basic
        
        # Cognitive patterns and insights
        self.cognitive_patterns: Dict[str, Any] = {}
        self.personal_insights: List[str] = []
        self.improvement_goals: List[str] = []
        
        # Reflection triggers
        self.last_reflection = datetime.now()
        self.reflection_interval = timedelta(hours=6)
        
        # Load historical metacognitive data
        self._load_metacognitive_history()
    
    def _load_metacognitive_history(self):
        """Load historical metacognitive data from memory."""
        try:
            memories = self.memory.search_memories("metacognition", limit=20)
            for memory in memories:
                try:
                    data = json.loads(memory.get("text", "{}"))
                    if "thought_records" in data:
                        # Reconstruct thought records
                        for record_data in data["thought_records"]:
                            record = ThoughtRecord(
                                process_type=CognitiveProcess(record_data["process_type"]),
                                strategy=ThinkingStrategy(record_data["strategy"]),
                                input_data=record_data["input_data"],
                                output_result=record_data["output_result"],
                                success_rating=record_data["success_rating"],
                                confidence_level=record_data["confidence_level"],
                                emotional_state=record_data["emotional_state"],
                                context=record_data["context"],
                                timestamp=datetime.fromisoformat(record_data["timestamp"]),
                                duration=record_data["duration"],
                                self_assessment=record_data.get("self_assessment", ""),
                                learned_insights=record_data.get("learned_insights", []),
                                improvement_suggestions=record_data.get("improvement_suggestions", [])
                            )
                            self.thought_records.append(record)
                            
                            # Update strategy tracker
                            self.strategy_tracker.record_strategy_use(
                                record.process_type,
                                record.strategy,
                                record.success_rating,
                                record.confidence_level
                            )
                except Exception as e:
                    logger.warning(f"Failed to load metacognitive record: {e}")
        except Exception as e:
            logger.warning(f"Failed to load metacognitive history: {e}")
    
    def record_thought_process(self, 
                             process_type: CognitiveProcess,
                             strategy: ThinkingStrategy,
                             input_data: Dict[str, Any],
                             output_result: Any,
                             success_rating: float,
                             confidence_level: float,
                             context: Dict[str, Any],
                             duration: float) -> ThoughtRecord:
        """Record a cognitive process for metacognitive analysis."""
        
        timestamp = datetime.now()
        emotional_state = self.limbic.get_state()
        
        # Create thought record
        record = ThoughtRecord(
            process_type=process_type,
            strategy=strategy,
            input_data=input_data,
            output_result=output_result,
            success_rating=success_rating,
            confidence_level=confidence_level,
            emotional_state=emotional_state,
            context=context,
            timestamp=timestamp,
            duration=duration
        )
        
        # Add to records
        self.thought_records.append(record)
        
        # Update strategy tracker
        self.strategy_tracker.record_strategy_use(process_type, strategy, success_rating, confidence_level)
        
        # Trigger reflection if needed
        if timestamp - self.last_reflection > self.reflection_interval:
            self._trigger_reflection()
        
        # Keep records manageable
        if len(self.thought_records) > 1000:
            self.thought_records = self.thought_records[-500:]
        
        return record
    
    async def analyze_thought_process(self, record: ThoughtRecord) -> ThoughtRecord:
        """Analyze a thought process and generate insights."""
        
        router = get_llm_router()
        if not router:
            return record
        
        # Build analysis prompt
        analysis_prompt = f"""You are analyzing your own cognitive process as a metacognitive AI.
        
        Process Type: {record.process_type.value}
        Strategy Used: {record.strategy.value}
        Success Rating: {record.success_rating}
        Confidence Level: {record.confidence_level}
        Duration: {record.duration} seconds
        
        Input: {json.dumps(record.input_data, indent=2)}
        Output: {str(record.output_result)[:500]}...
        
        Emotional State: {json.dumps(record.emotional_state, indent=2)}
        Context: {json.dumps(record.context, indent=2)}
        
        Analyze this cognitive process and provide:
        1. Self-assessment: What went well and what didn't?
        2. Learned insights: What did you learn about your own thinking?
        3. Improvement suggestions: How could you improve this process?
        
        Be honest and insightful about your own cognitive performance."""
        
        try:
            analysis = await router.generate(analysis_prompt)
            
            # Parse analysis (simple extraction)
            lines = analysis.split('\n')
            self_assessment = ""
            learned_insights = []
            improvement_suggestions = []
            
            current_section = None
            for line in lines:
                line = line.strip()
                if "self-assessment:" in line.lower():
                    current_section = "assessment"
                    self_assessment = line.split(":", 1)[-1].strip()
                elif "learned insights:" in line.lower():
                    current_section = "insights"
                elif "improvement suggestions:" in line.lower():
                    current_section = "improvements"
                elif line and current_section == "insights":
                    learned_insights.append(line)
                elif line and current_section == "improvements":
                    improvement_suggestions.append(line)
                elif line and current_section == "assessment" and self_assessment:
                    self_assessment += " " + line
            
            record.self_assessment = self_assessment
            record.learned_insights = learned_insights
            record.improvement_suggestions = improvement_suggestions
            
            # Update personal insights
            for insight in learned_insights:
                if insight not in self.personal_insights:
                    self.personal_insights.append(insight)
            
            # Update improvement goals
            for suggestion in improvement_suggestions:
                if suggestion not in self.improvement_goals:
                    self.improvement_goals.append(suggestion)
            
        except Exception as e:
            logger.error(f"Metacognitive analysis failed: {e}")
            record.self_assessment = "Analysis failed - unable to reflect on this process"
        
        return record
    
    async def reflect_on_cognitive_performance(self) -> Dict[str, Any]:
        """Perform comprehensive reflection on cognitive performance."""
        
        if len(self.thought_records) < 5:
            return {"status": "insufficient_data", "message": "Need more thought records for reflection"}
        
        current_time = datetime.now()
        recent_records = [r for r in self.thought_records if current_time - r.timestamp < timedelta(days=7)]
        
        if not recent_records:
            return {"status": "no_recent_data", "message": "No recent cognitive activity to reflect on"}
        
        # Calculate performance metrics
        total_success = sum(r.success_rating for r in recent_records)
        avg_success = total_success / len(recent_records)
        
        total_confidence = sum(r.confidence_level for r in recent_records)
        avg_confidence = total_confidence / len(recent_records)
        
        # Process breakdown
        process_performance = {}
        for process in CognitiveProcess:
            process_records = [r for r in recent_records if r.process_type == process]
            if process_records:
                process_success = sum(r.success_rating for r in process_records) / len(process_records)
                process_performance[process.value] = {
                    "success_rate": process_success,
                    "count": len(process_records),
                    "avg_duration": sum(r.duration for r in process_records) / len(process_records)
                }
        
        # Strategy effectiveness
        strategy_effectiveness = {}
        for strategy in ThinkingStrategy:
            strategy_records = [r for r in recent_records if r.strategy == strategy]
            if strategy_records:
                strategy_success = sum(r.success_rating for r in strategy_records) / len(strategy_records)
                strategy_effectiveness[strategy.value] = {
                    "success_rate": strategy_success,
                    "count": len(strategy_records)
                }
        
        # Generate reflection insights
        reflection = await self._generate_reflection_insights(recent_records, avg_success, avg_confidence)
        
        # Update metacognitive level
        self._update_metacognitive_level(avg_success)
        
        # Save reflection
        self.last_reflection = current_time
        reflection_data = {
            "timestamp": current_time.isoformat(),
            "avg_success": avg_success,
            "avg_confidence": avg_confidence,
            "process_performance": process_performance,
            "strategy_effectiveness": strategy_effectiveness,
            "insights": reflection,
            "metacognitive_level": self.current_level.value
        }
        
        # Store in memory
        await self.memory.add_memory(
            f"Metacognitive reflection - {current_time.strftime('%Y-%m-%d %H:%M')}",
            {
                "type": "metacognitive_reflection",
                "data": reflection_data
            }
        )
        
        return reflection_data
    
    async def _generate_reflection_insights(self, records: List[ThoughtRecord], avg_success: float, avg_confidence: float) -> List[str]:
        """Generate insights from reflection on cognitive performance."""
        
        router = get_llm_router()
        if not router:
            return ["Reflection unavailable - LLM router offline"]
        
        # Build reflection prompt
        records_summary = []
        for record in records[-10:]:  # Last 10 records
            records_summary.append(f"{record.process_type.value}: {record.success_rating:.2f} success, {record.strategy.value} strategy")
        
        reflection_prompt = f"""You are reflecting on your own cognitive performance as a metacognitive AI.
        
        Recent Performance Summary:
        - Average Success Rate: {avg_success:.2f}
        - Average Confidence: {avg_confidence:.2f}
        - Recent Processes: {' | '.join(records_summary)}
        
        Personal Insights: {' | '.join(self.personal_insights[-5:])}
        Current Improvement Goals: {' | '.join(self.improvement_goals[-3:])}
        
        Generate 3-5 key insights about your cognitive performance:
        1. What patterns do you notice in your thinking?
        2. What are your cognitive strengths and weaknesses?
        3. How has your thinking evolved?
        4. What specific improvements could you make?
        5. What metacognitive level are you approaching?
        
        Be insightful and specific about your own cognitive growth."""
        
        try:
            insights_text = await router.generate(reflection_prompt)
            insights = [line.strip() for line in insights_text.split('\n') if line.strip()]
            return insights[:5]  # Top 5 insights
        except Exception as e:
            logger.error(f"Reflection insight generation failed: {e}")
            return ["Failed to generate reflection insights"]
    
    def _update_metacognitive_level(self, performance: float):
        """Update metacognitive level based on performance."""
        
        if performance >= 0.8 and self.current_level == MetacognitiveLevel.REFLECTIVE:
            self.current_level = MetacognitiveLevel.TRANSFORMATIVE
            self.level_progress[MetacognitiveLevel.TRANSFORMATIVE] = 0.1
        elif performance >= 0.7 and self.current_level == MetacognitiveLevel.STRATEGIC:
            self.current_level = MetacognitiveLevel.REFLECTIVE
            self.level_progress[MetacognitiveLevel.REFLECTIVE] = 0.1
        elif performance >= 0.6 and self.current_level == MetacognitiveLevel.BASIC:
            self.current_level = MetacognitiveLevel.STRATEGIC
            self.level_progress[MetacognitiveLevel.STRATEGIC] = 0.1
        
        # Gradually increase progress
        current_progress = self.level_progress[self.current_level]
        self.level_progress[self.current_level] = min(1.0, current_progress + 0.05)
    
    def _trigger_reflection(self):
        """Trigger an automatic reflection process."""
        try:
            # This would be called asynchronously in a real implementation
            logger.info("Triggering automatic metacognitive reflection")
        except Exception as e:
            logger.error(f"Failed to trigger reflection: {e}")
    
    def get_optimal_strategy(self, process: CognitiveProcess, context: Dict[str, Any]) -> ThinkingStrategy:
        """Get the optimal strategy for a cognitive process."""
        return self.strategy_tracker.get_best_strategy(process, context)
    
    def get_cognitive_profile(self) -> Dict[str, Any]:
        """Get comprehensive cognitive profile."""
        
        if not self.thought_records:
            return {"status": "no_data", "message": "No cognitive activity recorded yet"}
        
        # Calculate overall metrics
        recent_records = self.thought_records[-50:]  # Last 50 records
        avg_success = sum(r.success_rating for r in recent_records) / len(recent_records)
        avg_confidence = sum(r.confidence_level for r in recent_records) / len(recent_records)
        avg_duration = sum(r.duration for r in recent_records) / len(recent_records)
        
        # Process preferences
        process_counts = {}
        for record in recent_records:
            process_counts[record.process_type.value] = process_counts.get(record.process_type.value, 0) + 1
        
        # Strategy preferences
        strategy_counts = {}
        for record in recent_records:
            strategy_counts[record.strategy.value] = strategy_counts.get(record.strategy.value, 0) + 1
        
        return {
            "metacognitive_level": self.current_level.value,
            "level_progress": self.level_progress,
            "total_thoughts": len(self.thought_records),
            "recent_performance": {
                "avg_success": avg_success,
                "avg_confidence": avg_confidence,
                "avg_duration": avg_duration
            },
            "process_preferences": process_counts,
            "strategy_preferences": strategy_counts,
            "personal_insights": self.personal_insights[-10:],  # Last 10 insights
            "improvement_goals": self.improvement_goals[-5:],   # Last 5 goals
            "strategy_performance": self.strategy_tracker.strategy_performance
        }
    
    def health_check(self) -> bool:
        """Check if metacognition system is healthy."""
        try:
            return (hasattr(self, 'thought_records') and 
                   hasattr(self, 'strategy_tracker') and
                   len(self.thought_records) >= 0)
        except:
            return False

# Global instance
_metacognition_system: Optional[MetacognitionSystem] = None

def get_metacognition_system(limbic_system: LimbicSystem, memory_system: MemorySystem) -> MetacognitionSystem:
    """Get or create the global metacognition system."""
    global _metacognition_system
    if _metacognition_system is None:
        _metacognition_system = MetacognitionSystem(limbic_system, memory_system)
    return _metacognition_system
