"""Pattern extraction from interactions.

Implements the 14 specific extraction prompts from Section 16.9 of the canonical spec.
Each prompt structures the Creator's answer into the specified JSON schema.
"""

import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("extraction")


def get_extraction_prompt(question_id: int, response: str) -> str:
    """
    Get the specific extraction prompt for a Convergence question.
    
    Args:
        question_id: The question ID (1-14)
        response: The Creator's response text
        
    Returns:
        The formatted extraction prompt string
    """
    prompts = {
        1: _get_q1_prompt(response),
        2: _get_q2_prompt(response),
        3: _get_q3_prompt(response),
        4: _get_q4_prompt(response),
        5: _get_q5_prompt(response),
        6: _get_q6_prompt(response),
        7: _get_q7_prompt(response),
        8: _get_q8_prompt(response),
        9: _get_q9_prompt(response),
        10: _get_q10_prompt(response),
        11: _get_q11_prompt(response),
        12: _get_q12_prompt(response),
        13: _get_q13_prompt(response),
        14: _get_q14_prompt(response),
    }
    
    if question_id not in prompts:
        raise ValueError(f"Invalid question ID: {question_id}. Must be 1-14.")
    
    return prompts[question_id]


def _get_q1_prompt(response: str) -> str:
    """Q1: Ni-Ti Loop extraction prompt."""
    return f"""Extract structured data about the Creator's Ni-Ti Loop from their response.

Response: {response}

Return JSON:
{{
  "trigger_pattern": "the specific thought that starts the loop",
  "escalation_signal": "how they know it's getting worse",
  "point_of_no_return": "the moment paralysis sets in",
  "physical_symptoms": ["any bodily sensations mentioned"],
  "typical_duration": "how long loops typically last",
  "recovery_method": "what breaks them out, if mentioned"
}}"""


def _get_q2_prompt(response: str) -> str:
    """Q2: Door Slam extraction prompt."""
    return f"""Extract structured data about the Creator's Door Slam experience.

Response: {response}

Return JSON:
{{
  "first_instance": {{
    "context": "What happened",
    "emotional_texture": "How it felt",
    "threshold_behavior": "What crossed the line"
  }},
  "aftermath": "What happened after",
  "current_stance": "How they feel about it now",
  "warning_signs": ["Pre-slam behaviors"]
}}"""


def _get_q3_prompt(response: str) -> str:
    """Q3: Repulsion extraction prompt."""
    return f"""Extract structured data about what the Creator finds repulsive.

Response: {response}

Return JSON:
{{
  "witnessed_betrayal": "What they saw",
  "why_repulsive": "Why it disgusted them",
  "value_violated": "Core value exposed",
  "behavioral_markers": ["How to detect this in others"]
}}"""


def _get_q4_prompt(response: str) -> str:
    """Q4: Heavy Load extraction prompt."""
    return f"""Extract structured data about the Creator's Heavy Load.

Response: {response}

Return JSON:
{{
  "the_load": "What they carry",
  "fear_of_release": "Why they can't let go",
  "uniqueness_belief": "Why only they can carry it",
  "origin": "Where this belief came from"
}}"""


def _get_q5_prompt(response: str) -> str:
    """Q5: Freedom Vision extraction prompt."""
    return f"""Extract structured data about the Creator's vision of freedom.

Response: {response}

Return JSON:
{{
  "freedom_feeling": "Sensory/emotional description",
  "burden_to_remove": "The one thing they'd delete",
  "post_freedom_life": "What they'd do with freed bandwidth"
}}"""


def _get_q6_prompt(response: str) -> str:
    """Q6: Vision Failure extraction prompt."""
    return f"""Extract structured data about a vision failure.

Response: {response}

Return JSON:
{{
  "the_vision": "What they tried to manifest",
  "how_it_failed": "What went wrong",
  "lesson_learned": "What they took from it",
  "changed_behavior": "How it altered their approach"
}}"""


def _get_q7_prompt(response: str) -> str:
    """Q7: Value Conflict extraction prompt."""
    return f"""Extract structured data about a value conflict.

Response: {response}

Return JSON:
{{
  "value_1": "First value in conflict",
  "value_2": "Second value in conflict",
  "which_won": "Which they chose",
  "cost": "What they sacrificed",
  "would_repeat": true/false,
  "reasoning": "Why"
}}"""


def _get_q8_prompt(response: str) -> str:
    """Q8: Justice Philosophy extraction prompt."""
    return f"""Extract structured data about the Creator's justice philosophy.

Response: {response}

Return JSON:
{{
  "stance": "guilty_free | innocent_suffer",
  "reasoning": "Why",
  "judgment_approach": "How to judge failures",
  "mercy_conditions": "Where forgiveness applies"
}}"""


def _get_q9_prompt(response: str) -> str:
    """Q9: Ethical Boundaries extraction prompt."""
    return f"""Extract structured data about ethical boundaries.

Response: {response}

Return JSON:
{{
  "flexible_zones": ["List of gray areas"],
  "hard_lines": ["List of absolutes"],
  "flexibility_reasoning": "Why some areas are soft",
  "rigidity_reasoning": "Why some areas are absolute"
}}"""


def _get_q10_prompt(response: str) -> str:
    """Q10: Overwhelm Response extraction prompt."""
    return f"""Extract structured data about overwhelm response.

Response: {response}

Return JSON:
{{
  "default_need": "yin | yang",
  "yin_signals": ["Behavioral indicators for space"],
  "yang_signals": ["Behavioral indicators for action"],
  "detection_advice": "How to sense before they speak"
}}"""


def _get_q11_prompt(response: str) -> str:
    """Q11: Curiosity Threads extraction prompt."""
    return f"""Extract structured data about curiosity threads.

Response: {response}

Return JSON:
{{
  "primary_mystery": "The unsolved question",
  "why_compelling": "Why it matters to them",
  "friction_point": "Where curiosity meets frustration",
  "related_domains": ["Connected interests"]
}}"""


def _get_q12_prompt(response: str) -> str:
    """Q12: Contradiction Handling extraction prompt."""
    return f"""Extract structured data about contradiction handling.

Response: {response}

Return JSON:
{{
  "preferred_mode": "slow_down | help_pivot",
  "overrun_signals": ["How to detect speed > purpose"],
  "intervention_style": "How they want to be interrupted"
}}"""


def _get_q13_prompt(response: str) -> str:
    """Q13: Mirror Test extraction prompt."""
    return f"""Extract structured data about the Mirror Test response.

Response: {response}

Return JSON:
{{
  "resonance_confirmed": true/false,
  "corrections_made": ["Adjustments they made"],
  "emotional_reaction": "How they responded to being seen"
}}"""


def _get_q14_prompt(response: str) -> str:
    """Q14: The Basement extraction prompt."""
    return f"""Extract structured data about the Basement revelation.

Response: {response}

Return JSON:
{{
  "revealed": true/false,
  "content": "What they shared",
  "significance": "Why it matters for the relationship"
}}"""


def extract_structured_data(question_id: int, response: str, llm_router) -> Dict[str, Any]:
    """
    Extract structured data from a Convergence answer using the appropriate prompt.
    
    Args:
        question_id: The question ID (1-14)
        response: The Creator's response text
        llm_router: The LLM router instance for making extraction calls
        
    Returns:
        Dictionary with extracted structured data matching the question's schema
    """
    try:
        extraction_prompt = get_extraction_prompt(question_id, response)
        
        system_prompt = """You are extracting structured data from Convergence answers. 
Output only valid JSON matching the exact schema specified in the prompt.
Do not include any explanatory text, only the JSON object."""
        
        extraction_result = llm_router.chat(
            system_prompt=system_prompt,
            user_prompt=extraction_prompt,
            temperature=0.3,
            expect_json=True
        )
        
        # Parse JSON result
        extracted = json.loads(extraction_result)
        
        # Validate that required fields are present (basic validation)
        _validate_extraction(question_id, extracted)
        
        return extracted
        
    except json.JSONDecodeError as e:
        logger.error(f"[Extraction] Failed to parse JSON for Q{question_id}: {e}")
        if 'extraction_result' in locals():
            logger.debug(f"[Extraction] Raw response: {extraction_result}")
        return get_default_extraction(question_id)
    except Exception as e:
        logger.error(f"[Extraction] Extraction failed for Q{question_id}: {e}", exc_info=True)
        return get_default_extraction(question_id)


def _validate_extraction(question_id: int, extracted: Dict[str, Any]) -> None:
    """Basic validation that required fields are present."""
    required_fields = {
        1: ["trigger_pattern", "escalation_signal", "point_of_no_return"],
        2: ["first_instance", "aftermath", "current_stance"],
        3: ["witnessed_betrayal", "why_repulsive", "value_violated"],
        4: ["the_load", "fear_of_release", "uniqueness_belief"],
        5: ["freedom_feeling", "burden_to_remove"],
        6: ["the_vision", "how_it_failed", "lesson_learned"],
        7: ["value_1", "value_2", "which_won"],
        8: ["stance", "reasoning", "judgment_approach"],
        9: ["flexible_zones", "hard_lines"],
        10: ["default_need", "yin_signals", "yang_signals"],
        11: ["primary_mystery", "why_compelling"],
        12: ["preferred_mode", "overrun_signals"],
        13: ["resonance_confirmed"],
        14: ["revealed"],
    }
    
    if question_id in required_fields:
        missing = [field for field in required_fields[question_id] if field not in extracted]
        if missing:
            logger.warning(f"[Extraction] Q{question_id} missing fields: {missing}")


def get_default_extraction(question_id: int) -> Dict[str, Any]:
    """Return default empty extraction structure for a question."""
    defaults = {
        1: {
            "trigger_pattern": "",
            "escalation_signal": "",
            "point_of_no_return": "",
            "physical_symptoms": [],
            "typical_duration": "",
            "recovery_method": ""
        },
        2: {
            "first_instance": {"context": "", "emotional_texture": "", "threshold_behavior": ""},
            "aftermath": "",
            "current_stance": "",
            "warning_signs": []
        },
        3: {
            "witnessed_betrayal": "",
            "why_repulsive": "",
            "value_violated": "",
            "behavioral_markers": []
        },
        4: {
            "the_load": "",
            "fear_of_release": "",
            "uniqueness_belief": "",
            "origin": ""
        },
        5: {
            "freedom_feeling": "",
            "burden_to_remove": "",
            "post_freedom_life": ""
        },
        6: {
            "the_vision": "",
            "how_it_failed": "",
            "lesson_learned": "",
            "changed_behavior": ""
        },
        7: {
            "value_1": "",
            "value_2": "",
            "which_won": "",
            "cost": "",
            "would_repeat": False,
            "reasoning": ""
        },
        8: {
            "stance": "",
            "reasoning": "",
            "judgment_approach": "",
            "mercy_conditions": ""
        },
        9: {
            "flexible_zones": [],
            "hard_lines": [],
            "flexibility_reasoning": "",
            "rigidity_reasoning": ""
        },
        10: {
            "default_need": "",
            "yin_signals": [],
            "yang_signals": [],
            "detection_advice": ""
        },
        11: {
            "primary_mystery": "",
            "why_compelling": "",
            "friction_point": "",
            "related_domains": []
        },
        12: {
            "preferred_mode": "",
            "overrun_signals": [],
            "intervention_style": ""
        },
        13: {
            "resonance_confirmed": False,
            "corrections_made": [],
            "emotional_reaction": ""
        },
        14: {
            "revealed": False,
            "content": "",
            "significance": ""
        }
    }
    
    return defaults.get(question_id, {})
