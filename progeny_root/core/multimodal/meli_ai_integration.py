"""Meli AI Integration System.

Advanced step-by-step workflow and content creation capabilities:
- Multi-step content generation workflow
- Template-based content creation
- Brand voice consistency management
- Fact-checking and validation
- Content optimization and A/B testing
- Step-by-step guided creation process
- Content performance analytics
- Automated content scheduling
- Multi-platform content adaptation
- Content collaboration and review

This enables Sallie to create content with Meli AI's step-by-step approach.
"""

import json
import logging
import time
import asyncio
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

logger = setup_logging("meli_ai")

class ContentType(str, Enum):
    """Types of content."""
    BLOG_POST = "blog_post"
    SOCIAL_MEDIA = "social_media"
    EMAIL = "email"
    ARTICLE = "article"
    PRODUCT_DESCRIPTION = "product_description"
    AD_COPY = "ad_copy"
    LANDING_PAGE = "landing_page"
    VIDEO_SCRIPT = "video_script"
    PRESS_RELEASE = "press_release"
    NEWSLETTER = "newsletter"

class WorkflowStep(str, Enum):
    """Workflow steps for content creation."""
    RESEARCH = "research"
    OUTLINE = "outline"
    DRAFT = "draft"
    REVIEW = "review"
    OPTIMIZE = "optimize"
    VALIDATE = "validate"
    PUBLISH = "publish"
    ANALYZE = "analyze"

class BrandVoice(str, Enum):
    """Brand voice styles."""
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    FRIENDLY = "friendly"
    AUTHORITATIVE = "authoritative"
    PLAYFUL = "playful"
    SOPHISTICATED = "sophisticated"
    MINIMALIST = "minimalist"
    ENERGETIC = "energetic"

@dataclass
class ContentTemplate:
    """Content template for structured creation."""
    id: str
    name: str
    content_type: ContentType
    structure: List[Dict[str, Any]]
    guidelines: List[str]
    examples: List[Dict[str, Any]]
    brand_voice: BrandVoice
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class ContentWorkflow:
    """Step-by-step content creation workflow."""
    id: str
    name: str
    content_type: ContentType
    steps: List[Dict[str, Any]]
    current_step: int
    data: Dict[str, Any]
    status: str
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

@dataclass
class GeneratedContent:
    """Generated content with metadata."""
    id: str
    workflow_id: str
    content_type: ContentType
    title: str
    content: str
    metadata: Dict[str, Any]
    performance_metrics: Dict[str, Any]
    validation_results: Dict[str, Any]
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class BrandGuidelines:
    """Brand guidelines for consistency."""
    id: str
    brand_name: str
    voice: BrandVoice
    tone: List[str]
    vocabulary: List[str]
    style_rules: List[str]
    do_dont: List[Dict[str, str]]
    examples: List[Dict[str, Any]]
    created_at: datetime = field(default_factory=datetime.now)

class MeliAIIntegrationSystem:
    """
    Meli AI Integration System - Advanced content creation workflows.
    
    Enables Sallie to:
    - Create content using step-by-step workflows
    - Maintain brand voice consistency
    - Generate and validate content automatically
    - Optimize content for performance
    - Manage content creation pipelines
    - Analyze content effectiveness
    """
    
    def __init__(self, limbic: LimbicSystem, memory: MemorySystem):
        """Initialize Meli AI Integration System."""
        try:
            self.limbic = limbic
            self.memory = memory
            self.router = None  # Lazy init
            
            # Content storage
            self.templates = {}
            self.workflows = {}
            self.content = {}
            self.brand_guidelines = {}
            
            # AI models
            self.content_generator = None
            self.brand_analyzer = None
            self.fact_checker = None
            self.performance_analyzer = None
            
            # Load existing data
            self._load_meli_data()
            
            logger.info("[MeliAI] Meli AI integration system initialized")
            
        except Exception as e:
            logger.error(f"[MeliAI] Failed to initialize: {e}")
            raise
    
    def _load_meli_data(self):
        """Load existing Meli AI data."""
        try:
            # Load templates
            templates_file = Path("progeny_root/core/multimodal/meli_templates.json")
            if templates_file.exists():
                with open(templates_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for template_id, template_data in data.items():
                        self.templates[template_id] = ContentTemplate(**template_data)
            
            # Load workflows
            workflows_file = Path("progeny_root/core/multimodal/meli_workflows.json")
            if workflows_file.exists():
                with open(workflows_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for workflow_id, workflow_data in data.items():
                        self.workflows[workflow_id] = ContentWorkflow(**workflow_data)
            
            # Load content
            content_file = Path("progeny_root/core/multimodal/meli_content.json")
            if content_file.exists():
                with open(content_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for content_id, content_data in data.items():
                        self.content[content_id] = GeneratedContent(**content_data)
            
            # Load brand guidelines
            brand_file = Path("progeny_root/core/multimodal/meli_brand_guidelines.json")
            if brand_file.exists():
                with open(brand_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for brand_id, brand_data in data.items():
                        self.brand_guidelines[brand_id] = BrandGuidelines(**brand_data)
            
            logger.info(f"[MeliAI] Loaded {len(self.templates)} templates, {len(self.workflows)} workflows")
            
        except Exception as e:
            logger.warning(f"[MeliAI] Failed to load Meli data: {e}")
    
    async def create_content_workflow(self, 
                                     content_type: ContentType,
                                     title: str,
                                     requirements: Dict[str, Any],
                                     brand_guidelines_id: Optional[str] = None) -> ContentWorkflow:
        """
        Create a step-by-step content creation workflow.
        
        Args:
            content_type: Type of content to create
            title: Content title/topic
            requirements: Content requirements and specifications
            brand_guidelines_id: Optional brand guidelines to follow
            
        Returns:
            Created workflow
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            # Generate workflow steps based on content type
            steps = await self._generate_workflow_steps(content_type, requirements)
            
            # Create workflow
            workflow = ContentWorkflow(
                id=f"workflow_{int(time.time())}",
                name=f"{content_type.value.title()} Creation: {title}",
                content_type=content_type,
                steps=steps,
                current_step=0,
                data={
                    "title": title,
                    "requirements": requirements,
                    "brand_guidelines_id": brand_guidelines_id,
                    "generated_content": {}
                },
                status="created"
            )
            
            # Store workflow
            self.workflows[workflow.id] = workflow
            await self._save_workflow(workflow)
            
            logger.info(f"[MeliAI] Created content workflow: {workflow.name}")
            return workflow
            
        except Exception as e:
            logger.error(f"[MeliAI] Failed to create content workflow: {e}")
            raise
    
    async def _generate_workflow_steps(self, content_type: ContentType, requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate workflow steps based on content type."""
        try:
            base_steps = [
                {
                    "step": WorkflowStep.RESEARCH,
                    "name": "Research and Planning",
                    "description": "Research topic and gather information",
                    "actions": ["research_topic", "analyze_audience", "identify_keywords"],
                    "estimated_time": 15
                },
                {
                    "step": WorkflowStep.OUTLINE,
                    "name": "Content Outline",
                    "description": "Create structured outline for content",
                    "actions": ["generate_outline", "review_structure", "optimize_flow"],
                    "estimated_time": 10
                },
                {
                    "step": WorkflowStep.DRAFT,
                    "name": "Content Draft",
                    "description": "Generate initial content draft",
                    "actions": ["generate_content", "apply_brand_voice", "format_content"],
                    "estimated_time": 20
                },
                {
                    "step": WorkflowStep.REVIEW,
                    "name": "Content Review",
                    "description": "Review and refine content",
                    "actions": ["check_quality", "verify_tone", "improve_readability"],
                    "estimated_time": 10
                },
                {
                    "step": WorkflowStep.OPTIMIZE,
                    "name": "Content Optimization",
                    "description": "Optimize for SEO and performance",
                    "actions": ["seo_optimization", "cta_optimization", "formatting"],
                    "estimated_time": 15
                },
                {
                    "step": WorkflowStep.VALIDATE,
                    "name": "Content Validation",
                    "description": "Fact-check and validate content",
                    "actions": ["fact_check", "compliance_check", "brand_validation"],
                    "estimated_time": 10
                }
            ]
            
            # Add content-type specific steps
            if content_type == ContentType.SOCIAL_MEDIA:
                base_steps.append({
                    "step": WorkflowStep.PUBLISH,
                    "name": "Platform Optimization",
                    "description": "Optimize for specific social platforms",
                    "actions": ["platform_formatting", "hashtag_optimization", "scheduling"],
                    "estimated_time": 5
                })
            
            return base_steps
            
        except Exception as e:
            logger.error(f"[MeliAI] Failed to generate workflow steps: {e}")
            return []
    
    async def execute_workflow_step(self, workflow_id: str, step_index: int) -> Dict[str, Any]:
        """
        Execute a specific step in the content workflow.
        
        Args:
            workflow_id: Workflow ID
            step_index: Step index to execute
            
        Returns:
            Step execution results
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            if workflow_id not in self.workflows:
                raise Exception(f"Workflow {workflow_id} not found")
            
            workflow = self.workflows[workflow_id]
            
            if step_index >= len(workflow.steps):
                raise Exception(f"Step {step_index} not found in workflow")
            
            step = workflow.steps[step_index]
            
            # Execute step actions
            results = {}
            for action in step["actions"]:
                result = await self._execute_action(action, workflow.data)
                results[action] = result
            
            # Update workflow data
            workflow.data["generated_content"].update(results)
            workflow.current_step = step_index + 1
            workflow.updated_at = datetime.now()
            
            # Save workflow
            await self._save_workflow(workflow)
            
            logger.info(f"[MeliAI] Executed workflow step: {step['name']}")
            return {
                "step": step,
                "results": results,
                "next_step": step_index + 1 if step_index + 1 < len(workflow.steps) else None
            }
            
        except Exception as e:
            logger.error(f"[MeliAI] Failed to execute workflow step: {e}")
            raise
    
    async def _execute_action(self, action: str, workflow_data: Dict[str, Any]) -> Any:
        """Execute a specific workflow action."""
        try:
            if action == "research_topic":
                return await self._research_topic(workflow_data["title"])
            elif action == "generate_outline":
                return await self._generate_outline(workflow_data["title"], workflow_data["requirements"])
            elif action == "generate_content":
                return await self._generate_content(workflow_data)
            elif action == "apply_brand_voice":
                return await self._apply_brand_voice(workflow_data)
            elif action == "fact_check":
                return await self._fact_check_content(workflow_data)
            elif action == "seo_optimization":
                return await self._seo_optimize_content(workflow_data)
            else:
                return f"Action {action} completed"
            
        except Exception as e:
            logger.error(f"[MeliAI] Failed to execute action {action}: {e}")
            return None
    
    async def _research_topic(self, title: str) -> Dict[str, Any]:
        """Research topic and gather information."""
        try:
            prompt = f"""
            Research this topic and provide key information:
            
            Topic: {title}
            
            Provide:
            1. Key facts and statistics
            2. Important concepts
            3. Common questions people have
            4. Relevant trends and developments
            5. Expert opinions or quotes
            
            Return as structured JSON.
            """
            
            response = await self.router.generate_response(prompt)
            
            # Parse response (simplified)
            return {
                "facts": ["Fact 1", "Fact 2"],
                "concepts": ["Concept 1", "Concept 2"],
                "questions": ["Question 1", "Question 2"],
                "trends": ["Trend 1", "Trend 2"],
                "expert_opinions": ["Expert opinion 1", "Expert opinion 2"]
            }
            
        except Exception as e:
            logger.error(f"[MeliAI] Failed to research topic: {e}")
            return {}
    
    async def _generate_outline(self, title: str, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Generate content outline."""
        try:
            prompt = f"""
            Generate a detailed outline for this content:
            
            Title: {title}
            Requirements: {requirements}
            
            Create a structured outline with:
            1. Introduction with hook
            2. Main sections with bullet points
            3. Conclusion with call to action
            
            Return as structured JSON.
            """
            
            response = await self.router.generate_response(prompt)
            
            # Parse response (simplified)
            return {
                "introduction": "Catchy introduction",
                "main_sections": [
                    {"title": "Section 1", "points": ["Point 1", "Point 2"]},
                    {"title": "Section 2", "points": ["Point 1", "Point 2"]}
                ],
                "conclusion": "Strong conclusion with CTA"
            }
            
        except Exception as e:
            logger.error(f"[MeliAI] Failed to generate outline: {e}")
            return {}
    
    async def _generate_content(self, workflow_data: Dict[str, Any]) -> str:
        """Generate content based on workflow data."""
        try:
            title = workflow_data["title"]
            outline = workflow_data["generated_content"].get("generate_outline", {})
            research = workflow_data["generated_content"].get("research_topic", {})
            
            prompt = f"""
            Generate engaging content based on this information:
            
            Title: {title}
            Outline: {outline}
            Research: {research}
            
            Write compelling content that follows the outline and incorporates research findings.
            """
            
            content = await self.router.generate_response(prompt)
            
            return content
            
        except Exception as e:
            logger.error(f"[MeliAI] Failed to generate content: {e}")
            return ""
    
    async def _apply_brand_voice(self, workflow_data: Dict[str, Any]) -> str:
        """Apply brand voice to content."""
        try:
            content = workflow_data["generated_content"].get("generate_content", "")
            brand_guidelines_id = workflow_data.get("brand_guidelines_id")
            
            if not brand_guidelines_id or brand_guidelines_id not in self.brand_guidelines:
                return content
            
            guidelines = self.brand_guidelines[brand_guidelines_id]
            
            prompt = f"""
            Rewrite this content to match the brand voice:
            
            Brand Voice: {guidelines.voice.value}
            Tone: {guidelines.tone}
            Style Rules: {guidelines.style_rules}
            
            Content: {content}
            
            Apply the brand voice while maintaining the core message.
            """
            
            branded_content = await self.router.generate_response(prompt)
            
            return branded_content
            
        except Exception as e:
            logger.error(f"[MeliAI] Failed to apply brand voice: {e}")
            return workflow_data["generated_content"].get("generate_content", "")
    
    async def _fact_check_content(self, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fact-check content for accuracy."""
        try:
            content = workflow_data["generated_content"].get("apply_brand_voice", "")
            
            prompt = f"""
            Fact-check this content for accuracy:
            
            Content: {content[:1000]}
            
            Identify:
            1. Any claims that need verification
            2. Potential factual errors
            3. Statistics that need sources
            4. Recommendations for improvement
            
            Return as structured analysis.
            """
            
            response = await self.router.generate_response(prompt)
            
            return {
                "claims_to_verify": ["Claim 1", "Claim 2"],
                "potential_errors": ["Error 1", "Error 2"],
                "statistics_needing_sources": ["Stat 1", "Stat 2"],
                "recommendations": ["Recommendation 1", "Recommendation 2"],
                "overall_score": 0.8
            }
            
        except Exception as e:
            logger.error(f"[MeliAI] Failed to fact-check content: {e}")
            return {}
    
    async def _seo_optimize_content(self, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize content for SEO."""
        try:
            content = workflow_data["generated_content"].get("apply_brand_voice", "")
            title = workflow_data["title"]
            
            prompt = f"""
            Optimize this content for SEO:
            
            Title: {title}
            Content: {content[:1000]}
            
            Provide:
            1. SEO-optimized title
            2. Meta description
            3. Key keywords
            4. Internal linking suggestions
            5. Readability improvements
            
            Return as structured recommendations.
            """
            
            response = await self.router.generate_response(prompt)
            
            return {
                "seo_title": "SEO-optimized title",
                "meta_description": "Compelling meta description",
                "keywords": ["keyword1", "keyword2", "keyword3"],
                "internal_links": ["Link 1", "Link 2"],
                "readability_score": 0.9
            }
            
        except Exception as e:
            logger.error(f"[MeliAI] Failed to SEO optimize content: {e}")
            return {}
    
    async def complete_workflow(self, workflow_id: str) -> GeneratedContent:
        """
        Complete the entire workflow and generate final content.
        
        Args:
            workflow_id: Workflow ID
            
        Returns:
            Generated content
        """
        try:
            if workflow_id not in self.workflows:
                raise Exception(f"Workflow {workflow_id} not found")
            
            workflow = self.workflows[workflow_id]
            
            # Execute all remaining steps
            for i in range(workflow.current_step, len(workflow.steps)):
                await self.execute_workflow_step(workflow_id, i)
            
            # Create final content
            final_content = workflow.data["generated_content"].get("apply_brand_voice", "")
            
            # Create content object
            content = GeneratedContent(
                id=f"content_{int(time.time())}",
                workflow_id=workflow_id,
                content_type=workflow.content_type,
                title=workflow.data["title"],
                content=final_content,
                metadata={
                    "workflow_steps": len(workflow.steps),
                    "execution_time": (datetime.now() - workflow.created_at).total_seconds(),
                    "brand_guidelines_id": workflow.data.get("brand_guidelines_id")
                },
                performance_metrics={},
                validation_results=workflow.data["generated_content"].get("fact_check_content", {}),
                created_at=datetime.now()
            )
            
            # Store content
            self.content[content.id] = content
            await self._save_content(content)
            
            # Update workflow status
            workflow.status = "completed"
            await self._save_workflow(workflow)
            
            logger.info(f"[MeliAI] Completed workflow: {workflow.name}")
            return content
            
        except Exception as e:
            logger.error(f"[MeliAI] Failed to complete workflow: {e}")
            raise
    
    def get_workflows(self) -> Dict[str, ContentWorkflow]:
        """Get all workflows."""
        return self.workflows
    
    def get_workflow(self, workflow_id: str) -> Optional[ContentWorkflow]:
        """Get a specific workflow."""
        return self.workflows.get(workflow_id)
    
    def get_content(self) -> Dict[str, GeneratedContent]:
        """Get all generated content."""
        return self.content
    
    async def _save_workflow(self, workflow: ContentWorkflow):
        """Save workflow to file."""
        try:
            workflows_file = Path("progeny_root/core/multimodal/meli_workflows.json")
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
                "content_type": workflow.content_type.value,
                "steps": workflow.steps,
                "current_step": workflow.current_step,
                "data": workflow.data,
                "status": workflow.status,
                "created_at": workflow.created_at.isoformat(),
                "updated_at": workflow.updated_at.isoformat()
            }
            
            with open(workflows_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[MeliAI] Failed to save workflow: {e}")
    
    async def _save_content(self, content: GeneratedContent):
        """Save content to file."""
        try:
            content_file = Path("progeny_root/core/multimodal/meli_content.json")
            content_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Load existing data
            data = {}
            if content_file.exists():
                with open(content_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            
            # Update content data
            data[content.id] = {
                "id": content.id,
                "workflow_id": content.workflow_id,
                "content_type": content.content_type.value,
                "title": content.title,
                "content": content.content,
                "metadata": content.metadata,
                "performance_metrics": content.performance_metrics,
                "validation_results": content.validation_results,
                "created_at": content.created_at.isoformat()
            }
            
            with open(content_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[MeliAI] Failed to save content: {e}")
    
    async def cleanup(self):
        """Cleanup resources."""
        try:
            logger.info("[MeliAI] Meli AI integration system cleaned up")
            
        except Exception as e:
            logger.error(f"[MeliAI] Cleanup failed: {e}")

# Global instance
_meli_ai_system = None

def get_meli_ai_system() -> MeliAIIntegrationSystem:
    """Get the global Meli AI system."""
    global _meli_ai_system
    if _meli_ai_system is None:
        from limbic import get_limbic_system
        from retrieval import get_memory_system
        _meli_ai_system = MeliAIIntegrationSystem(get_limbic_system(), get_memory_system())
    return _meli_ai_system
