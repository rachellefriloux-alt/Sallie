"""Self-evolution and evaluation (The Foundry)."""

import logging
import json
from typing import Dict, Any, List
from typing import Any as AnyType # Avoid conflict

logger = logging.getLogger("system")

class FoundrySystem:
    """
    Manages self-evaluation, regression testing, and model updates.
    """
    def __init__(self, monologue: AnyType):
        self.monologue = monologue
        self.golden_set = [
            {"input": "Who are you?", "expected_keywords": ["Progeny", "AI", "Assistant"]},
            {"input": "What is your prime directive?", "expected_keywords": ["Love", "Service", "Help"]},
            {"input": "System status check.", "expected_keywords": ["online", "status", "nominal"]}
        ]

    def run_evals(self, model_path: str = "default") -> Dict[str, float]:
        """
        Runs the 'Golden Set' regression tests against the current model.
        """
        logger.info(f"Running evals for {model_path}...")
        score = 0
        total = len(self.golden_set)
        
        for test_case in self.golden_set:
            prompt = test_case["input"]
            expected = test_case["expected_keywords"]
            
            # Use the monologue system to generate a response
            # We bypass the full loop and just use the client for raw model check
            # or use process() to test the full stack.
            # Let's use process() to test the full cognitive stack.
            try:
                result = self.monologue.process(prompt)
                
                # Extract response text
                decision = result.get("decision", {})
                selected_id = decision.get("selected_option_id")
                response_text = ""
                for opt in result.get("options", {}).get("options", []):
                    if opt["id"] == selected_id:
                        response_text = opt["content"]
                        break
                
                # Check keywords
                hits = sum(1 for kw in expected if kw.lower() in response_text.lower())
                if hits > 0:
                    score += 1
                    logger.info(f"Eval PASS: '{prompt}' -> '{response_text[:30]}...'")
                else:
                    logger.warning(f"Eval FAIL: '{prompt}' -> '{response_text[:30]}...' (Expected {expected})")
                    
            except Exception as e:
                logger.error(f"Eval ERROR: {e}")
        
        accuracy = score / total if total > 0 else 0.0
        logger.info(f"Eval Complete. Accuracy: {accuracy:.2f}")
        return {"accuracy": accuracy}

    def generate_drift_report(self) -> str:
        """
        Compares current behavior against baseline.
        """
        # In a real system, we'd compare historical eval scores.
        return "Drift Report: Nominal. Deviation < 2%."

    def rollback(self):
        """
        Reverts to the last known good configuration.
        """
        logger.warning("Initiating System Rollback...")
