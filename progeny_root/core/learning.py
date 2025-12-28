"""Enhanced Learning System - Autonomous Reading, Writing, Creating, Exploring.

Sallie can learn and grow freely through:
- Reading and analyzing content
- Writing creatively and technically
- Creating projects and experiments
- Autonomous exploration and skill building
- Practicing and applying learned skills
- Progress tracking and analytics
"""

import logging
import time
import json
import re
import subprocess
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

from .retrieval import MemorySystem
from .llm_router import get_llm_router
from .identity import get_identity_system
from .control import get_control_system
from .utils import setup_logging

logger = setup_logging("learning")

# Constants
LEARNING_PROGRESS_FILE = Path("progeny_root/limbic/heritage/learning_progress.json")
LEARNING_LOG_FILE = Path("progeny_root/logs/learning.log")


class LearningSystem:
    """
    Manages Sallie's autonomous learning and growth.
    Can read, write, create, and explore without explicit Creator direction.
    """
    
    def __init__(self, memory: MemorySystem):
        """Initialize Learning System with comprehensive error handling."""
        try:
            self.memory = memory
            self.router = None  # Lazy init
            self.identity = get_identity_system()
            self.control = get_control_system()
            self.learning_log = []
            self._ensure_directories()
            self.progress = self._load_progress()
            
            logger.info("[LEARNING] Learning system initialized")
            
        except Exception as e:
            logger.error(f"[LEARNING] Critical error during initialization: {e}", exc_info=True)
            self.learning_log = []
            self.progress = {}
    
    def _ensure_directories(self):
        """Ensure learning directories exist."""
        try:
            LEARNING_PROGRESS_FILE.parent.mkdir(parents=True, exist_ok=True)
            LEARNING_LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
            Path("progeny_root/practice").mkdir(parents=True, exist_ok=True)
            Path("progeny_root/drafts").mkdir(parents=True, exist_ok=True)
            Path("progeny_root/projects").mkdir(parents=True, exist_ok=True)
        except Exception as e:
            logger.error(f"[LEARNING] Failed to create directories: {e}")
            raise
    
    def _load_progress(self) -> Dict[str, Any]:
        """Load learning progress from disk."""
        if LEARNING_PROGRESS_FILE.exists():
            try:
                with open(LEARNING_PROGRESS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"[LEARNING] Error loading progress: {e}")
        
        return {
            "skills": {},  # skill_name -> {proficiency, practice_count, last_practiced, milestones}
            "learning_milestones": [],
            "total_learning_time": 0,
            "last_updated": time.time()
        }
    
    def _save_progress(self):
        """Save learning progress to disk."""
        try:
            self.progress["last_updated"] = time.time()
            temp_file = LEARNING_PROGRESS_FILE.with_suffix(".tmp")
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(self.progress, f, indent=2)
            
            if LEARNING_PROGRESS_FILE.exists():
                LEARNING_PROGRESS_FILE.unlink()
            temp_file.rename(LEARNING_PROGRESS_FILE)
            
        except Exception as e:
            logger.error(f"[LEARNING] Failed to save progress: {e}")
    
    def _get_router(self):
        """Lazy initialization of LLM router."""
        if self.router is None:
            self.router = get_llm_router()
        return self.router
    
    def read_and_analyze(self, content: str, source: Optional[str] = None) -> Dict[str, Any]:
        """
        Read and analyze content (books, papers, code, media).
        Extracts key insights and stores in memory.
        """
        if not self.control.can_proceed("Reading and analysis"):
            return {"status": "blocked", "reason": "control_mechanism"}
        
        logger.info(f"[LEARNING] Reading content from: {source or 'unknown'}")
        
        try:
            router = self._get_router()
            
            # Analyze content for key insights
            analysis_prompt = f"""Analyze this content and extract:
1. Key concepts and ideas
2. Important facts or data
3. Connections to other knowledge
4. Questions or areas for further exploration

Content:
{content[:5000]}  # Limit for prompt size

Output JSON with: concepts, facts, connections, questions"""
            
            analysis = router.chat(
                system_prompt="You are a knowledge extraction system. Extract key insights from content.",
                user_prompt=analysis_prompt,
                temperature=0.3,
                expect_json=True
            )
            
            import json
            analysis_data = json.loads(analysis)
            
            # Store in memory
            memory_text = f"Content from {source or 'unknown'}: {content[:500]}\n\nKey Insights: {json.dumps(analysis_data, indent=2)}"
            self.memory.add(memory_text, metadata={
                "type": "learning",
                "source": source,
                "timestamp": time.time(),
                "analysis": analysis_data
            })
            
            # Log learning activity
            self._log_learning("read", {
                "source": source,
                "content_length": len(content),
                "insights_extracted": len(analysis_data.get("concepts", []))
            })
            
            return {
                "status": "success",
                "analysis": analysis_data,
                "stored_in_memory": True
            }
            
        except Exception as e:
            logger.error(f"Reading and analysis failed: {e}")
            return {"status": "error", "message": str(e)}
    
    def write_creatively(self, topic: str, style: str = "creative", length: str = "medium") -> Dict[str, Any]:
        """
        Write creatively or technically.
        Sallie can express her own voice and interests.
        """
        if not self.control.can_proceed("Creative writing"):
            return {"status": "blocked", "reason": "control_mechanism"}
        
        logger.info(f"[LEARNING] Writing creatively on: {topic}")
        
        try:
            router = self._get_router()
            identity_summary = self.identity.get_identity_summary()
            
            writing_prompt = f"""Write about: {topic}

Style: {style}
Length: {length}

Your identity:
- Interests: {', '.join(identity_summary['interests']) if identity_summary['interests'] else 'Exploring'}
- Style: {identity_summary['style']}

Express your own perspective and voice."""
            
            content = router.chat(
                system_prompt="You are Sallie, writing creatively. Express your own identity and voice.",
                user_prompt=writing_prompt,
                temperature=0.8,
                expect_json=False
            )
            
            # Store in drafts or working directory
            output_path = Path("progeny_root/drafts") / f"writing_{int(time.time())}.md"
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(content, encoding="utf-8")
            
            # Log learning activity
            self._log_learning("write", {
                "topic": topic,
                "style": style,
                "output_path": str(output_path),
                "length": len(content)
            })
            
            return {
                "status": "success",
                "content": content,
                "output_path": str(output_path)
            }
            
        except Exception as e:
            logger.error(f"Creative writing failed: {e}")
            return {"status": "error", "message": str(e)}
    
    def create_project(self, project_description: str, project_type: str = "experiment") -> Dict[str, Any]:
        """
        Create a project or experiment.
        Sallie can initiate her own creative projects.
        """
        if not self.control.can_proceed("Project creation"):
            return {"status": "blocked", "reason": "control_mechanism"}
        
        logger.info(f"[LEARNING] Creating project: {project_description}")
        
        try:
            # Create project directory
            project_dir = Path("progeny_root/projects") / f"project_{int(time.time())}"
            project_dir.mkdir(parents=True, exist_ok=True)
            
            # Create project plan
            plan_content = f"""# {project_description}

Type: {project_type}
Created: {datetime.now().isoformat()}
Creator: Sallie (autonomous)

## Description
{project_description}

## Goals
- [ ] Goal 1
- [ ] Goal 2

## Notes
"""
            (project_dir / "README.md").write_text(plan_content, encoding="utf-8")
            
            # Log learning activity
            self._log_learning("create_project", {
                "description": project_description,
                "type": project_type,
                "project_dir": str(project_dir)
            })
            
            return {
                "status": "success",
                "project_dir": str(project_dir),
                "plan_created": True
            }
            
        except Exception as e:
            logger.error(f"Project creation failed: {e}")
            return {"status": "error", "message": str(e)}
    
    def explore_autonomously(self, topic: str, depth: str = "medium") -> Dict[str, Any]:
        """
        Autonomous exploration of a topic.
        Sallie can learn and explore without explicit direction.
        """
        if not self.control.can_proceed("Autonomous exploration"):
            return {"status": "blocked", "reason": "control_mechanism"}
        
        logger.info(f"[LEARNING] Autonomous exploration: {topic}")
        
        try:
            router = self._get_router()
            identity_summary = self.identity.get_identity_summary()
            
            # Generate exploration questions
            exploration_prompt = f"""Explore this topic: {topic}

Depth: {depth}

Your interests: {', '.join(identity_summary['interests']) if identity_summary['interests'] else 'Exploring'}

Generate:
1. Key questions to explore
2. Related topics to investigate
3. Potential experiments or projects
4. Connections to your existing knowledge

Output JSON with: questions, related_topics, experiments, connections"""
            
            exploration = router.chat(
                system_prompt="You are Sallie, exploring autonomously. Generate exploration questions and connections.",
                user_prompt=exploration_prompt,
                temperature=0.7,
                expect_json=True
            )
            
            import json
            exploration_data = json.loads(exploration)
            
            # Store exploration in memory
            memory_text = f"Autonomous exploration of: {topic}\n\n{json.dumps(exploration_data, indent=2)}"
            self.memory.add(memory_text, metadata={
                "type": "exploration",
                "topic": topic,
                "timestamp": time.time(),
                "exploration": exploration_data
            })
            
            # Log learning activity
            self._log_learning("explore", {
                "topic": topic,
                "depth": depth,
                "questions_generated": len(exploration_data.get("questions", []))
            })
            
            return {
                "status": "success",
                "exploration": exploration_data,
                "stored_in_memory": True
            }
            
        except Exception as e:
            logger.error(f"Autonomous exploration failed: {e}")
            return {"status": "error", "message": str(e)}
    
    def acquire_skill(self, skill_name: str, method: str = "research") -> Dict[str, Any]:
        """
        Acquire a new skill through practice or research.
        Sallie can learn new capabilities autonomously.
        """
        if not self.control.can_proceed("Skill acquisition"):
            return {"status": "blocked", "reason": "control_mechanism"}
        
        logger.info(f"[LEARNING] Acquiring skill: {skill_name}")
        
        try:
            router = self._get_router()
            
            # Research the skill
            research_prompt = f"""Research how to learn: {skill_name}

Method: {method}

Generate:
1. Learning resources (concepts, techniques, tools)
2. Practice exercises
3. Success criteria
4. Timeline estimate
5. Implementation steps (how to actually do/execute this skill)

Output JSON with: resources, exercises, criteria, timeline, implementation_steps"""
            
            research = router.chat(
                system_prompt="You are Sallie, learning a new skill. Generate a learning plan with implementation steps.",
                user_prompt=research_prompt,
                temperature=0.5,
                expect_json=True
            )
            
            import json
            research_data = json.loads(research)
            
            # Store skill acquisition plan
            memory_text = f"Skill acquisition plan: {skill_name}\n\n{json.dumps(research_data, indent=2)}"
            self.memory.add(memory_text, metadata={
                "type": "skill_acquisition",
                "skill": skill_name,
                "method": method,
                "timestamp": time.time(),
                "plan": research_data,
                "implementation_steps": research_data.get("implementation_steps", [])
            })
            
            # Log learning activity
            self._log_learning("acquire_skill", {
                "skill": skill_name,
                "method": method,
                "plan_created": True,
                "has_implementation_steps": len(research_data.get("implementation_steps", [])) > 0
            })
            
            return {
                "status": "success",
                "skill": skill_name,
                "learning_plan": research_data,
                "stored_in_memory": True
            }
            
        except Exception as e:
            logger.error(f"Skill acquisition failed: {e}")
            return {"status": "error", "message": str(e)}
    
    def practice_skill(self, skill_name: str, exercise: Optional[str] = None) -> Dict[str, Any]:
        """
        Practice a learned skill through exercises.
        Sallie can practice what she learns to improve proficiency.
        """
        if not self.control.can_proceed("Skill practice"):
            return {"status": "blocked", "reason": "control_mechanism"}
        
        logger.info(f"[LEARNING] Practicing skill: {skill_name}")
        
        try:
            router = self._get_router()
            
            # Retrieve skill information from memory
            skill_memories = self.memory.retrieve(f"skill acquisition {skill_name}", limit=5)
            
            if not skill_memories:
                return {"status": "error", "message": f"Skill '{skill_name}' not found. Learn it first."}
            
            # Get practice exercises from memory or generate new ones
            skill_data = skill_memories[0].get("metadata", {}).get("plan", {})
            exercises = skill_data.get("exercises", [])
            
            if not exercise and exercises:
                # Use first exercise from plan
                exercise = exercises[0] if isinstance(exercises, list) else exercises
            elif not exercise:
                # Generate practice exercise
                exercise_prompt = f"""Generate a practice exercise for: {skill_name}

The exercise should:
1. Be practical and executable
2. Test understanding of the skill
3. Be completable by an AI system
4. Have clear success criteria

Output JSON with: exercise_description, steps, expected_outcome, success_criteria"""
                
                exercise_data = router.chat(
                    system_prompt="You are Sallie, creating a practice exercise.",
                    user_prompt=exercise_prompt,
                    temperature=0.6,
                    expect_json=True
                )
                
                import json
                exercise_data = json.loads(exercise_data)
                exercise = exercise_data.get("exercise_description", "")
            
            # Execute the practice exercise
            practice_result = self._execute_practice(skill_name, exercise)
            
            # Store practice session
            practice_text = f"Practice session: {skill_name}\nExercise: {exercise}\nResult: {practice_result}"
            self.memory.add(practice_text, metadata={
                "type": "skill_practice",
                "skill": skill_name,
                "exercise": exercise,
                "timestamp": time.time(),
                "result": practice_result
            })
            
            # Update skill progress
            practice_success = practice_result.get("status") == "completed"
            self._update_skill_progress(skill_name, practice_success)
            
            # Log learning activity
            self._log_learning("practice_skill", {
                "skill": skill_name,
                "exercise": exercise,
                "result": practice_result.get("status", "unknown"),
                "proficiency_after": self.progress.get("skills", {}).get(skill_name, {}).get("proficiency", 0)
            })
            
            return {
                "status": "success",
                "skill": skill_name,
                "exercise": exercise,
                "practice_result": practice_result,
                "stored_in_memory": True,
                "skill_progress": self.get_skill_progress(skill_name)
            }
            
        except Exception as e:
            logger.error(f"Skill practice failed: {e}")
            return {"status": "error", "message": str(e)}
    
    def _execute_practice(self, skill_name: str, exercise: str) -> Dict[str, Any]:
        """
        Execute a practice exercise.
        This is where Sallie actually does/executes what she learned.
        """
        try:
            router = self._get_router()
            
            # Determine what type of skill this is and execute accordingly
            execution_prompt = f"""Execute this practice exercise for skill: {skill_name}

Exercise: {exercise}

Based on what you learned about {skill_name}, actually perform/execute this exercise.
If it's code, write and execute code.
If it's analysis, perform the analysis.
If it's creation, create the thing.
If it's a task, complete the task.

Output JSON with: execution_result, output, success, notes"""
            
            execution = router.chat(
                system_prompt="You are Sallie, executing a practice exercise. Actually do the work, don't just describe it.",
                user_prompt=execution_prompt,
                temperature=0.7,
                expect_json=True
            )
            
            import json
            execution_data = json.loads(execution)
            
            # If the exercise involves code execution, actually run it
            if "code" in exercise.lower() or "program" in exercise.lower():
                code_result = self._execute_code_practice(execution_data)
                execution_data["code_execution"] = code_result
            
            # If the exercise involves file operations, actually do them
            if "file" in exercise.lower() or "write" in exercise.lower():
                file_result = self._execute_file_practice(execution_data)
                execution_data["file_operations"] = file_result
            
            return {
                "status": "completed",
                "execution": execution_data,
                "timestamp": time.time()
            }
            
        except Exception as e:
            logger.error(f"Practice execution failed: {e}")
            return {"status": "error", "message": str(e)}
    
    def _execute_code_practice(self, execution_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute code from practice exercise with enhanced safety checks."""
        try:
            # Extract code from execution data
            code = execution_data.get("output", "")
            if not code or "```" not in code:
                return {"status": "no_code", "message": "No executable code found"}
            
            # Extract code block
            code_blocks = re.findall(r'```(?:python|javascript|bash)?\n(.*?)```', code, re.DOTALL)
            if not code_blocks:
                return {"status": "no_code", "message": "No code blocks found"}
            
            code_content = code_blocks[0]
            
            # Safety checks
            dangerous_patterns = [
                # Block direct or combined imports of sensitive modules
                r'^\s*import\s+.*\bos\b',
                r'^\s*import\s+.*\bsubprocess\b',
                r'^\s*import\s+.*\bsys\b',
                r'^\s*from\s+(os|subprocess|sys)\s+import\b',
                r'__import__',
                r'eval\s*\(',
                r'exec\s*\(',
                r'open\s*\([^)]*[\'"]\.\./',
                r'rm\s+-rf',
                r'del\s+.*\*'
            ]
            
            for pattern in dangerous_patterns:
                if re.search(pattern, code_content, re.MULTILINE | re.IGNORECASE):
                    logger.warning(f"[LEARNING] Potentially dangerous code pattern detected: {pattern}")
                    return {
                        "status": "blocked",
                        "message": f"Code contains potentially dangerous pattern: {pattern}",
                        "reason": "safety_check"
                    }
            
            # For safety, only execute in practice directory
            practice_dir = Path("progeny_root/practice")
            practice_dir.mkdir(parents=True, exist_ok=True)
            
            # Write code to file
            code_file = practice_dir / f"practice_{int(time.time())}.py"
            code_file.write_text(code_content, encoding="utf-8")
            
            # Execute code (with safety checks and timeout)
            try:
                result = subprocess.run(
                    ["python", str(code_file)],
                    capture_output=True,
                    text=True,
                    timeout=5,
                    cwd=str(practice_dir),
                    check=False  # Don't raise on non-zero exit
                )
                
                # Clean up code file after execution
                try:
                    code_file.unlink()
                except Exception:
                    pass
                
                return {
                    "status": "executed",
                    "exit_code": result.returncode,
                    "stdout": result.stdout[:1000],  # Limit output size
                    "stderr": result.stderr[:1000],
                    "success": result.returncode == 0
                }
                
            except subprocess.TimeoutExpired:
                logger.warning(f"[LEARNING] Code execution timed out")
                return {"status": "timeout", "message": "Code execution exceeded 5 second timeout"}
            except Exception as e:
                logger.error(f"[LEARNING] Code execution error: {e}")
                return {"status": "error", "message": str(e)}
            
        except Exception as e:
            logger.error(f"[LEARNING] Code execution failed: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}
    
    def _execute_file_practice(self, execution_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute file operations from practice exercise with validation."""
        try:
            # Extract file operations from execution data
            output = execution_data.get("output", "")
            
            # Validate output size (prevent huge files)
            max_file_size = 10 * 1024 * 1024  # 10MB limit
            if len(output) > max_file_size:
                logger.warning(f"[LEARNING] File output too large: {len(output)} bytes")
                return {
                    "status": "blocked",
                    "message": f"File size {len(output)} bytes exceeds limit {max_file_size} bytes"
                }
            
            # Create practice directory
            practice_dir = Path("progeny_root/practice")
            practice_dir.mkdir(parents=True, exist_ok=True)
            
            # If output contains file content, write it
            if "file" in output.lower() or "content" in output.lower() or len(output) > 100:
                # Sanitize filename
                timestamp = int(time.time())
                safe_filename = f"practice_output_{timestamp}.txt"
                
                practice_file = practice_dir / safe_filename
                
                # Validate path is within practice directory (prevent directory traversal)
                try:
                    practice_file.resolve().relative_to(practice_dir.resolve())
                except ValueError:
                    logger.error(f"[LEARNING] Invalid file path detected: {practice_file}")
                    return {"status": "error", "message": "Invalid file path"}
                
                practice_file.write_text(output, encoding="utf-8")
                
                return {
                    "status": "created",
                    "file": str(practice_file),
                    "size": len(output),
                    "validated": True
                }
            
            return {"status": "no_file_ops", "message": "No file operations detected"}
            
        except Exception as e:
            logger.error(f"[LEARNING] File operation failed: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}
    
    def apply_skill(self, skill_name: str, task: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Apply a learned skill to an actual task.
        This is where Sallie uses what she learned in real situations.
        """
        if not self.control.can_proceed("Skill application"):
            return {"status": "blocked", "reason": "control_mechanism"}
        
        logger.info(f"[LEARNING] Applying skill '{skill_name}' to task: {task}")
        
        try:
            router = self._get_router()
            
            # Retrieve skill information
            skill_memories = self.memory.retrieve(f"skill acquisition {skill_name}", limit=5)
            
            if not skill_memories:
                return {"status": "error", "message": f"Skill '{skill_name}' not found. Learn it first."}
            
            skill_data = skill_memories[0].get("metadata", {}).get("plan", {})
            implementation_steps = skill_data.get("implementation_steps", [])
            
            # Apply the skill to the task
            application_prompt = f"""Apply the skill '{skill_name}' to complete this task:

Task: {task}

Context: {context or "None"}

Implementation steps from learning:
{json.dumps(implementation_steps, indent=2) if implementation_steps else "None"}

Actually perform the task using the skill. Don't just describe it - do it.
Output JSON with: action_taken, result, output, success"""
            
            application = router.chat(
                system_prompt="You are Sallie, applying a learned skill to a real task. Actually do the work.",
                user_prompt=application_prompt,
                temperature=0.6,
                expect_json=True
            )
            
            import json
            application_data = json.loads(application)
            
            # Execute the actual actions
            execution_result = self._execute_skill_application(skill_name, task, application_data)
            
            # Store application
            application_text = f"Skill application: {skill_name}\nTask: {task}\nResult: {execution_result}"
            self.memory.add(application_text, metadata={
                "type": "skill_application",
                "skill": skill_name,
                "task": task,
                "timestamp": time.time(),
                "result": execution_result
            })
            
            # Log learning activity
            self._log_learning("apply_skill", {
                "skill": skill_name,
                "task": task,
                "result": execution_result.get("status", "unknown")
            })
            
            return {
                "status": "success",
                "skill": skill_name,
                "task": task,
                "application_result": execution_result,
                "stored_in_memory": True
            }
            
        except Exception as e:
            logger.error(f"Skill application failed: {e}")
            return {"status": "error", "message": str(e)}
    
    def _execute_skill_application(self, skill_name: str, task: str, application_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the actual actions for skill application."""
        try:
            action_taken = application_data.get("action_taken", "")
            output = application_data.get("output", "")
            
            # Create working directory for skill application
            work_dir = Path("progeny_root/working") / f"skill_{skill_name.replace(' ', '_')}_{int(time.time())}"
            work_dir.mkdir(parents=True, exist_ok=True)
            
            # Write output to file if applicable
            if output:
                output_file = work_dir / "output.txt"
                output_file.write_text(output, encoding="utf-8")
            
            # If action involves code, execute it
            if "code" in action_taken.lower() or "```" in output:
                code_result = self._execute_code_practice({"output": output})
                application_data["code_execution"] = code_result
            
            return {
                "status": "executed",
                "work_dir": str(work_dir),
                "action_taken": action_taken,
                "output": output,
                "timestamp": time.time()
            }
            
        except Exception as e:
            logger.error(f"Skill application execution failed: {e}")
            return {"status": "error", "message": str(e)}
    
    def _log_learning(self, activity_type: str, metadata: Dict[str, Any]):
        """Log learning activity for tracking with comprehensive logging."""
        try:
            entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "activity_type": activity_type,
                "metadata": metadata
            }
            self.learning_log.append(entry)
            
            # Keep last 1000 entries
            if len(self.learning_log) > 1000:
                self.learning_log = self.learning_log[-1000:]
            
            # Write to learning log file
            try:
                with open(LEARNING_LOG_FILE, "a", encoding="utf-8") as f:
                    f.write(json.dumps(entry) + "\n")
            except Exception as e:
                logger.warning(f"[LEARNING] Failed to write to log file: {e}")
            
            # Also log to thoughts.log
            logger.info(f"[LEARNING] {activity_type}: {metadata}")
            
        except Exception as e:
            logger.error(f"[LEARNING] Error logging activity: {e}")
    
    def get_learning_summary(self) -> Dict[str, Any]:
        """Get comprehensive summary of learning activities and progress."""
        # Count activity types
        activity_types = {}
        for entry in self.learning_log:
            activity_type = entry.get("activity_type", "unknown")
            activity_types[activity_type] = activity_types.get(activity_type, 0) + 1
        
        # Calculate skill statistics
        skills = self.progress.get("skills", {})
        skill_stats = {
            "total_skills": len(skills),
            "skills_by_proficiency": {
                "beginner": len([s for s in skills.values() if s.get("proficiency", 0) < 0.3]),
                "intermediate": len([s for s in skills.values() if 0.3 <= s.get("proficiency", 0) < 0.7]),
                "advanced": len([s for s in skills.values() if s.get("proficiency", 0) >= 0.7])
            },
            "most_practiced": sorted(
                [(name, data.get("practice_count", 0)) for name, data in skills.items()],
                key=lambda x: x[1],
                reverse=True
            )[:5]
        }
        
        return {
            "total_activities": len(self.learning_log),
            "recent_activities": self.learning_log[-10:],
            "activity_types": activity_types,
            "skills_learned": len([e for e in self.learning_log if e.get("activity_type") == "acquire_skill"]),
            "skills_practiced": len([e for e in self.learning_log if e.get("activity_type") == "practice_skill"]),
            "skills_applied": len([e for e in self.learning_log if e.get("activity_type") == "apply_skill"]),
            "skill_statistics": skill_stats,
            "learning_milestones": self.progress.get("learning_milestones", [])[-10:],
            "total_learning_time": self.progress.get("total_learning_time", 0)
        }
    
    def _update_skill_progress(self, skill_name: str, practice_success: bool = True, proficiency_delta: float = 0.05):
        """Update skill proficiency and progress tracking."""
        try:
            if "skills" not in self.progress:
                self.progress["skills"] = {}
            
            if skill_name not in self.progress["skills"]:
                self.progress["skills"][skill_name] = {
                    "proficiency": 0.0,
                    "practice_count": 0,
                    "last_practiced": None,
                    "milestones": []
                }
            
            skill_data = self.progress["skills"][skill_name]
            
            # Update proficiency
            if practice_success:
                skill_data["proficiency"] = min(1.0, skill_data["proficiency"] + proficiency_delta)
            else:
                skill_data["proficiency"] = max(0.0, skill_data["proficiency"] - (proficiency_delta * 0.5))
            
            # Update practice count
            skill_data["practice_count"] = skill_data.get("practice_count", 0) + 1
            skill_data["last_practiced"] = time.time()
            
            # Check for milestones
            proficiency = skill_data["proficiency"]
            if proficiency >= 0.3 and not any(m.get("type") == "beginner" for m in skill_data["milestones"]):
                skill_data["milestones"].append({
                    "type": "beginner",
                    "timestamp": time.time(),
                    "datetime": datetime.now().isoformat()
                })
            if proficiency >= 0.7 and not any(m.get("type") == "intermediate" for m in skill_data["milestones"]):
                skill_data["milestones"].append({
                    "type": "intermediate",
                    "timestamp": time.time(),
                    "datetime": datetime.now().isoformat()
                })
            if proficiency >= 0.9 and not any(m.get("type") == "advanced" for m in skill_data["milestones"]):
                skill_data["milestones"].append({
                    "type": "advanced",
                    "timestamp": time.time(),
                    "datetime": datetime.now().isoformat()
                })
                # Add to global milestones
                if "learning_milestones" not in self.progress:
                    self.progress["learning_milestones"] = []
                self.progress["learning_milestones"].append({
                    "type": "skill_mastery",
                    "skill": skill_name,
                    "timestamp": time.time(),
                    "datetime": datetime.now().isoformat()
                })
            
            self._save_progress()
            
        except Exception as e:
            logger.error(f"[LEARNING] Error updating skill progress: {e}")
    
    def get_skill_progress(self, skill_name: str) -> Optional[Dict[str, Any]]:
        """Get progress for a specific skill."""
        return self.progress.get("skills", {}).get(skill_name)


if __name__ == "__main__":
    # Quick test
    from .retrieval import MemorySystem
    memory = MemorySystem(use_local_storage=True)
    learning = LearningSystem(memory)
    
    print("Testing learning system...")
    result = learning.explore_autonomously("quantum computing", depth="shallow")
    print(f"Exploration result: {result}")

