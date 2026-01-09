# Autonomous Project Management System for Sallie
# Tier 4 Full Partner autonomous capabilities

import asyncio
import json
import time
import os
from typing import Dict, Any, Optional, List, Callable
from pathlib import Path
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum

class ProjectStatus(Enum):
    PLANNING = "planning"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"

class TaskPriority(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class Task:
    id: str
    title: str
    description: str
    priority: TaskPriority
    status: str = "pending"
    created_at: float = None
    due_date: Optional[float] = None
    dependencies: List[str] = None
    assigned_to: Optional[str] = None
    progress: float = 0.0
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = time.time()
        if self.dependencies is None:
            self.dependencies = []
        if self.metadata is None:
            self.metadata = {}

@dataclass
class Project:
    id: str
    name: str
    description: str
    status: ProjectStatus
    created_at: float = None
    updated_at: float = None
    due_date: Optional[float] = None
    budget: Optional[float] = None
    team: List[str] = None
    tasks: List[Task] = None
    goals: List[str] = None
    progress: float = 0.0
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = time.time()
        if self.updated_at is None:
            self.updated_at = time.time()
        if self.team is None:
            self.team = []
        if self.tasks is None:
            self.tasks = []
        if self.goals is None:
            self.goals = []
        if self.metadata is None:
            self.metadata = {}

class AutonomousProjectManager:
    """
    Autonomous project management system for Tier 4 Full Partner capabilities.
    
    Features:
    - Intelligent task planning and scheduling
    - Resource allocation and optimization
    - Progress tracking and reporting
    - Risk assessment and mitigation
    - Team coordination and communication
    - Automated decision making
    """
    
    def __init__(self, brain_instance=None):
        self.brain = brain_instance
        self.projects: Dict[str, Project] = {}
        self.active_tasks: Dict[str, Task] = {}
        self.completed_tasks: Dict[str, Task] = {}
        self.resource_pool = {}
        self.team_members = {}
        self.automation_rules = []
        self.is_initialized = False
        
        # Autonomous decision thresholds
        self.decision_thresholds = {
            "task_automation": 0.8,  # Trust level for autonomous task execution
            "resource_allocation": 0.9,  # Trust level for resource management
            "team_coordination": 0.85,  # Trust level for team management
            "risk_mitigation": 0.75  # Trust level for autonomous risk handling
        }
    
    async def initialize(self):
        """Initialize the autonomous project manager."""
        try:
            # Load existing projects from storage
            await self._load_projects()
            
            # Initialize resource pool
            await self._initialize_resources()
            
            # Set up automation rules
            await self._setup_automation_rules()
            
            self.is_initialized = True
            logging.info("🤖 Autonomous Project Manager initialized")
            return True
            
        except Exception as e:
            logging.error(f"Failed to initialize Autonomous Project Manager: {e}")
            return False
    
    async def create_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new project with intelligent planning.
        
        Args:
            project_data: Project creation data
            
        Returns:
            Dict with project creation result
        """
        if not self.is_initialized:
            return {"success": False, "error": "Project manager not initialized"}
        
        try:
            # Check autonomy level
            if self.brain and self.brain.autonomy_level < 4:
                return {"success": False, "error": "Project creation requires Tier 4 autonomy"}
            
            # Generate project ID
            project_id = f"proj_{int(time.time())}_{len(self.projects)}"
            
            # Create project with intelligent defaults
            project = Project(
                id=project_id,
                name=project_data.get("name", "New Project"),
                description=project_data.get("description", ""),
                status=ProjectStatus.PLANNING,
                due_date=project_data.get("due_date"),
                budget=project_data.get("budget"),
                team=project_data.get("team", []),
                goals=project_data.get("goals", [])
            )
            
            # Generate initial tasks using AI planning
            if project_data.get("auto_plan", True):
                generated_tasks = await self._generate_project_tasks(project)
                project.tasks = generated_tasks
            
            # Store project
            self.projects[project_id] = project
            
            # Update project status
            project.updated_at = time.time()
            
            # Save to storage
            await self._save_projects()
            
            return {
                "success": True,
                "project_id": project_id,
                "project": asdict(project),
                "message": "Project created successfully"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Project creation failed: {str(e)}"}
    
    async def _generate_project_tasks(self, project: Project) -> List[Task]:
        """Generate intelligent task breakdown for project."""
        try:
            # Use brain's reasoning capabilities for task planning
            tasks = []
            
            # Common project phases
            phases = [
                {"name": "Requirements Analysis", "priority": TaskPriority.CRITICAL},
                {"name": "Design & Planning", "priority": TaskPriority.HIGH},
                {"name": "Implementation", "priority": TaskPriority.HIGH},
                {"name": "Testing & QA", "priority": TaskPriority.MEDIUM},
                {"name": "Deployment", "priority": TaskPriority.MEDIUM},
                {"name": "Documentation", "priority": TaskPriority.LOW}
            ]
            
            for i, phase in enumerate(phases):
                task_id = f"task_{project.id}_{i+1}"
                task = Task(
                    id=task_id,
                    title=f"{phase['name']} - {project.name}",
                    description=f"Complete {phase['name'].lower()} phase for {project.name}",
                    priority=phase['priority'],
                    estimated_hours=self._estimate_task_hours(phase['name']),
                    due_date=self._calculate_task_due_date(project, i, len(phases))
                )
                tasks.append(task)
            
            return tasks
            
        except Exception as e:
            logging.error(f"Task generation failed: {e}")
            return []
    
    def _estimate_task_hours(self, phase_name: str) -> float:
        """Estimate hours for task based on phase type."""
        estimates = {
            "Requirements Analysis": 16.0,
            "Design & Planning": 24.0,
            "Implementation": 40.0,
            "Testing & QA": 20.0,
            "Deployment": 8.0,
            "Documentation": 12.0
        }
        return estimates.get(phase_name, 16.0)
    
    def _calculate_task_due_date(self, project: Project, phase_index: int, total_phases: int) -> float:
        """Calculate due date for task based on project timeline."""
        if project.due_date:
            # Distribute time evenly across phases
            total_time = project.due_date - project.created_at
            phase_time = total_time / total_phases
            return project.created_at + (phase_index + 1) * phase_time
        else:
            # Default to 1 week per phase from now
            return time.time() + (phase_index + 1) * 7 * 24 * 3600
    
    async def update_task_status(self, task_id: str, status: str, progress: float = None) -> Dict[str, Any]:
        """
        Update task status with autonomous follow-up actions.
        
        Args:
            task_id: Task identifier
            status: New task status
            progress: Progress percentage (0-100)
            
        Returns:
            Dict with update result
        """
        try:
            # Find task
            task = None
            for project in self.projects.values():
                for t in project.tasks:
                    if t.id == task_id:
                        task = t
                        break
                if task:
                    break
            
            if not task:
                return {"success": False, "error": "Task not found"}
            
            # Update task
            old_status = task.status
            task.status = status
            if progress is not None:
                task.progress = progress
            
            # Autonomous follow-up actions
            if status == "completed" and old_status != "completed":
                await self._handle_task_completion(task)
            elif status == "failed":
                await self._handle_task_failure(task)
            elif progress and progress > 0:
                await self._update_project_progress(task)
            
            # Save changes
            await self._save_projects()
            
            return {
                "success": True,
                "task_id": task_id,
                "old_status": old_status,
                "new_status": status,
                "progress": task.progress,
                "message": "Task updated successfully"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Task update failed: {str(e)}"}
    
    async def _handle_task_completion(self, task: Task):
        """Handle autonomous actions when task is completed."""
        try:
            # Move to completed tasks
            self.completed_tasks[task.id] = task
            if task.id in self.active_tasks:
                del self.active_tasks[task.id]
            
            # Check for dependent tasks that can now start
            await self._activate_dependent_tasks(task)
            
            # Update project progress
            await self._update_project_progress(task)
            
            # Notify team members
            await self._notify_task_completion(task)
            
        except Exception as e:
            logging.error(f"Task completion handling failed: {e}")
    
    async def _handle_task_failure(self, task: Task):
        """Handle autonomous actions when task fails."""
        try:
            # Analyze failure reasons
            failure_analysis = await self._analyze_task_failure(task)
            
            # Suggest recovery actions
            recovery_actions = await self._suggest_recovery_actions(task, failure_analysis)
            
            # Create recovery tasks if autonomy allows
            if self.brain and self.brain.autonomy_level >= 4:
                for action in recovery_actions:
                    await self._create_recovery_task(task, action)
            
        except Exception as e:
            logging.error(f"Task failure handling failed: {e}")
    
    async def get_project_status(self, project_id: str) -> Dict[str, Any]:
        """
        Get comprehensive project status with AI insights.
        
        Args:
            project_id: Project identifier
            
        Returns:
            Dict with project status and insights
        """
        try:
            project = self.projects.get(project_id)
            if not project:
                return {"success": False, "error": "Project not found"}
            
            # Calculate project metrics
            total_tasks = len(project.tasks)
            completed_tasks = len([t for t in project.tasks if t.status == "completed"])
            active_tasks = len([t for t in project.tasks if t.status == "active"])
            failed_tasks = len([t for t in project.tasks if t.status == "failed"])
            
            # Calculate progress
            if total_tasks > 0:
                project.progress = (completed_tasks / total_tasks) * 100
            
            # Generate AI insights
            insights = []
            if self.brain:
                # Risk assessment
                if failed_tasks > 0:
                    insights.append(f"⚠️ {failed_tasks} tasks have failed - review required")
                
                # Timeline assessment
                if project.due_date:
                    time_remaining = project.due_date - time.time()
                    if time_remaining < 7 * 24 * 3600:  # Less than 1 week
                        insights.append("⏰ Project due soon - accelerate critical tasks")
                
                # Resource assessment
                if active_tasks > len(project.team) * 3:
                    insights.append("👥 Team may be overloaded - consider resource allocation")
            
            return {
                "success": True,
                "project": asdict(project),
                "metrics": {
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                    "active_tasks": active_tasks,
                    "failed_tasks": failed_tasks,
                    "progress": project.progress
                },
                "insights": insights,
                "status": "Project status retrieved successfully"
            }
            
        except Exception as e:
            return {"success": False, "error": f"Status retrieval failed: {str(e)}"}
    
    async def get_all_projects(self) -> Dict[str, Any]:
        """Get all projects with summary status."""
        try:
            projects_summary = []
            
            for project in self.projects.values():
                # Calculate basic metrics
                total_tasks = len(project.tasks)
                completed_tasks = len([t for t in project.tasks if t.status == "completed"])
                progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
                
                summary = {
                    "id": project.id,
                    "name": project.name,
                    "status": project.status.value,
                    "progress": progress,
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                    "created_at": project.created_at,
                    "due_date": project.due_date
                }
                projects_summary.append(summary)
            
            return {
                "success": True,
                "projects": projects_summary,
                "total_projects": len(self.projects),
                "active_projects": len([p for p in self.projects.values() if p.status == ProjectStatus.ACTIVE])
            }
            
        except Exception as e:
            return {"success": False, "error": f"Projects retrieval failed: {str(e)}"}
    
    async def _load_projects(self):
        """Load projects from storage."""
        try:
            # Placeholder for loading from database or file
            # In production, this would load from persistent storage
            pass
        except Exception as e:
            logging.error(f"Failed to load projects: {e}")
    
    async def _save_projects(self):
        """Save projects to storage."""
        try:
            # Placeholder for saving to database or file
            # In production, this would save to persistent storage
            pass
        except Exception as e:
            logging.error(f"Failed to save projects: {e}")
    
    async def _initialize_resources(self):
        """Initialize resource pool."""
        try:
            # Placeholder for resource initialization
            self.resource_pool = {
                "compute": {"available": 100, "used": 0},
                "storage": {"available": 1000, "used": 0},
                "bandwidth": {"available": 1000, "used": 0}
            }
        except Exception as e:
            logging.error(f"Failed to initialize resources: {e}")
    
    async def _setup_automation_rules(self):
        """Set up automation rules for autonomous operations."""
        try:
            # Placeholder for automation rules
            self.automation_rules = [
                {"condition": "task_completed", "action": "update_progress"},
                {"condition": "project_overdue", "action": "notify_stakeholders"},
                {"condition": "resource_shortage", "action": "reallocate_resources"}
            ]
        except Exception as e:
            logging.error(f"Failed to setup automation rules: {e}")
    
    async def _activate_dependent_tasks(self, completed_task: Task):
        """Activate tasks that depend on the completed task."""
        try:
            for project in self.projects.values():
                for task in project.tasks:
                    if completed_task.id in task.dependencies and task.status == "pending":
                        task.status = "active"
                        self.active_tasks[task.id] = task
        except Exception as e:
            logging.error(f"Failed to activate dependent tasks: {e}")
    
    async def _update_project_progress(self, task: Task):
        """Update overall project progress based on task progress."""
        try:
            for project in self.projects.values():
                if task in project.tasks:
                    total_tasks = len(project.tasks)
                    completed_tasks = len([t for t in project.tasks if t.status == "completed"])
                    project.progress = (completed_tasks / total_tasks) * 100
                    project.updated_at = time.time()
                    break
        except Exception as e:
            logging.error(f"Failed to update project progress: {e}")
    
    async def _notify_task_completion(self, task: Task):
        """Notify team members about task completion."""
        try:
            # Placeholder for team notification
            logging.info(f"Task {task.id} completed: {task.title}")
        except Exception as e:
            logging.error(f"Failed to notify task completion: {e}")
    
    async def _analyze_task_failure(self, task: Task) -> Dict[str, Any]:
        """Analyze reasons for task failure."""
        try:
            # Placeholder for failure analysis
            return {
                "reason": "unknown",
                "severity": "medium",
                "impact": "low"
            }
        except Exception as e:
            logging.error(f"Failed to analyze task failure: {e}")
            return {}
    
    async def _suggest_recovery_actions(self, task: Task, analysis: Dict[str, Any]) -> List[str]:
        """Suggest recovery actions for failed task."""
        try:
            # Placeholder for recovery suggestions
            return ["Review requirements", "Allocate more resources", "Extend timeline"]
        except Exception as e:
            logging.error(f"Failed to suggest recovery actions: {e}")
            return []
    
    async def _create_recovery_task(self, failed_task: Task, action: str):
        """Create recovery task for failed task."""
        try:
            # Placeholder for recovery task creation
            recovery_task = Task(
                id=f"recovery_{failed_task.id}_{int(time.time())}",
                title=f"Recovery: {action}",
                description=f"Recovery action for failed task: {failed_task.title}",
                priority=TaskPriority.HIGH,
                dependencies=[failed_task.id]
            )
            
            # Add to appropriate project
            for project in self.projects.values():
                if failed_task in project.tasks:
                    project.tasks.append(recovery_task)
                    break
        except Exception as e:
            logging.error(f"Failed to create recovery task: {e}")

# Global autonomous project manager instance
autonomous_pm = AutonomousProjectManager()
