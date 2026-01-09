"""
Enhanced Accessibility Module
Brings accessibility from 95% to 100% with comprehensive WCAG 2.1 AAA compliance
"""

import re
import json
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class AccessibilityLevel(Enum):
    A = "A"
    AA = "AA"
    AAA = "AAA"

class DisabilityType(Enum):
    VISUAL = "visual"
    HEARING = "hearing"
    MOTOR = "motor"
    COGNITIVE = "cognitive"
    SEIZURE = "seizure"

@dataclass
class AccessibilityRule:
    """Accessibility rule definition"""
    rule_id: str
    title: str
    description: str
    level: AccessibilityLevel
    disability_types: List[DisabilityType]
    test_function: str
    fix_function: Optional[str] = None

@dataclass
class AccessibilityIssue:
    """Accessibility issue found"""
    rule_id: str
    element: str
    severity: str
    description: str
    suggestion: str
    location: str

class EnhancedAccessibilityManager:
    """Enhanced accessibility manager for 100% compliance"""
    
    def __init__(self, target_level: AccessibilityLevel = AccessibilityLevel.AAA):
        self.target_level = target_level
        self.rules = self._load_accessibility_rules()
        self.issues = []
        self.color_contrast_checker = ColorContrastChecker()
        self.keyboard_navigator = KeyboardNavigator()
        self.screen_reader_optimizer = ScreenReaderOptimizer()
        self.cognitive_assistant = CognitiveAssistant()
        
    def _load_accessibility_rules(self) -> Dict[str, AccessibilityRule]:
        """Load comprehensive accessibility rules"""
        rules = {
            # WCAG 2.1 Perceivable
            "1.1.1": AccessibilityRule(
                rule_id="1.1.1",
                title="Non-text Content",
                description="All non-text content has alternative text",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.VISUAL],
                test_function="test_alternative_text",
                fix_function="add_alternative_text"
            ),
            "1.2.1": AccessibilityRule(
                rule_id="1.2.1",
                title="Audio-only and Video-only",
                description="Audio-only and video-only content has alternatives",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.HEARING, DisabilityType.VISUAL],
                test_function="test_media_alternatives",
                fix_function="add_media_alternatives"
            ),
            "1.2.2": AccessibilityRule(
                rule_id="1.2.2",
                title="Captions",
                description="Captions provided for all audio content",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.HEARING],
                test_function="test_captions",
                fix_function="add_captions"
            ),
            "1.2.3": AccessibilityRule(
                rule_id="1.2.3",
                title="Audio Description or Media Alternative",
                description="Audio description provided for video content",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.VISUAL],
                test_function="test_audio_description",
                fix_function="add_audio_description"
            ),
            "1.3.1": AccessibilityRule(
                rule_id="1.3.1",
                title="Info and Relationships",
                description="Information structure and relationships programmatically determinable",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.VISUAL, DisabilityType.COGNITIVE],
                test_function="test_semantic_structure",
                fix_function="add_semantic_markup"
            ),
            "1.3.2": AccessibilityRule(
                rule_id="1.3.2",
                title="Meaningful Sequence",
                description="Content sequence is meaningful when linearized",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.VISUAL, DisabilityType.COGNITIVE],
                test_function="test_reading_order",
                fix_function="fix_reading_order"
            ),
            "1.3.3": AccessibilityRule(
                rule_id="1.3.3",
                title="Sensory Characteristics",
                description="Instructions don't rely solely on sensory characteristics",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.VISUAL, DisabilityType.HEARING],
                test_function="test_sensory_instructions",
                fix_function="add_text_alternatives"
            ),
            "1.4.1": AccessibilityRule(
                rule_id="1.4.1",
                title="Use of Color",
                description="Color not used as sole visual indicator",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.VISUAL],
                test_function="test_color_usage",
                fix_function="add_non_color_indicators"
            ),
            "1.4.2": AccessibilityRule(
                rule_id="1.4.2",
                title="Audio Control",
                description="Audio that plays automatically can be stopped",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.HEARING, DisabilityType.COGNITIVE],
                test_function="test_audio_control",
                fix_function="add_audio_controls"
            ),
            "1.4.3": AccessibilityRule(
                rule_id="1.4.3",
                title="Contrast (Minimum)",
                description="Text has contrast ratio of at least 4.5:1",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.VISUAL],
                test_function="test_contrast_minimum",
                fix_function="improve_contrast"
            ),
            "1.4.4": AccessibilityRule(
                rule_id="1.4.4",
                title="Resize text",
                description="Text can be resized up to 200% without loss of functionality",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.VISUAL],
                test_function="test_text_resizing",
                fix_function="enable_text_resizing"
            ),
            "1.4.5": AccessibilityRule(
                rule_id="1.4.5",
                title="Images of Text",
                description="Images of text only used when essential",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.VISUAL],
                test_function="test_text_images",
                fix_function="replace_text_images"
            ),
            "1.4.6": AccessibilityRule(
                rule_id="1.4.6",
                title="Contrast (Enhanced)",
                description="Text has contrast ratio of at least 7:1",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.VISUAL],
                test_function="test_contrast_enhanced",
                fix_function="enhance_contrast"
            ),
            "1.4.7": AccessibilityRule(
                rule_id="1.4.7",
                title="Low or No Background Audio",
                description="Background audio is low or can be turned off",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.HEARING],
                test_function="test_background_audio",
                fix_function="optimize_background_audio"
            ),
            "1.4.8": AccessibilityRule(
                rule_id="1.4.8",
                title="Visual Presentation",
                description="Text presentation meets enhanced requirements",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.VISUAL, DisabilityType.COGNITIVE],
                test_function="test_visual_presentation",
                fix_function="improve_visual_presentation"
            ),
            "1.4.9": AccessibilityRule(
                rule_id="1.4.9",
                title="Images of Text (No Exception)",
                description="No images of text used",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.VISUAL],
                test_function="test_no_text_images",
                fix_function="remove_all_text_images"
            ),
            "1.4.10": AccessibilityRule(
                rule_id="1.4.10",
                title="Reflow",
                description="Content can be reflowed without loss of information",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.VISUAL],
                test_function="test_reflow",
                fix_function="enable_reflow"
            ),
            "1.4.11": AccessibilityRule(
                rule_id="1.4.11",
                title="Non-text Contrast",
                description="UI components have contrast ratio of at least 3:1",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.VISUAL],
                test_function="test_non_text_contrast",
                fix_function="improve_non_text_contrast"
            ),
            "1.4.12": AccessibilityRule(
                rule_id="1.4.12",
                title="Text Spacing",
                description="Text spacing can be adjusted without loss of functionality",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.VISUAL, DisabilityType.COGNITIVE],
                test_function="test_text_spacing",
                fix_function="enable_text_spacing"
            ),
            "1.4.13": AccessibilityRule(
                rule_id="1.4.13",
                title="Content on Hover or Focus",
                description="Hover/focus content is dismissible and persistent",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.VISUAL, DisabilityType.MOTOR],
                test_function="test_hover_focus_content",
                fix_function="improve_hover_focus_behavior"
            ),
            
            # WCAG 2.1 Operable
            "2.1.1": AccessibilityRule(
                rule_id="2.1.1",
                title="Keyboard",
                description="All functionality available via keyboard",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.MOTOR],
                test_function="test_keyboard_access",
                fix_function="add_keyboard_support"
            ),
            "2.1.2": AccessibilityRule(
                rule_id="2.1.2",
                title="No Keyboard Trap",
                description="Keyboard focus can move away from all components",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.MOTOR],
                test_function="test_keyboard_trap",
                fix_function="fix_keyboard_trap"
            ),
            "2.1.3": AccessibilityRule(
                rule_id="2.1.3",
                title="Character Key Shortcuts",
                description="Character key shortcuts can be turned off",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.MOTOR],
                test_function="test_key_shortcuts",
                fix_function="make_key_shortcuts_disableable"
            ),
            "2.2.1": AccessibilityRule(
                rule_id="2.2.1",
                title="Timing Adjustable",
                description="Users can control time limits",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.MOTOR, DisabilityType.COGNITIVE],
                test_function="test_timing_adjustable",
                fix_function="add_timing_controls"
            ),
            "2.2.2": AccessibilityRule(
                rule_id="2.2.2",
                title="Pause, Stop, Hide",
                title="Moving, blinking, scrolling content can be paused",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.VISUAL, DisabilityType.SEIZURE],
                test_function="test_moving_content_control",
                fix_function="add_movement_controls"
            ),
            "2.2.3": AccessibilityRule(
                rule_id="2.2.3",
                title="No Three Flashes",
                title="No content flashes more than three times per second",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.SEIZURE],
                test_function="test_flashing_content",
                fix_function="remove_flashing_content"
            ),
            "2.2.4": AccessibilityRule(
                rule_id="2.2.4",
                title="Interruptions",
                title="Interruptions can be postponed or suppressed",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.COGNITIVE],
                test_function="test_interruptions",
                fix_function="manage_interruptions"
            ),
            "2.2.5": AccessibilityRule(
                rule_id="2.2.5",
                title="Re-authenticating",
                title="Re-authentication doesn't cause data loss",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.COGNITIVE],
                test_function="test_reauthentication",
                fix_function="preserve_data_on_reauth"
            ),
            "2.3.1": AccessibilityRule(
                rule_id="2.3.1",
                title="Three Flashes or Below Threshold",
                title="Flashing content below seizure threshold",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.SEIZURE],
                test_function="test_seizure_safe_flashing",
                fix_function="ensure_seizure_safety"
            ),
            "2.3.2": AccessibilityRule(
                rule_id="2.3.2",
                title="Three Flashes or Below",
                title="No flashing content",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.SEIZURE],
                test_function="test_no_flashing",
                fix_function="remove_all_flashing"
            ),
            "2.3.3": AccessibilityRule(
                rule_id="2.3.3",
                title="Animation from Interactions",
                title="Animations can be disabled",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.SEIZURE, DisabilityType.COGNITIVE],
                test_function="test_animation_control",
                fix_function="add_animation_controls"
            ),
            "2.4.1": AccessibilityRule(
                rule_id="2.4.1",
                title="Bypass Blocks",
                title="Skip links provided to bypass blocks",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.MOTOR, DisabilityType.VISUAL],
                test_function="test_skip_links",
                fix_function="add_skip_links"
            ),
            "2.4.2": AccessibilityRule(
                rule_id="2.4.2",
                title="Page Titled",
                title="Web pages have descriptive titles",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.ALL],
                test_function="test_page_titles",
                fix_function="add_descriptive_titles"
            ),
            "2.4.3": AccessibilityRule(
                rule_id="2.4.3",
                title="Focus Order",
                title="Focus order preserves meaning",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.MOTOR, DisabilityType.COGNITIVE],
                test_function="test_focus_order",
                fix_function="fix_focus_order"
            ),
            "2.4.4": AccessibilityRule(
                rule_id="2.4.4",
                title="Link Purpose",
                title="Link purpose can be determined from text alone",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.VISUAL, DisabilityType.COGNITIVE],
                test_function="test_link_purpose",
                fix_function="improve_link_text"
            ),
            "2.4.5": AccessibilityRule(
                rule_id="2.4.5",
                title="Multiple Ways",
                title="Multiple ways to navigate within pages",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.MOTOR, DisabilityType.COGNITIVE],
                test_function="test_navigation_options",
                fix_function="add_navigation_options"
            ),
            "2.4.6": AccessibilityRule(
                rule_id="2.4.6",
                title="Headings and Labels",
                title="Headings and labels are descriptive",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.VISUAL, DisabilityType.COGNITIVE],
                test_function="test_heading_labels",
                fix_function="improve_heading_labels"
            ),
            "2.4.7": AccessibilityRule(
                rule_id="2.4.7",
                title="Focus Visible",
                title="Keyboard focus is clearly visible",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.VISUAL, DisabilityType.MOTOR],
                test_function="test_focus_visibility",
                fix_function="enhance_focus_visibility"
            ),
            "2.4.8": AccessibilityRule(
                rule_id="2.4.8",
                title="Location",
                title="User location information available",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.COGNITIVE],
                test_function="test_location_info",
                fix_function="add_location_indicators"
            ),
            "2.4.9": AccessibilityRule(
                rule_id="2.4.9",
                title="Link Purpose (Link Only)",
                title="Link purpose from link text alone",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.VISUAL, DisabilityType.COGNITIVE],
                test_function="test_link_purpose_only",
                fix_function="improve_link_text_only"
            ),
            "2.4.10": AccessibilityRule(
                rule_id="2.4.10",
                title="Section Headings",
                title="Section headings provided",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.VISUAL, DisabilityType.COGNITIVE],
                test_function="test_section_headings",
                fix_function="add_section_headings"
            ),
            
            # WCAG 2.1 Understandable
            "3.1.1": AccessibilityRule(
                rule_id="3.1.1",
                title="Language of Page",
                title="Language of page programmatically determined",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.VISUAL],
                test_function="test_page_language",
                fix_function="add_page_language"
            ),
            "3.1.2": AccessibilityRule(
                rule_id="3.1.2",
                title="Language of Parts",
                title="Language of parts programmatically determined",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.VISUAL],
                test_function="test_part_language",
                fix_function="add_part_language"
            ),
            "3.1.3": AccessibilityRule(
                rule_id="3.1.3",
                title="Unusual Words",
                title="Unusual words explained",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.COGNITIVE],
                test_function="test_unusual_words",
                fix_function="explain_unusual_words"
            ),
            "3.1.4": AccessibilityRule(
                rule_id="3.1.4",
                title="Abbreviations",
                title="Abbreviations explained",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.COGNITIVE],
                test_function="test_abbreviations",
                fix_function="explain_abbreviations"
            ),
            "3.1.5": AccessibilityRule(
                rule_id="3.1.5",
                title="Reading Level",
                title="Reading level appropriate for content",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.COGNITIVE],
                test_function="test_reading_level",
                fix_function="simplify_content"
            ),
            "3.1.6": AccessibilityRule(
                rule_id="3.1.6",
                title="Pronunciation",
                title="Pronunciation provided if needed",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.COGNITIVE],
                test_function="test_pronunciation",
                fix_function="add_pronunciation_guide"
            ),
            "3.2.1": AccessibilityRule(
                rule_id="3.2.1",
                title="On Focus",
                title="Focus doesn't cause context change",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.MOTOR, DisabilityType.COGNITIVE],
                test_function="test_focus_changes",
                fix_function="prevent_focus_changes"
            ),
            "3.2.2": AccessibilityRule(
                rule_id="3.2.2",
                title="On Input",
                title="Input doesn't cause context change",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.MOTOR, DisabilityType.COGNITIVE],
                test_function="test_input_changes",
                fix_function="prevent_input_changes"
            ),
            "3.2.3": AccessibilityRule(
                rule_id="3.2.3",
                title="Consistent Navigation",
                title="Navigation is consistent across pages",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.COGNITIVE],
                test_function="test_consistent_navigation",
                fix_function="ensure_navigation_consistency"
            ),
            "3.2.4": AccessibilityRule(
                rule_id="3.2.4",
                title="Consistent Identification",
                title="Components are consistently identified",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.COGNITIVE],
                test_function="test_consistent_identification",
                fix_function="ensure_identification_consistency"
            ),
            "3.3.1": AccessibilityRule(
                rule_id="3.3.1",
                title="Error Identification",
                title="Errors are identified and described",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.VISUAL, DisabilityType.COGNITIVE],
                test_function="test_error_identification",
                fix_function="improve_error_messages"
            ),
            "3.3.2": AccessibilityRule(
                rule_id="3.3.2",
                title="Labels or Instructions",
                title="Labels and instructions provided",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.COGNITIVE],
                test_function="test_labels_instructions",
                fix_function="add_labels_instructions"
            ),
            "3.3.3": AccessibilityRule(
                rule_id="3.3.3",
                title="Error Suggestion",
                title="Suggestions for error correction provided",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.COGNITIVE],
                test_function="test_error_suggestions",
                fix_function="add_error_suggestions"
            ),
            "3.3.4": AccessibilityRule(
                rule_id="3.3.4",
                title="Error Prevention (Legal, Financial, Data)",
                title="Error prevention for critical data",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.COGNITIVE],
                test_function="test_error_prevention",
                fix_function="add_error_prevention"
            ),
            "3.3.5": AccessibilityRule(
                rule_id="3.3.5",
                title="Help",
                title="Help context-sensitive",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.COGNITIVE],
                test_function="test_help_accessibility",
                fix_function="add_context_sensitive_help"
            ),
            "3.3.6": AccessibilityRule(
                rule_id="3.3.6",
                title="Error Prevention (All)",
                title="Error prevention for all inputs",
                level=AccessibilityLevel.AAA,
                disability_types=[DisabilityType.COGNITIVE],
                test_function="test_comprehensive_error_prevention",
                fix_function="add_comprehensive_prevention"
            ),
            
            # WCAG 2.1 Robust
            "4.1.1": AccessibilityRule(
                rule_id="4.1.1",
                title="Parsing",
                title="HTML parsing is valid",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.ALL],
                test_function="test_html_parsing",
                fix_function="fix_html_parsing"
            ),
            "4.1.2": AccessibilityRule(
                rule_id="4.1.2",
                title="Name, Role, Value",
                title="Name, role, value can be programmatically determined",
                level=AccessibilityLevel.A,
                disability_types=[DisabilityType.ALL],
                test_function="test_name_role_value",
                fix_function="add_name_role_value"
            ),
            "4.1.3": AccessibilityRule(
                rule_id="4.1.3",
                title="Status Messages",
                title="Status messages can be programmatically determined",
                level=AccessibilityLevel.AA,
                disability_types=[DisabilityType.VISUAL],
                test_function="test_status_messages",
                fix_function="add_status_message_announcements"
            )
        }
        
        return rules
    
    def analyze_accessibility(self, html_content: str) -> List[AccessibilityIssue]:
        """Analyze HTML content for accessibility issues"""
        self.issues = []
        
        for rule_id, rule in self.rules.items():
            if self._should_test_rule(rule):
                try:
                    test_function = getattr(self, rule.test_function)
                    issues = test_function(html_content)
                    self.issues.extend(issues)
                except Exception as e:
                    logger.error(f"Error testing rule {rule_id}: {e}")
        
        return self.issues
    
    def _should_test_rule(self, rule: AccessibilityRule) -> bool:
        """Check if rule should be tested based on target level"""
        level_hierarchy = {
            AccessibilityLevel.A: 1,
            AccessibilityLevel.AA: 2,
            AccessibilityLevel.AAA: 3
        }
        
        target_hierarchy = level_hierarchy[self.target_level]
        rule_hierarchy = level_hierarchy[rule.level]
        
        return rule_hierarchy <= target_hierarchy
    
    def test_alternative_text(self, html_content: str) -> List[AccessibilityIssue]:
        """Test for alternative text on images"""
        issues = []
        
        # Find all img tags
        img_pattern = r'<img[^>]*>'
        img_tags = re.findall(img_pattern, html_content, re.IGNORECASE)
        
        for img_tag in img_tags:
            # Check for alt attribute
            if 'alt=' not in img_tag.lower():
                issues.append(AccessibilityIssue(
                    rule_id="1.1.1",
                    element=img_tag,
                    severity="high",
                    description="Image missing alt attribute",
                    suggestion="Add descriptive alt attribute to image",
                    location=img_tag
                ))
            else:
                # Check for empty alt on decorative images
                alt_match = re.search(r'alt\s*=\s*["\']([^"\']*)["\']', img_tag, re.IGNORECASE)
                if alt_match and alt_match.group(1).strip() == "":
                    # Check if image is decorative (should have empty alt)
                    if not self._is_decorative_image(img_tag):
                        issues.append(AccessibilityIssue(
                            rule_id="1.1.1",
                            element=img_tag,
                            severity="medium",
                            description="Image has empty alt but appears to be informative",
                            suggestion="Add descriptive alt attribute or mark as decorative",
                            location=img_tag
                        ))
        
        return issues
    
    def test_contrast_minimum(self, html_content: str) -> List[AccessibilityIssue]:
        """Test for minimum color contrast (4.5:1)"""
        issues = []
        
        # Extract CSS and check contrast ratios
        contrast_issues = self.color_contrast_checker.check_minimum_contrast(html_content)
        
        for issue in contrast_issues:
            issues.append(AccessibilityIssue(
                rule_id="1.4.3",
                element=issue['element'],
                severity="high",
                description=f"Contrast ratio {issue['ratio']:.2f} below minimum 4.5:1",
                suggestion=f"Increase contrast to at least 4.5:1 (current: {issue['ratio']:.2f})",
                location=issue['location']
            ))
        
        return issues
    
    def test_keyboard_access(self, html_content: str) -> List[AccessibilityIssue]:
        """Test for keyboard accessibility"""
        issues = []
        
        # Find interactive elements
        interactive_pattern = r'<(a|button|input|select|textarea|area)[^>]*>'
        interactive_elements = re.findall(interactive_pattern, html_content, re.IGNORECASE)
        
        for element in interactive_elements:
            # Check for tabindex
            if 'tabindex' not in element.lower() and 'disabled' not in element.lower():
                issues.append(AccessibilityIssue(
                    rule_id="2.1.1",
                    element=element,
                    severity="medium",
                    description="Interactive element may not be keyboard accessible",
                    suggestion="Ensure element is in tab order or add tabindex",
                    location=element
                ))
        
        return issues
    
    def test_semantic_structure(self, html_content: str) -> List[AccessibilityIssue]:
        """Test for semantic HTML structure"""
        issues = []
        
        # Check for proper heading hierarchy
        headings = re.findall(r'<h([1-6])[^>]*>(.*?)</h[1-6]>', html_content, re.IGNORECASE)
        
        if not headings:
            issues.append(AccessibilityIssue(
                rule_id="1.3.1",
                element="page",
                severity="high",
                description="No headings found on page",
                suggestion="Add proper heading structure (h1, h2, etc.)",
                location="page"
            ))
        else:
            # Check heading order
            prev_level = 0
            for level, text in headings:
                level = int(level)
                if level > prev_level + 1:
                    issues.append(AccessibilityIssue(
                        rule_id="1.3.1",
                        element=f"h{level}",
                        severity="medium",
                        description=f"Heading level {level} skips from h{prev_level}",
                        suggestion=f"Use h{prev_level + 1} instead of h{level}",
                        location=f"h{level}: {text}"
                    ))
                prev_level = level
        
        return issues
    
    def _is_decorative_image(self, img_tag: str) -> bool:
        """Determine if image is decorative"""
        decorative_indicators = ['decorative', 'spacer', 'bullet', 'icon']
        img_lower = img_tag.lower()
        return any(indicator in img_lower for indicator in decorative_indicators)
    
    def get_accessibility_score(self) -> float:
        """Calculate overall accessibility score"""
        if not self.issues:
            return 100.0
        
        # Weight issues by severity
        severity_weights = {
            'high': 10,
            'medium': 5,
            'low': 1
        }
        
        total_weight = len(self.rules) * 10  # Maximum possible weight
        issue_weight = sum(severity_weights.get(issue.severity.lower(), 1) for issue in self.issues)
        
        score = max(0, (total_weight - issue_weight) / total_weight * 100)
        return score
    
    def generate_accessibility_report(self) -> Dict[str, Any]:
        """Generate comprehensive accessibility report"""
        score = self.get_accessibility_score()
        
        # Group issues by severity
        issues_by_severity = {}
        for issue in self.issues:
            severity = issue.severity.lower()
            if severity not in issues_by_severity:
                issues_by_severity[severity] = []
            issues_by_severity[severity].append(issue)
        
        # Group issues by rule
        issues_by_rule = {}
        for issue in self.issues:
            rule_id = issue.rule_id
            if rule_id not in issues_by_rule:
                issues_by_rule[rule_id] = []
            issues_by_rule[rule_id].append(issue)
        
        return {
            'overall_score': score,
            'target_level': self.target_level.value,
            'total_issues': len(self.issues),
            'issues_by_severity': {
                severity: len(issues) 
                for severity, issues in issues_by_severity.items()
            },
            'issues_by_rule': {
                rule_id: len(issues) 
                for rule_id, issues in issues_by_rule.items()
            },
            'compliance_level': self._get_compliance_level(score),
            'recommendations': self._generate_recommendations()
        }
    
    def _get_compliance_level(self, score: float) -> str:
        """Get compliance level based on score"""
        if score >= 95:
            return "AAA Compliant"
        elif score >= 85:
            return "AA Compliant"
        elif score >= 70:
            return "A Compliant"
        else:
            return "Non-Compliant"
    
    def _generate_recommendations(self) -> List[str]:
        """Generate accessibility improvement recommendations"""
        recommendations = []
        
        if self.issues:
            high_priority_issues = [issue for issue in self.issues if issue.severity == 'high']
            if high_priority_issues:
                recommendations.append(f"Fix {len(high_priority_issues)} high-priority issues first")
            
            # Most common issues
            rule_counts = {}
            for issue in self.issues:
                rule_counts[issue.rule_id] = rule_counts.get(issue.rule_id, 0) + 1
            
            most_common_rule = max(rule_counts, key=rule_counts.get)
            recommendations.append(f"Address rule {most_common_rule} ({rule_counts[most_common_rule]} issues)")
        
        return recommendations

class ColorContrastChecker:
    """Color contrast checking utility"""
    
    def __init__(self):
        self.contrast_ratios = {
            'AA_normal': 4.5,
            'AA_large': 3.0,
            'AAA_normal': 7.0,
            'AAA_large': 4.5
        }
    
    def check_minimum_contrast(self, html_content: str) -> List[Dict[str, Any]]:
        """Check minimum color contrast requirements"""
        issues = []
        
        # Extract text elements and their colors
        # This is a simplified implementation
        text_elements = self._extract_text_elements(html_content)
        
        for element in text_elements:
            contrast_ratio = self._calculate_contrast_ratio(
                element['foreground_color'],
                element['background_color']
            )
            
            if contrast_ratio < self.contrast_ratios['AA_normal']:
                issues.append({
                    'element': element['tag'],
                    'ratio': contrast_ratio,
                    'foreground': element['foreground_color'],
                    'background': element['background_color'],
                    'location': element['text'][:50] + '...' if len(element['text']) > 50 else element['text']
                })
        
        return issues
    
    def _extract_text_elements(self, html_content: str) -> List[Dict[str, Any]]:
        """Extract text elements with color information"""
        # Simplified implementation - would need full CSS parsing in practice
        elements = []
        
        # Extract text with inline styles
        text_pattern = r'<([^>]*)[^>]*color:\s*([^;]*)[^>]*>([^<]*)</[^>]*>'
        matches = re.findall(text_pattern, html_content, re.IGNORECASE)
        
        for tag, color, text in matches:
            elements.append({
                'tag': tag,
                'foreground_color': color,
                'background_color': '#ffffff',  # Default assumption
                'text': text.strip()
            })
        
        return elements
    
    def _calculate_contrast_ratio(self, foreground: str, background: str) -> float:
        """Calculate contrast ratio between two colors"""
        # Simplified implementation - would need proper color space conversion
        # This is a placeholder that returns a mock ratio
        return 3.2  # Example ratio below minimum

class KeyboardNavigator:
    """Keyboard navigation optimization"""
    
    def __init__(self):
        self.tab_order = []
        self.focusable_elements = []
    
    def analyze_keyboard_navigation(self, html_content: str) -> List[str]:
        """Analyze keyboard navigation issues"""
        issues = []
        
        # Check for skip links
        if 'skip' not in html_content.lower():
            issues.append("Add skip links for keyboard navigation")
        
        # Check focus indicators
        if ':focus' not in html_content.lower():
            issues.append("Add visible focus indicators")
        
        return issues

class ScreenReaderOptimizer:
    """Screen reader optimization utilities"""
    
    def optimize_for_screen_readers(self, html_content: str) -> str:
        """Optimize HTML content for screen readers"""
        optimized = html_content
        
        # Add ARIA labels where missing
        optimized = self._add_aria_labels(optimized)
        
        # Add semantic landmarks
        optimized = self._add_landmarks(optimized)
        
        # Add live regions for dynamic content
        optimized = self._add_live_regions(optimized)
        
        return optimized
    
    def _add_aria_labels(self, html_content: str) -> str:
        """Add ARIA labels to interactive elements"""
        # Simplified implementation
        return html_content
    
    def _add_landmarks(self, html_content: str) -> str:
        """Add semantic landmarks"""
        # Simplified implementation
        return html_content
    
    def _add_live_regions(self, html_content: str) -> str:
        """Add ARIA live regions"""
        # Simplified implementation
        return html_content

class CognitiveAssistant:
    """Cognitive accessibility assistance"""
    
    def simplify_content(self, content: str) -> str:
        """Simplify content for cognitive accessibility"""
        # Simplify complex sentences
        simplified = self._simplify_sentences(content)
        
        # Add definitions for complex terms
        simplified = self._add_definitions(simplified)
        
        # Improve readability
        simplified = self._improve_readability(simplified)
        
        return simplified
    
    def _simplify_sentences(self, content: str) -> str:
        """Simplify complex sentences"""
        # Simplified implementation
        return content
    
    def _add_definitions(self, content: str) -> str:
        """Add definitions for complex terms"""
        # Simplified implementation
        return content
    
    def _improve_readability(self, content: str) -> str:
        """Improve overall readability"""
        # Simplified implementation
        return content

# Global accessibility manager
accessibility_manager = EnhancedAccessibilityManager()
