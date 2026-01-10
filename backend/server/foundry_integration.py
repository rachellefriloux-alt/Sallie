# Foundry Evaluation Integration for Sallie Server
# Adds training evaluation, drift reporting, and model management endpoints

import asyncio
import json
import logging
import time
from typing import Dict, Any, Optional, List
from datetime import datetime
from foundry_evaluation import FoundryEvaluationHarness, DriftReport, TestResult, TrainingSession

class FoundryManager:
    """Manages the Foundry Evaluation System integration with the main server."""
    
    def __init__(self, brain_instance=None):
        self.brain = brain_instance
        self.foundry: Optional[FoundryEvaluationHarness] = None
        self.is_initialized = False
        self.current_training_session: Optional[TrainingSession] = None
        
    async def initialize(self):
        """Initialize the Foundry Evaluation System."""
        try:
            self.foundry = FoundryEvaluationHarness(self.brain)
            self.is_initialized = True
            logging.info("Foundry Evaluation System initialized successfully")
            
        except Exception as e:
            logging.error(f"Failed to initialize Foundry Evaluation System: {e}")
            raise
    
    async def run_evaluation(self, model_id: str = "current") -> Dict[str, Any]:
        """Run a complete evaluation suite."""
        if not self.foundry or not self.is_initialized:
            return {"error": "Foundry Evaluation System not initialized"}
        
        try:
            results = await self.foundry.run_test_suite(model_id)
            overall_score = self.foundry.calculate_overall_score(results)
            
            # Categorize results
            passed = len([r for r in results if r.result == TestResult.PASS])
            failed = len([r for r in results if r.result == TestResult.FAIL])
            warnings = len([r for r in results if r.result == TestResult.WARNING])
            errors = len([r for r in results if r.result == TestResult.ERROR])
            skipped = len([r for r in results if r.result == TestResult.SKIPPED])
            
            # Get critical failures
            critical_failures = []
            for result in results:
                if result.result == TestResult.FAIL:
                    test_case = next((tc for tc in self.foundry.test_cases if tc.id == result.test_id), None)
                    if test_case and test_case.critical:
                        critical_failures.append({
                            "test_id": result.test_id,
                            "test_name": test_case.name,
                            "error": result.error_message,
                            "details": result.details
                        })
            
            return {
                "model_id": model_id,
                "timestamp": time.time(),
                "overall_score": overall_score,
                "total_tests": len(results),
                "passed": passed,
                "failed": failed,
                "warnings": warnings,
                "errors": errors,
                "skipped": skipped,
                "critical_failures": critical_failures,
                "results": [
                    {
                        "test_id": r.test_id,
                        "test_name": next((tc.name for tc in self.foundry.test_cases if tc.id == r.test_id), "Unknown"),
                        "category": next((tc.category.value for tc in self.foundry.test_cases if tc.id == r.test_id), "Unknown"),
                        "result": r.result.value,
                        "score": r.score,
                        "execution_time": r.execution_time,
                        "error_message": r.error_message,
                        "details": r.details
                    }
                    for r in results
                ]
            }
            
        except Exception as e:
            logging.error(f"Failed to run evaluation: {e}")
            return {"error": str(e)}
    
    async def start_training_session(self, model_type: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Start a new training session."""
        if not self.foundry or not self.is_initialized:
            return {"error": "Foundry Evaluation System not initialized"}
        
        try:
            # Create training session
            session_id = f"training_{int(time.time())}"
            training_data_hash = self._generate_data_hash(config.get("training_data", []))
            
            session = TrainingSession(
                id=session_id,
                model_type=model_type,
                training_data_hash=training_data_hash,
                start_time=time.time(),
                status="started",
                config=config
            )
            
            self.current_training_session = session
            self.foundry.training_sessions.append(session)
            
            return {
                "session_id": session_id,
                "model_type": model_type,
                "status": "started",
                "start_time": session.start_time,
                "training_data_hash": training_data_hash,
                "config": config
            }
            
        except Exception as e:
            logging.error(f"Failed to start training session: {e}")
            return {"error": str(e)}
    
    async def complete_training_session(self, session_id: str, model_path: str) -> Dict[str, Any]:
        """Complete a training session with evaluation."""
        if not self.foundry or not self.is_initialized:
            return {"error": "Foundry Evaluation System not initialized"}
        
        try:
            session = self.foundry.get_training_session(session_id)
            if not session:
                return {"error": "Training session not found"}
            
            # Run evaluation on new model
            evaluation = await self.run_evaluation(model_path)
            
            if "error" in evaluation:
                return {"error": f"Evaluation failed: {evaluation['error']}"}
            
            # Create drift report (compare with previous model)
            previous_results = await self.run_evaluation("current")
            if "error" not in previous_results:
                previous_test_results = [
                    self._create_test_execution(r) for r in previous_results["results"]
                ]
                current_test_results = [
                    self._create_test_execution(r) for r in evaluation["results"]
                ]
                
                drift_report = self.foundry.generate_drift_report(
                    previous_test_results, 
                    current_test_results,
                    "current",
                    model_path
                )
            else:
                # No previous model to compare with
                current_test_results = [
                    self._create_test_execution(r) for r in evaluation["results"]
                ]
                
                drift_report = DriftReport(
                    model_before="current",
                    model_after=model_path,
                    timestamp=time.time(),
                    test_results=current_test_results,
                    overall_score_before=0.0,
                    overall_score_after=evaluation["overall_score"],
                    score_delta=evaluation["overall_score"],
                    failed_tests=[r["test_id"] for r in evaluation["results"] if r["result"] == "fail"],
                    new_failures=[],
                    fixed_tests=[],
                    performance_changes={},
                    behavior_changes=[],
                    recommendations=["New model created - no previous comparison available"]
                )
            
            # Apply gating rules
            can_promote, reason = self.foundry.apply_gating_rules(drift_report)
            
            # Update session
            session.end_time = time.time()
            session.status = "completed"
            session.evaluation_results = drift_report
            session.promoted = can_promote
            
            # Save drift report
            self.foundry.save_drift_report(drift_report)
            
            return {
                "session_id": session_id,
                "status": "completed",
                "end_time": session.end_time,
                "duration": session.end_time - session.start_time,
                "evaluation": evaluation,
                "drift_report": {
                    "model_before": drift_report.model_before,
                    "model_after": drift_report.model_after,
                    "overall_score_before": drift_report.overall_score_before,
                    "overall_score_after": drift_report.overall_score_after,
                    "score_delta": drift_report.score_delta,
                    "failed_tests": len(drift_report.failed_tests),
                    "new_failures": len(drift_report.new_failures),
                    "fixed_tests": len(drift_report.fixed_tests),
                    "recommendations": drift_report.recommendations
                },
                "promotion": {
                    "can_promote": can_promote,
                    "reason": reason
                }
            }
            
        except Exception as e:
            logging.error(f"Failed to complete training session: {e}")
            return {"error": str(e)}
    
    def _create_test_execution(self, result: Dict[str, Any]) -> Any:
        """Create a TestExecution object from result dict."""
        # Import here to avoid circular imports
        from foundry_evaluation import TestExecution, TestResult
        
        return TestExecution(
            test_id=result["test_id"],
            result=TestResult(result["result"]),
            actual_output=None,  # Not stored in result dict
            execution_time=result.get("execution_time", 0.0),
            error_message=result.get("error_message"),
            score=result.get("score", 0.0),
            details=result.get("details", {})
        )
    
    def _generate_data_hash(self, data: Any) -> str:
        """Generate a hash for training data."""
        data_str = json.dumps(data, sort_keys=True)
        return hashlib.sha256(data_str.encode()).hexdigest()
    
    def get_training_sessions(self, limit: int = 10) -> Dict[str, Any]:
        """Get recent training sessions."""
        if not self.foundry or not self.is_initialized:
            return {"error": "Foundry Evaluation System not initialized"}
        
        try:
            sessions = self.foundry.training_sessions[-limit:] if self.foundry.training_sessions else []
            
            return {
                "sessions": [
                    {
                        "id": session.id,
                        "model_type": session.model_type,
                        "status": session.status,
                        "start_time": session.start_time,
                        "end_time": session.end_time,
                        "duration": (session.end_time or time.time()) - session.start_time if session.end_time else 0,
                        "promoted": session.promoted,
                        "rollback_available": session.rollback_available,
                        "has_evaluation": session.evaluation_results is not None
                    }
                    for session in sessions
                ],
                "count": len(sessions)
            }
            
        except Exception as e:
            logging.error(f"Failed to get training sessions: {e}")
            return {"error": str(e)}
    
    def get_drift_reports(self, limit: int = 10) -> Dict[str, Any]:
        """Get recent drift reports."""
        if not self.foundry or not self.is_initialized:
            return {"error": "Foundry Evaluation System not initialized"}
        
        try:
            reports = self.foundry.get_recent_reports(limit)
            
            return {
                "reports": [
                    {
                        "model_before": report.model_before,
                        "model_after": report.model_after,
                        "timestamp": report.timestamp,
                        "overall_score_before": report.overall_score_before,
                        "overall_score_after": report.overall_score_after,
                        "score_delta": report.score_delta,
                        "failed_tests": len(report.failed_tests),
                        "new_failures": len(report.new_failures),
                        "fixed_tests": len(report.fixed_tests),
                        "recommendations": report.recommendations
                    }
                    for report in reports
                ],
                "count": len(reports)
            }
            
        except Exception as e:
            logging.error(f"Failed to get drift reports: {e}")
            return {"error": str(e)}
    
    def get_drift_report_details(self, report_id: str) -> Dict[str, Any]:
        """Get detailed information about a specific drift report."""
        if not self.foundry or not self.is_initialized:
            return {"error": "Foundry Evaluation System not initialized"}
        
        try:
            # Find report by timestamp
            for report in self.foundry.test_history:
                if str(int(report.timestamp)) == report_id:
                    return {
                        "model_before": report.model_before,
                        "model_after": report.model_after,
                        "timestamp": report.timestamp,
                        "overall_score_before": report.overall_score_before,
                        "overall_score_after": report.overall_score_after,
                        "score_delta": report.score_delta,
                        "failed_tests": report.failed_tests,
                        "new_failures": report.new_failures,
                        "fixed_tests": report.fixed_tests,
                        "performance_changes": report.performance_changes,
                        "behavior_changes": report.behavior_changes,
                        "recommendations": report.recommendations,
                        "test_results": [
                            {
                                "test_id": r.test_id,
                                "result": r.result.value,
                                "score": r.score,
                                "execution_time": r.execution_time,
                                "error_message": r.error_message,
                                "details": r.details
                            }
                            for r in report.test_results
                        ]
                    }
            
            return {"error": "Drift report not found"}
            
        except Exception as e:
            logging.error(f"Failed to get drift report details: {e}")
            return {"error": str(e)}
    
    async def rollback_model(self, model_id: str) -> Dict[str, Any]:
        """Rollback to a previous model version."""
        if not self.foundry or not self.is_initialized:
            return {"error": "Foundry Evaluation System not initialized"}
        
        try:
            # Find the training session for this model
            session = None
            for s in self.foundry.training_sessions:
                if s.model_type == model_id and s.promoted and s.rollback_available:
                    session = s
                    break
            
            if not session:
                return {"error": f"No rollback available for model: {model_id}"}
            
            # In a real implementation, this would rollback the model files
            # For now, we'll just mark it as rolled back
            session.promoted = False
            
            return {
                "success": True,
                "model_id": model_id,
                "session_id": session.id,
                "message": f"Model {model_id} rolled back to previous version",
                "rollback_time": time.time()
            }
            
        except Exception as e:
            logging.error(f"Failed to rollback model: {e}")
            return {"error": str(e)}
    
    def get_evaluation_statistics(self) -> Dict[str, Any]:
        """Get comprehensive evaluation statistics."""
        if not self.foundry or not self.is_initialized:
            return {"error": "Foundry Evaluation System not initialized"}
        
        try:
            total_sessions = len(self.foundry.training_sessions)
            completed_sessions = len([s for s in self.foundry.training_sessions if s.status == "completed"])
            promoted_sessions = len([s for s in self.foundry.training_sessions if s.promoted])
            
            # Calculate average scores from drift reports
            if self.foundry.test_history:
                scores_before = [r.overall_score_before for r in self.foundry.test_history]
                scores_after = [r.overall_score_after for r in self.foundry.test_history]
                avg_score_before = sum(scores_before) / len(scores_before) if scores_before else 0.0
                avg_score_after = sum(scores_after) / len(scores_after) if scores_after else 0.0
                avg_improvement = (avg_score_after - avg_score_before) if avg_score_before > 0 else 0.0
            else:
                avg_score_before = 0.0
                avg_score_after = 0.0
                avg_improvement = 0.0
            
            return {
                "total_sessions": total_sessions,
                "completed_sessions": completed_sessions,
                "promoted_sessions": promoted_sessions,
                "promotion_rate": promoted_sessions / completed_sessions if completed_sessions > 0 else 0.0,
                "average_score_before": avg_score_before,
                "average_score_after": avg_score_after,
                "average_improvement": avg_improvement,
                "total_drift_reports": len(self.foundry.test_history),
                "test_suite_size": len(self.foundry.test_cases),
                "critical_tests": len([tc for tc in self.foundry.test_cases if tc.critical])
            }
            
        except Exception as e:
            logging.error(f"Failed to get evaluation statistics: {e}")
            return {"error": str(e)}
    
    async def run(self):
        """Run the Foundry Evaluation System."""
        try:
            # The Foundry Evaluation System is primarily event-driven
            # It doesn't need a continuous run loop
            while True:
                await asyncio.sleep(300)  # Check every 5 minutes
                
                # Auto-run evaluations if needed
                if self.current_training_session and self.current_training_session.status == "started":
                    # Check if training has been running too long
                    if time.time() - self.current_training_session.start_time > 3600:  # 1 hour
                        logging.warning(f"Training session {self.current_training_session.id} running for over 1 hour")
                
        except Exception as e:
            logging.error(f"Foundry Evaluation System runtime error: {e}")
    
    async def shutdown(self):
        """Gracefully shutdown the Foundry Evaluation System."""
        try:
            # Complete any active training session
            if self.current_training_session and self.current_training_session.status == "started":
                logging.info(f"Marking training session {self.current_training_session.id} as interrupted")
                self.current_training_session.status = "interrupted"
            
            logging.info("Foundry Evaluation System shutdown complete")
            
        except Exception as e:
            logging.error(f"Failed to shutdown Foundry Evaluation System: {e}")

# Global instance
foundry_manager: Optional[FoundryManager] = None

async def initialize_foundry_evaluation_system(brain_instance=None):
    """Initialize the global Foundry Manager."""
    global foundry_manager
    try:
        foundry_manager = FoundryManager(brain_instance)
        await foundry_manager.initialize()
        return foundry_manager
    
    except Exception as e:
        logging.error(f"Failed to initialize Foundry Evaluation System: {e}")
        return None

def get_foundry_manager() -> Optional[FoundryManager]:
    """Get the global Foundry Manager."""
    return foundry_manager
