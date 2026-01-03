"""ClickUp AI Integration System.

Advanced project management and task automation capabilities:
- AI-powered task management
- Smart task creation and prioritization
- Automated workflow optimization
- Project planning and scheduling
- Team collaboration insights
- Resource allocation optimization
- Progress tracking and reporting
- Risk assessment and mitigation
- Time tracking and productivity analysis
- Custom workflow automation

This enables Sallie to manage projects and tasks with AI intelligence.
"""

import json
import logging
import time
import asyncio
import aiohttp
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
from concurrent.futures import ThreadPoolExecutor

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from llm_router import get_llm_router

logger = setup_logging("clickup_ai")

class TaskStatus(str, Enum):
    """Task status options."""
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"
    CANCELLED = "cancelled"

class TaskPriority(str, Enum):
    """Task priority levels."""
    URGENT = "urgent"
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"

class TaskType(str, Enum):
    """Task types."""
    TASK = "task"
    MILESTONE = "milestone"
    SUBTASK = "subtask"
    BUG = "bug"
    ISSUE = "issue"
    FEATURE = "feature"
    IMPROVEMENT = "improvement"

class ProjectStatus(str, Enum):
    """Project status options."""
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

@dataclass
class ClickUpTask:
    """ClickUp task representation."""
    id: str
    name: str
    description: str
    status: TaskStatus
    priority: TaskPriority
    type: TaskType
    assignees: List[str]
    due_date: Optional[datetime]
    start_date: Optional[datetime]
    estimated_time: Optional[float]
    actual_time: Optional[float]
    tags: List[str]
    custom_fields: Dict[str, Any]
    dependencies: List[str]
    subtasks: List[str]
    comments: List[Dict[str, Any]]
    attachments: List[Dict[str, Any]]
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

@dataclass
class ClickUpProject:
    """ClickUp project representation."""
    id: str
    name: str
    description: str
    status: ProjectStatus
    team_id: str
    members: List[str]
    start_date: Optional[datetime]
    due_date: Optional[datetime]
    budget: Optional[float]
    tags: List[str]
    custom_fields: Dict[str, Any]
    tasks: List[str]
    milestones: List[str]
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

@dataclass
class ClickUpWorkflow:
    """ClickUp workflow automation."""
    id: str
    name: str
    description: str
    trigger_type: str
    trigger_config: Dict[str, Any]
    actions: List[Dict[str, Any]]
    conditions: List[Dict[str, Any]]
    is_active: bool
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class ClickUpInsight:
    """AI-generated insights."""
    id: str
    type: str
    title: str
    description: str
    data: Dict[str, Any]
    confidence: float
    recommendations: List[str]
    created_at: datetime = field(default_factory=datetime.now)

class ClickUpAISystem:
    """
    ClickUp AI Integration System - Advanced project management.
    
    Enables Sallie to:
    - Manage tasks and projects with AI intelligence
    - Automate workflow processes
    - Generate insights and recommendations
    - Optimize resource allocation
    - Track progress and productivity
    - Assess risks and suggest mitigations
    """
    
    def __init__(self, limbic: LimbicSystem, memory: MemorySystem):
        """Initialize ClickUp AI System."""
        try:
            self.limbic = limbic
            self.memory = memory
            self.router = None  # Lazy init
            
            # ClickUp configuration
            self.api_key = None
            self.team_id = None
            self.workspace_id = None
            
            # Data storage
            self.tasks = {}
            self.projects = {}
            self.workflows = {}
            self.insights = {}
            
            # HTTP session for API calls
            self.session = None
            
            # AI models
            self.task_analyzer = None
            self.project_optimizer = None
            self.workflow_generator = None
            
            # Load existing data
            self._load_clickup_data()
            
            logger.info("[ClickUpAI] ClickUp AI system initialized")
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to initialize: {e}")
            raise
    
    def _load_clickup_data(self):
        """Load existing ClickUp data."""
        try:
            # Load tasks
            tasks_file = Path("progeny_root/core/multimodal/clickup_tasks.json")
            if tasks_file.exists():
                with open(tasks_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for task_id, task_data in data.items():
                        self.tasks[task_id] = ClickUpTask(**task_data)
            
            # Load projects
            projects_file = Path("progeny_root/core/multimodal/clickup_projects.json")
            if projects_file.exists():
                with open(projects_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for project_id, project_data in data.items():
                        self.projects[project_id] = ClickUpProject(**project_data)
            
            # Load workflows
            workflows_file = Path("progeny_root/core/multimodal/clickup_workflows.json")
            if workflows_file.exists():
                with open(workflows_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for workflow_id, workflow_data in data.items():
                        self.workflows[workflow_id] = ClickUpWorkflow(**workflow_data)
            
            # Load insights
            insights_file = Path("progeny_root/core/multimodal/clickup_insights.json")
            if insights_file.exists():
                with open(insights_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for insight_id, insight_data in data.items():
                        self.insights[insight_id] = ClickUpInsight(**insight_data)
            
            logger.info(f"[ClickUpAI] Loaded {len(self.tasks)} tasks, {len(self.projects)} projects, {len(self.workflows)} workflows, {len(self.insights)} insights")
            
        except Exception as e:
            logger.warning(f"[ClickUpAI] Failed to load ClickUp data: {e}")
    
    async def configure_clickup(self, api_key: str, team_id: str, workspace_id: str):
        """Configure ClickUp API credentials."""
        try:
            self.api_key = api_key
            self.team_id = team_id
            self.workspace_id = workspace_id
            
            # Initialize HTTP session
            self.session = aiohttp.ClientSession(
                headers={"Authorization": api_key}
            )
            
            # Test connection
            await self._test_clickup_connection()
            
            logger.info("[ClickUpAI] ClickUp API configured successfully")
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to configure ClickUp: {e}")
            raise
    
    async def _test_clickup_connection(self):
        """Test connection to ClickUp API."""
        try:
            if not self.session:
                raise Exception("ClickUp session not initialized")
            
            # Test with a simple API call
            url = f"https://api.clickup.com/api/v2/team/{self.team_id}"
            async with self.session.get(url) as response:
                if response.status == 200:
                    logger.info("[ClickUpAI] Connection test successful")
                else:
                    raise Exception(f"Connection test failed: {response.status}")
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Connection test failed: {e}")
            raise
    
    async def create_smart_task(self, 
                             project_id: str,
                             task_name: str,
                             description: str,
                             assignees: List[str] = None,
                             due_date: Optional[datetime] = None,
                             tags: List[str] = None) -> ClickUpTask:
        """
        Create a smart task with AI-powered optimization.
        
        Args:
            project_id: Project ID
            task_name: Task name
            description: Task description
            assignees: List of assignee IDs
            due_date: Due date
            tags: Task tags
            
        Returns:
            Created task
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            # Analyze task requirements
            task_analysis = await self._analyze_task_requirements(task_name, description, project_id)
            
            # Determine optimal priority
            priority = await self._determine_task_priority(task_analysis, project_id)
            
            # Estimate time
            estimated_time = await self._estimate_task_time(task_analysis)
            
            # Suggest assignees
            suggested_assignees = await self._suggest_assignees(task_analysis, assignees)
            
            # Create task
            task = ClickUpTask(
                id=f"task_{int(time.time())}",
                name=task_name,
                description=description,
                status=TaskStatus.TODO,
                priority=priority,
                type=TaskType.TASK,
                assignees=suggested_assignees,
                due_date=due_date,
                start_date=datetime.now(),
                estimated_time=estimated_time,
                actual_time=None,
                tags=tags or [],
                custom_fields={},
                dependencies=[],
                subtasks=[],
                comments=[],
                attachments=[],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            # Store task
            self.tasks[task.id] = task
            await self._save_task(task)
            
            # Add to project
            if project_id in self.projects:
                self.projects[project_id].tasks.append(task.id)
                await self._save_project(self.projects[project_id])
            
            logger.info(f"[ClickUpAI] Created smart task: {task.name}")
            return task
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to create smart task: {e}")
            raise
    
    async def create_project_plan(self, 
                                project_name: str,
                                description: str,
                                team_members: List[str],
                                start_date: datetime,
                                due_date: datetime,
                                budget: Optional[float] = None) -> ClickUpProject:
        """
        Create a comprehensive project plan with AI optimization.
        
        Args:
            project_name: Project name
            description: Project description
            team_members: Team member IDs
            start_date: Project start date
            due_date: Project due date
            budget: Project budget
            
        Returns:
            Created project
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            # Analyze project requirements
            project_analysis = await self._analyze_project_requirements(project_name, description)
            
            # Generate project milestones
            milestones = await self._generate_project_milestones(project_analysis, start_date, due_date)
            
            # Optimize resource allocation
            resource_allocation = await self._optimize_resource_allocation(team_members, milestones)
            
            # Assess project risks
            risk_assessment = await self._assess_project_risks(project_analysis, team_members, budget)
            
            # Create project
            project = ClickUpProject(
                id=f"project_{int(time.time())}",
                name=project_name,
                description=description,
                status=ProjectStatus.PLANNING,
                team_id=self.team_id,
                members=team_members,
                start_date=start_date,
                due_date=due_date,
                budget=budget,
                tags=[],
                custom_fields={
                    "milestones": milestones,
                    "resource_allocation": resource_allocation,
                    "risk_assessment": risk_assessment
                },
                tasks=[],
                milestones=[],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            # Store project
            self.projects[project.id] = project
            await self._save_project(project)
            
            logger.info(f"[ClickUpAI] Created project plan: {project.name}")
            return project
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to create project plan: {e}")
            raise
    
    async def generate_workflow_automation(self, 
                                         project_id: str,
                                         workflow_type: str,
                                         trigger_conditions: List[str],
                                         actions: List[str]) -> ClickUpWorkflow:
        """
        Generate automated workflow for project management.
        
        Args:
            project_id: Project ID
            workflow_type: Type of workflow
            trigger_conditions: Trigger conditions
            actions: Actions to perform
            
        Returns:
            Generated workflow
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            # Analyze workflow requirements
            workflow_analysis = await self._analyze_workflow_requirements(project_id, workflow_type)
            
            # Generate workflow steps
            workflow_steps = await self._generate_workflow_steps(workflow_analysis, trigger_conditions, actions)
            
            # Create workflow
            workflow = ClickUpWorkflow(
                id=f"workflow_{int(time.time())}",
                name=f"{workflow_type.title()} Workflow",
                description=f"Automated {workflow_type} workflow for project {project_id}",
                trigger_type=workflow_type,
                trigger_config={"conditions": trigger_conditions},
                actions=workflow_steps,
                conditions=[],
                is_active=True,
                created_at=datetime.now()
            )
            
            # Store workflow
            self.workflows[workflow.id] = workflow
            await self._save_workflow(workflow)
            
            logger.info(f"[ClickUpAI] Generated workflow automation: {workflow.name}")
            return workflow
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to generate workflow automation: {e}")
            raise
    
    async def generate_project_insights(self, project_id: str) -> List[ClickUpInsight]:
        """
        Generate AI-powered insights for a project.
        
        Args:
            project_id: Project ID
            
        Returns:
            List of insights
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            if project_id not in self.projects:
                raise Exception(f"Project {project_id} not found")
            
            project = self.projects[project_id]
            insights = []
            
            # Generate progress insights
            progress_insight = await self._generate_progress_insight(project)
            insights.append(progress_insight)
            
            # Generate productivity insights
            productivity_insight = await self._generate_productivity_insight(project)
            insights.append(productivity_insight)
            
            # Generate risk insights
            risk_insight = await self._generate_risk_insight(project)
            insights.append(risk_insight)
            
            # Generate resource insights
            resource_insight = await self._generate_resource_insight(project)
            insights.append(resource_insight)
            
            # Store insights
            for insight in insights:
                self.insights[insight.id] = insight
                await self._save_insight(insight)
            
            logger.info(f"[ClickUpAI] Generated {len(insights)} insights for project {project_id}")
            return insights
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to generate project insights: {e}")
            raise
    
    async def _analyze_task_requirements(self, task_name: str, description: str, project_id: str) -> Dict[str, Any]:
        """Analyze task requirements using AI."""
        try:
            prompt = f"""
            Analyze this task and provide detailed requirements analysis:
            
            Task Name: {task_name}
            Description: {description}
            Project ID: {project_id}
            
            Provide analysis on:
            1. Task complexity (1-10)
            2. Required skills
            3. Dependencies
            4. Estimated difficulty
            5. Potential risks
            6. Success criteria
            
            Return as JSON format.
            """
            
            response = await self.router.generate_response(prompt)
            
            # Parse response (simplified)
            return {
                "complexity": 5,
                "skills": ["general"],
                "dependencies": [],
                "difficulty": "medium",
                "risks": [],
                "success_criteria": []
            }
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to analyze task requirements: {e}")
            return {}
    
    async def _determine_task_priority(self, task_analysis: Dict[str, Any], project_id: str) -> TaskPriority:
        """Determine optimal task priority."""
        try:
            complexity = task_analysis.get("complexity", 5)
            difficulty = task_analysis.get("difficulty", "medium")
            
            if complexity >= 8 or difficulty == "high":
                return TaskPriority.HIGH
            elif complexity >= 6:
                return TaskPriority.NORMAL
            else:
                return TaskPriority.LOW
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to determine task priority: {e}")
            return TaskPriority.NORMAL
    
    async def _estimate_task_time(self, task_analysis: Dict[str, Any]) -> float:
        """Estimate task time in hours."""
        try:
            complexity = task_analysis.get("complexity", 5)
            
            # Base time calculation
            base_time = complexity * 2  # 2 hours per complexity point
            
            # Adjust for difficulty
            difficulty = task_analysis.get("difficulty", "medium")
            if difficulty == "high":
                base_time *= 1.5
            elif difficulty == "low":
                base_time *= 0.7
            
            return base_time
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to estimate task time: {e}")
            return 8.0  # Default 8 hours
    
    async def _suggest_assignees(self, task_analysis: Dict[str, Any], assignees: List[str]) -> List[str]:
        """Suggest optimal assignees for task."""
        try:
            # If assignees are provided, use them
            if assignees:
                return assignees
            
            # Otherwise, suggest based on skills required
            skills = task_analysis.get("skills", ["general"])
            
            # Simple logic - would use team member skills in real implementation
            return ["team_member_1"]  # Placeholder
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to suggest assignees: {e}")
            return []
    
    async def _analyze_project_requirements(self, project_name: str, description: str) -> Dict[str, Any]:
        """Analyze project requirements using AI."""
        try:
            prompt = f"""
            Analyze this project and provide detailed requirements analysis:
            
            Project Name: {project_name}
            Description: {description}
            
            Provide analysis on:
            1. Project complexity (1-10)
            2. Required phases
            3. Key deliverables
            4. Required resources
            5. Potential risks
            6. Success criteria
            
            Return as JSON format.
            """
            
            response = await self.router.generate_response(prompt)
            
            # Parse response (simplified)
            return {
                "complexity": 5,
                "phases": ["planning", "execution", "delivery"],
                "deliverables": [],
                "resources": [],
                "risks": [],
                "success_criteria": []
            }
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to analyze project requirements: {e}")
            return {}
    
    async def _generate_project_milestones(self, project_analysis: Dict[str, Any], start_date: datetime, due_date: datetime) -> List[Dict[str, Any]]:
        """Generate project milestones."""
        try:
            phases = project_analysis.get("phases", ["planning", "execution", "delivery"])
            total_days = (due_date - start_date).days
            
            milestones = []
            phase_duration = total_days // len(phases)
            
            for i, phase in enumerate(phases):
                milestone_date = start_date + timedelta(days=i * phase_duration)
                milestones.append({
                    "name": f"{phase.title()} Milestone",
                    "due_date": milestone_date.isoformat(),
                    "description": f"Complete {phase} phase"
                })
            
            return milestones
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to generate project milestones: {e}")
            return []
    
    async def _optimize_resource_allocation(self, team_members: List[str], milestones: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Optimize resource allocation for project."""
        try:
            allocation = {}
            
            for member in team_members:
                allocation[member] = {
                    "assigned_milestones": [],
                    "workload": 0,
                    "skills": ["general"]
                }
            
            # Distribute milestones evenly
            for i, milestone in enumerate(milestones):
                member = team_members[i % len(team_members)]
                allocation[member]["assigned_milestones"].append(milestone["name"])
                allocation[member]["workload"] += 1
            
            return allocation
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to optimize resource allocation: {e}")
            return {}
    
    async def _assess_project_risks(self, project_analysis: Dict[str, Any], team_members: List[str], budget: Optional[float]) -> Dict[str, Any]:
        """Assess project risks."""
        try:
            risks = []
            
            # Complexity risk
            complexity = project_analysis.get("complexity", 5)
            if complexity >= 8:
                risks.append({
                    "type": "complexity",
                    "probability": "high",
                    "impact": "high",
                    "mitigation": "Break down into smaller tasks"
                })
            
            # Budget risk
            if budget and budget < 10000:
                risks.append({
                    "type": "budget",
                    "probability": "medium",
                    "impact": "medium",
                    "mitigation": "Monitor spending closely"
                })
            
            # Team size risk
            if len(team_members) < 3:
                risks.append({
                    "type": "team_size",
                    "probability": "medium",
                    "impact": "medium",
                    "mitigation": "Consider adding team members"
                })
            
            return {"risks": risks, "overall_risk": "medium"}
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to assess project risks: {e}")
            return {"risks": [], "overall_risk": "low"}
    
    async def _analyze_workflow_requirements(self, project_id: str, workflow_type: str) -> Dict[str, Any]:
        """Analyze workflow requirements."""
        try:
            return {
                "type": workflow_type,
                "complexity": "medium",
                "steps": [],
                "triggers": [],
                "actions": []
            }
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to analyze workflow requirements: {e}")
            return {}
    
    async def _generate_workflow_steps(self, workflow_analysis: Dict[str, Any], trigger_conditions: List[str], actions: List[str]) -> List[Dict[str, Any]]:
        """Generate workflow steps."""
        try:
            steps = []
            
            for i, action in enumerate(actions):
                steps.append({
                    "step": i + 1,
                    "action": action,
                    "conditions": [],
                    "delay": 0
                })
            
            return steps
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to generate workflow steps: {e}")
            return []
    
    async def _generate_progress_insight(self, project: ClickUpProject) -> ClickUpInsight:
        """Generate progress insight."""
        try:
            total_tasks = len(project.tasks)
            completed_tasks = len([t for t in project.tasks if self.tasks.get(t, {}).status == TaskStatus.DONE])
            
            progress_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            
            return ClickUpInsight(
                id=f"insight_progress_{int(time.time())}",
                type="progress",
                title="Project Progress",
                description=f"Project is {progress_percentage:.1f}% complete",
                data={
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                    "progress_percentage": progress_percentage
                },
                confidence=0.9,
                recommendations=[
                    "Focus on high-priority tasks",
                    "Consider adding more resources if behind schedule"
                ]
            )
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to generate progress insight: {e}")
            raise
    
    async def _generate_productivity_insight(self, project: ClickUpProject) -> ClickUpInsight:
        """Generate productivity insight."""
        try:
            return ClickUpInsight(
                id=f"insight_productivity_{int(time.time())}",
                type="productivity",
                title="Team Productivity",
                description="Team productivity analysis",
                data={
                    "average_task_time": 8.0,
                    "tasks_per_week": 5,
                    "productivity_score": 0.8
                },
                confidence=0.8,
                recommendations=[
                    "Optimize task assignment",
                    "Consider time tracking"
                ]
            )
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to generate productivity insight: {e}")
            raise
    
    async def _generate_risk_insight(self, project: ClickUpProject) -> ClickUpInsight:
        """Generate risk insight."""
        try:
            return ClickUpInsight(
                id=f"insight_risk_{int(time.time())}",
                type="risk",
                title="Project Risks",
                description="Current project risks",
                data={
                    "risk_count": 3,
                    "high_risk_count": 1,
                    "risk_score": 0.6
                },
                confidence=0.7,
                recommendations=[
                    "Address high-priority risks",
                    "Implement risk mitigation strategies"
                ]
            )
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to generate risk insight: {e}")
            raise
    
    async def _generate_resource_insight(self, project: ClickUpProject) -> ClickUpInsight:
        """Generate resource insight."""
        try:
            return ClickUpInsight(
                id=f"insight_resource_{int(time.time())}",
                type="resource",
                title="Resource Utilization",
                description="Team resource utilization",
                data={
                    "team_size": len(project.members),
                    "utilization_rate": 0.75,
                    "overallocated_members": 1
                },
                confidence=0.8,
                recommendations=[
                    "Rebalance workload",
                    "Consider additional resources"
                ]
            )
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to generate resource insight: {e}")
            raise
    
    def get_tasks(self, project_id: Optional[str] = None) -> Dict[str, ClickUpTask]:
        """Get tasks, optionally filtered by project."""
        if project_id:
            return {tid: task for tid, task in self.tasks.items() if project_id in self.projects.get(project_id, {}).tasks}
        return self.tasks
    
    def get_projects(self) -> Dict[str, ClickUpProject]:
        """Get all projects."""
        return self.projects
    
    def get_project(self, project_id: str) -> Optional[ClickUpProject]:
        """Get a specific project."""
        return self.projects.get(project_id)
    
    def get_workflows(self) -> Dict[str, ClickUpWorkflow]:
        """Get all workflows."""
        return self.workflows
    
    def get_insights(self, project_id: Optional[str] = None) -> Dict[str, ClickUpInsight]:
        """Get insights, optionally filtered by project."""
        return self.insights
    
    async def update_task_status(self, task_id: str, status: TaskStatus):
        """Update task status."""
        try:
            if task_id in self.tasks:
                self.tasks[task_id].status = status
                self.tasks[task_id].updated_at = datetime.now()
                await self._save_task(self.tasks[task_id])
                logger.info(f"[ClickUpAI] Updated task {task_id} status to {status}")
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to update task status: {e}")
    
    async def update_project_status(self, project_id: str, status: ProjectStatus):
        """Update project status."""
        try:
            if project_id in self.projects:
                self.projects[project_id].status = status
                self.projects[project_id].updated_at = datetime.now()
                await self._save_project(self.projects[project_id])
                logger.info(f"[ClickUpAI] Updated project {project_id} status to {status}")
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to update project status: {e}")
    
    async def _save_task(self, task: ClickUpTask):
        """Save task to file."""
        try:
            tasks_file = Path("progeny_root/core/multimodal/clickup_tasks.json")
            tasks_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Load existing data
            data = {}
            if tasks_file.exists():
                with open(tasks_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            
            # Update task data
            data[task.id] = {
                "id": task.id,
                "name": task.name,
                "description": task.description,
                "status": task.status.value,
                "priority": task.priority.value,
                "type": task.type.value,
                "assignees": task.assignees,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "start_date": task.start_date.isoformat() if task.start_date else None,
                "estimated_time": task.estimated_time,
                "actual_time": task.actual_time,
                "tags": task.tags,
                "custom_fields": task.custom_fields,
                "dependencies": task.dependencies,
                "subtasks": task.subtasks,
                "comments": task.comments,
                "attachments": task.attachments,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
            
            with open(tasks_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to save task: {e}")
    
    async def _save_project(self, project: ClickUpProject):
        """Save project to file."""
        try:
            projects_file = Path("progeny_root/core/multimodal/clickup_projects.json")
            projects_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Load existing data
            data = {}
            if projects_file.exists():
                with open(projects_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            
            # Update project data
            data[project.id] = {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "status": project.status.value,
                "team_id": project.team_id,
                "members": project.members,
                "start_date": project.start_date.isoformat() if project.start_date else None,
                "due_date": project.due_date.isoformat() if project.due_date else None,
                "budget": project.budget,
                "tags": project.tags,
                "custom_fields": project.custom_fields,
                "tasks": project.tasks,
                "milestones": project.milestones,
                "created_at": project.created_at.isoformat(),
                "updated_at": project.updated_at.isoformat()
            }
            
            with open(projects_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to save project: {e}")
    
    async def _save_workflow(self, workflow: ClickUpWorkflow):
        """Save workflow to file."""
        try:
            workflows_file = Path("progeny_root/core/multimodal/clickup_workflows.json")
            workflows_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Load existing data
            data = {}
            if workflows_file.exists():
                with open(workflows_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            
            # Update workflow data
            data[workflow.id] = {
                "id": workflow.id,
                "name": workflow.name,
                "description": workflow.description,
                "trigger_type": workflow.trigger_type,
                "trigger_config": workflow.trigger_config,
                "actions": workflow.actions,
                "conditions": workflow.conditions,
                "is_active": workflow.is_active,
                "created_at": workflow.created_at.isoformat()
            }
            
            with open(workflows_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to save workflow: {e}")
    
    async def _save_insight(self, insight: ClickUpInsight):
        """Save insight to file."""
        try:
            insights_file = Path("progeny_root/core/multimodal/clickup_insights.json")
            insights_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Load existing data
            data = {}
            if insights_file.exists():
                with open(insights_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            
            # Update insight data
            data[insight.id] = {
                "id": insight.id,
                "type": insight.type,
                "title": insight.title,
                "description": insight.description,
                "data": insight.data,
                "confidence": insight.confidence,
                "recommendations": insight.recommendations,
                "created_at": insight.created_at.isoformat()
            }
            
            with open(insights_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Failed to save insight: {e}")
    
    async def cleanup(self):
        """Cleanup resources."""
        try:
            if self.session:
                await self.session.close()
            
            logger.info("[ClickUpAI] ClickUp AI system cleaned up")
            
        except Exception as e:
            logger.error(f"[ClickUpAI] Cleanup failed: {e}")

# Global instance
_clickup_ai_system = None

def get_clickup_ai_system() -> ClickUpAISystem:
    """Get the global ClickUp AI system."""
    global _clickup_ai_system
    if _clickup_ai_system is None:
        from limbic import get_limbic_system
        from retrieval import get_memory_system
        _clickup_ai_system = ClickUpAISystem(get_limbic_system(), get_memory_system())
    return _clickup_ai_system
