# Brain Forge Integration for Sallie Server
# Adds LLM fine-tuning pipeline and evaluation harness endpoints

import asyncio
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from pathlib import Path
from brain_forge import BrainForge, TrainingStatus, ModelType, EvaluationMetric

class BrainForgeManager:
    """Manages the Brain Forge System integration with the main server."""
    
    def __init__(self, brain_instance=None):
        self.brain = brain_instance
        self.brain_forge: Optional[BrainForge] = None
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize the Brain Forge System."""
        try:
            self.brain_forge = BrainForge(self.brain)
            self.is_initialized = True
            logging.info("Brain Forge System initialized successfully")
            
        except Exception as e:
            logging.error(f"Failed to initialize Brain Forge System: {e}")
            raise
    
    def create_training_job(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new training job."""
        if not self.brain_forge or not self.is_initialized:
            return {"error": "Brain Forge System not initialized"}
        
        try:
            # Convert config dict to TrainingConfig object
            from brain_forge import TrainingConfig
            
            training_config = TrainingConfig(
                model_name=config.get("model_name", ""),
                base_model=config.get("base_model", ""),
                model_type=ModelType(config.get("model_type", "conversation")),
                dataset_id=config.get("dataset_id", ""),
                epochs=config.get("epochs", self.brain_forge.default_epochs),
                batch_size=config.get("batch_size", self.brain_forge.default_batch_size),
                learning_rate=config.get("learning_rate", self.brain_forge.default_learning_rate),
                warmup_steps=config.get("warmup_steps", 100),
                max_steps=config.get("max_steps", 1000),
                save_steps=config.get("save_steps", 100),
                eval_steps=config.get("eval_steps", 100),
                logging_steps=config.get("logging_steps", 10),
                output_dir=config.get("output_dir", f"brain_forge/models/{config.get('model_name', 'model')}"),
                metrics=[EvaluationMetric(m) for m in config.get("metrics", ["accuracy", "fluency"])],
                hyperparameters=config.get("hyperparameters", {})
            )
            
            job_id = self.brain_forge.create_training_job(training_config)
            
            return {
                "success": True,
                "job_id": job_id,
                "model_name": training_config.model_name,
                "base_model": training_config.base_model,
                "model_type": training_config.model_type.value,
                "dataset_id": training_config.dataset_id,
                "epochs": training_config.epochs,
                "status": "pending",
                "created": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Failed to create training job: {e}")
            return {"error": str(e)}
    
    def get_training_job(self, job_id: str) -> Dict[str, Any]:
        """Get details of a specific training job."""
        if not self.brain_forge or not self.is_initialized:
            return {"error": "Brain Forge System not initialized"}
        
        try:
            job = self.brain_forge.get_training_job(job_id)
            
            if not job:
                return {"error": "Training job not found"}
            
            return {
                "id": job.id,
                "model_name": job.config.model_name,
                "base_model": job.config.base_model,
                "model_type": job.config.model_type.value,
                "dataset_id": job.config.dataset_id,
                "status": job.status.value,
                "created": job.created,
                "started": job.started,
                "completed": job.completed,
                "progress": job.progress,
                "current_epoch": job.current_epoch,
                "total_epochs": job.total_epochs,
                "current_step": job.current_step,
                "total_steps": job.total_steps,
                "loss": job.loss,
                "metrics": job.metrics,
                "artifacts": job.artifacts,
                "error_message": job.error_message
            }
            
        except Exception as e:
            logging.error(f"Failed to get training job: {e}")
            return {"error": str(e)}
    
    def list_training_jobs(self, status: Optional[str] = None) -> Dict[str, Any]:
        """List training jobs, optionally filtered by status."""
        if not self.brain_forge or not self.is_initialized:
            return {"error": "Brain Forge System not initialized"}
        
        try:
            # Convert status string to enum if provided
            status_enum = None
            if status:
                try:
                    status_enum = TrainingStatus(status)
                except ValueError:
                    return {"error": f"Invalid status: {status}"}
            
            jobs = self.brain_forge.list_training_jobs(status_enum)
            
            return {
                "jobs": jobs,
                "count": len(jobs),
                "filter_status": status
            }
            
        except Exception as e:
            logging.error(f"Failed to list training jobs: {e}")
            return {"error": str(e)}
    
    def cancel_training_job(self, job_id: str) -> Dict[str, Any]:
        """Cancel a training job."""
        if not self.brain_forge or not self.is_initialized:
            return {"error": "Brain Forge System not initialized"}
        
        try:
            success = self.brain_forge.cancel_training_job(job_id)
            
            if success:
                return {
                    "success": True,
                    "job_id": job_id,
                    "cancelled_at": datetime.now().isoformat()
                }
            else:
                return {
                    "success": False,
                    "error": "Cannot cancel job (not found or already completed)"
                }
                
        except Exception as e:
            logging.error(f"Failed to cancel training job: {e}")
            return {"error": str(e)}
    
    def create_dataset(self, name: str, description: str, model_type: str, 
                       data_path: str, format: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a new training dataset."""
        if not self.brain_forge or not self.is_initialized:
            return {"error": "Brain Forge System not initialized"}
        
        try:
            # Convert model_type string to enum
            model_type_enum = ModelType(model_type)
            
            dataset_id = self.brain_forge.create_dataset(
                name=name,
                description=description,
                model_type=model_type_enum,
                data_path=data_path,
                format=format,
                metadata=metadata or {}
            )
            
            dataset = self.brain_forge.get_dataset(dataset_id)
            
            return {
                "success": True,
                "dataset_id": dataset_id,
                "name": dataset.name,
                "description": dataset.description,
                "model_type": dataset.model_type.value,
                "format": dataset.format,
                "size": dataset.size,
                "samples": dataset.samples,
                "created": dataset.created,
                "metadata": dataset.metadata
            }
            
        except Exception as e:
            logging.error(f"Failed to create dataset: {e}")
            return {"error": str(e)}
    
    def get_dataset(self, dataset_id: str) -> Dict[str, Any]:
        """Get details of a specific dataset."""
        if not self.brain_forge or not self.is_initialized:
            return {"error": "Brain Forge System not initialized"}
        
        try:
            dataset = self.brain_forge.get_dataset(dataset_id)
            
            if not dataset:
                return {"error": "Dataset not found"}
            
            return {
                "id": dataset.id,
                "name": dataset.name,
                "description": dataset.description,
                "model_type": dataset.model_type.value,
                "data_path": dataset.data_path,
                "format": dataset.format,
                "size": dataset.size,
                "samples": dataset.samples,
                "created": dataset.created,
                "metadata": dataset.metadata
            }
            
        except Exception as e:
            logging.error(f"Failed to get dataset: {e}")
            return {"error": str(e)}
    
    def list_datasets(self) -> Dict[str, Any]:
        """List all available datasets."""
        if not self.brain_forge or not self.is_initialized:
            return {"error": "Brain Forge System not initialized"}
        
        try:
            datasets = self.brain_forge.list_datasets()
            
            return {
                "datasets": datasets,
                "count": len(datasets)
            }
            
        except Exception as e:
            logging.error(f"Failed to list datasets: {e}")
            return {"error": str(e)}
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get Brain Forge statistics."""
        if not self.brain_forge or not self.is_initialized:
            return {"error": "Brain Forge System not initialized"}
        
        try:
            stats = self.brain_forge.get_statistics()
            
            # Add additional information
            stats.update({
                "is_initialized": self.is_initialized,
                "forge_directory": str(self.brain_forge.forge_dir),
                "active_jobs": len(self.brain_forge.active_jobs),
                "queued_jobs": self.brain_forge.job_queue.qsize(),
                "max_concurrent_jobs": self.brain_forge.max_concurrent_jobs
            })
            
            return stats
            
        except Exception as e:
            logging.error(f"Failed to get statistics: {e}")
            return {"error": str(e)}
    
    def get_model_types(self) -> Dict[str, Any]:
        """Get available model types."""
        return {
            "model_types": [
                {
                    "value": "conversation",
                    "name": "Conversation",
                    "description": "General conversation and dialogue models"
                },
                {
                    "value": "analysis",
                    "name": "Analysis",
                    "description": "Technical analysis and problem-solving models"
                },
                {
                    "value": "creative",
                    "name": "Creative",
                    "description": "Creative writing and artistic generation models"
                },
                {
                    "value": "technical",
                    "name": "Technical",
                    "description": "Technical documentation and code generation models"
                },
                {
                    "value": "memory",
                    "name": "Memory",
                    "description": "Memory management and retrieval models"
                },
                {
                    "value": "ethics",
                    "name": "Ethics",
                    "description": "Ethical reasoning and safety models"
                }
            ]
        }
    
    def get_evaluation_metrics(self) -> Dict[str, Any]:
        """Get available evaluation metrics."""
        return {
            "metrics": [
                {
                    "value": "accuracy",
                    "name": "Accuracy",
                    "description": "Model accuracy on test data"
                },
                {
                    "value": "fluency",
                    "name": "Fluency",
                    "description": "Language fluency and naturalness"
                },
                {
                    "value": "coherence",
                    "name": "Coherence",
                    "description": "Response coherence and consistency"
                },
                {
                    "value": "relevance",
                    "name": "Relevance",
                    "description": "Response relevance to prompts"
                },
                {
                    "value": "safety",
                    "name": "Safety",
                    "description": "Safety and ethical compliance"
                },
                {
                    "value": "efficiency",
                    "name": "Efficiency",
                    "description": "Computational efficiency"
                },
                {
                    "value": "consistency",
                    "name": "Consistency",
                    "description": "Response consistency across runs"
                }
            ]
        }
    
    def get_training_config_template(self) -> Dict[str, Any]:
        """Get a template for training configuration."""
        return {
            "model_name": "sallie-conversation-v2",
            "base_model": "microsoft/DialoGPT-medium",
            "model_type": "conversation",
            "dataset_id": "conversation_basic",
            "epochs": 3,
            "batch_size": 4,
            "learning_rate": 2e-5,
            "warmup_steps": 100,
            "max_steps": 1000,
            "save_steps": 100,
            "eval_steps": 100,
            "logging_steps": 10,
            "output_dir": "brain_forge/models/sallie-conversation-v2",
            "metrics": ["accuracy", "fluency", "safety"],
            "hyperparameters": {
                "weight_decay": 0.01,
                "adam_epsilon": 1e-8,
                "max_grad_norm": 1.0
            }
        }
    
    async def run(self):
        """Run the Brain Forge System."""
        try:
            # The brain forge system runs on its own training thread
            # We just monitor it here
            while True:
                await asyncio.sleep(300)  # Check every 5 minutes
                
                # Could perform periodic maintenance here
                pass
                
        except Exception as e:
            logging.error(f"Brain Forge System runtime error: {e}")
    
    async def shutdown(self):
        """Gracefully shutdown the Brain Forge System."""
        try:
            # Cancel all active jobs
            if self.brain_forge and self.brain_forge.active_jobs:
                for job_id in self.brain_forge.active_jobs.copy():
                    self.brain_forge.cancel_training_job(job_id)
            
            logging.info("Brain Forge System shutdown complete")
            
        except Exception as e:
            logging.error(f"Failed to shutdown Brain Forge System: {e}")

# Global instance
brain_forge_manager: Optional[BrainForgeManager] = None

async def initialize_brain_forge_system(brain_instance=None):
    """Initialize the global Brain Forge Manager."""
    global brain_forge_manager
    try:
        brain_forge_manager = BrainForgeManager(brain_instance)
        await brain_forge_manager.initialize()
        return brain_forge_manager
    
    except Exception as e:
        logging.error(f"Failed to initialize Brain Forge System: {e}")
        return None

def get_brain_forge_manager() -> Optional[BrainForgeManager]:
    """Get the global Brain Forge Manager."""
    return brain_forge_manager
