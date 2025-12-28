---
name: Complete All Gaps and Approve Deviations
overview: Approves all deviations, fills production-ready code for all placeholders and TODOs, updates date placeholders, and provides improvement recommendations.
todos:
  - id: approve-deviations
    content: Update API path convention deviation status to Approved
    status: pending
  - id: foundry-log-extraction
    content: Implement _extract_conversations_from_log() with proper thoughts.log parsing
    status: pending
  - id: foundry-archive-extraction
    content: Implement _extract_conversations_from_archive() to scan archive directory
    status: pending
  - id: voice-calibration
    content: Implement _calibrate_voice() with audio feature extraction (pitch, prosody)
    status: pending
  - id: ghost-main-window
    content: Implement _show_main_window() to open browser/Electron window
    status: pending
  - id: ghost-status
    content: Enhance _show_status() with formatted status display
    status: pending
  - id: monologue-take-wheel
    content: Replace TODO in monologue.py with actual tool execution integration
    status: pending
  - id: spontaneity-llm
    content: Add LLM-based content generation to spontaneity system with template fallback
    status: pending
  - id: update-dates
    content: Replace all date placeholders (2025-01-XX, YYYYMMDD) with current date
    status: pending
  - id: platform-error-handling
    content: Improve app_control.py error handling for unsupported platforms
    status: pending
---

# Complete Al

l Gaps and Approve Deviations Plan

## Current Status Analysis

### Deviations Status

- ✅ `expanded-identity-and-capabilities-202501XX.md` - Status: Approved (implied by implementation)
- ✅ `adaptive-ui-and-productivity-design-202501XX.md` - Status: Approved (implied by implementation)  
- ⏳ `api-path-convention-202501XX.md` - Status: Pending Approval

### Placeholders Found

1. **Foundry System** (`progeny_root/core/foundry.py`):

- Line 503: `_extract_conversations_from_log()` - placeholder for extracting user/assistant pairs
- Line 512: `_extract_conversations_from_archive()` - placeholder for scanning archive
- Line 542: `forge_model()` - placeholder for actual QLoRA training

2. **Voice System** (`progeny_root/core/voice.py`):

- Line 467: `_calibrate_voice()` - placeholder for voice calibration logic

3. **Ghost Interface** (`progeny_root/core/ghost.py`):

- Line 280: `_show_main_window()` - placeholder implementation
- Line 284: `_show_status()` - placeholder implementation

4. **Monologue System** (`progeny_root/core/monologue.py`):

- Line 544: TODO comment for "Take the Wheel" execution integration

5. **Spontaneity System** (`progeny_root/core/spontaneity.py`):

- Line 207: Template-based content generation (should use LLM in production)

6. **Date Placeholders**:

- All documentation files contain `2025-01-XX` or `YYYYMMDD` placeholders

### Code Quality Issues

1. `device_access/app_control.py` line 57: `NotImplementedError` for unsupported platforms (intentional, but should be handled gracefully)

## Implementation Plan

### Phase 1: Approve All Deviations

1. **Update API Path Deviation Status**

- File: `sallie/deviations/api-path-convention-202501XX.md`
- Change status from "Pending Approval" to "✅ Approved"
- Add approval timestamp

### Phase 2: Fill Placeholders with Production Code

#### 2.1 Foundry System Enhancements

**File**: `progeny_root/core/foundry.py`**Task 1: Implement `_extract_conversations_from_log()`**

- Parse `thoughts.log` format to extract user inputs and assistant responses
- Match INPUT blocks with OUTPUT blocks
- Return list of dicts: `[{"user": "...", "assistant": "...", "timestamp": ...}]`

**Task 2: Implement `_extract_conversations_from_archive()`**

- Scan `archive/` directory for conversation files
- Support common formats (JSON, markdown, plain text)
- Extract user/assistant pairs with metadata

**Task 3: Enhance `forge_model()` Training Placeholder**

- Keep as placeholder but add comprehensive documentation
- Add structure for future QLoRA integration
- Log what would happen in production

#### 2.2 Voice System Enhancement

**File**: `progeny_root/core/voice.py`**Task 4: Implement `_calibrate_voice()`**

- Extract audio characteristics (pitch, rate, volume)
- Analyze prosody patterns
- Store calibration data in voice_config
- Support multiple voice samples

#### 2.3 Ghost Interface Enhancements

**File**: `progeny_root/core/ghost.py`**Task 5: Implement `_show_main_window()`**

- If web UI running, open browser to dashboard URL
- If Electron app, show main window
- Log action appropriately

**Task 6: Enhance `_show_status()`**

- Display formatted status dialog/notification
- Show limbic state values clearly
- Add system health indicators

#### 2.4 Monologue System - Take the Wheel

**File**: `progeny_root/core/monologue.py`**Task 7: Implement Tool Execution in Take-the-Wheel**

- Integrate with Agency system to actually execute planned actions
- Replace TODO comment with actual execution code
- Handle errors and report back

#### 2.5 Spontaneity System Enhancement

**File**: `progeny_root/core/spontaneity.py`**Task 8: Add LLM-based Content Generation**

- Use LLM router to generate spontaneous content when available
- Fallback to templates if LLM unavailable
- Make it configurable (template-only mode for testing)

### Phase 3: Update Date Placeholders

**Task 9: Replace All Date Placeholders**

- Files in `sallie/` directory
- Replace `2025-01-XX` with current date: `2025-01-27`
- Replace `YYYYMMDD` with current date: `20250127`
- Use consistent date format throughout

### Phase 4: Code Quality Improvements

**Task 10: Improve Platform Support Error Handling**

- File: `progeny_root/core/device_access/app_control.py`
- Replace `NotImplementedError` with graceful degradation
- Return error dict instead of raising exception

## Implementation Details

### Foundry Conversation Extraction

```python
def _extract_conversations_from_log(self, log_path: Path) -> List[Dict[str, Any]]:
    """Extract conversation pairs from thoughts.log."""
    conversations = []
    try:
        with open(log_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Parse thoughts.log format
        # Pattern: [TIMESTAMP] INPUT ... [TIMESTAMP] OUTPUT ...
        import re
        input_pattern = r'\[([^\]]+)\] INPUT\s+Content: "([^"]+)"'
        output_pattern = r'\[([^\]]+)\] OUTPUT\s+(.+?)(?=\n\[|\Z)'
        
        inputs = re.findall(input_pattern, content, re.DOTALL)
        outputs = re.findall(output_pattern, content, re.DOTALL)
        
        # Match inputs with corresponding outputs
        for input_ts, input_text in inputs:
            # Find next output after this input
            for output_ts, output_text in outputs:
                if output_ts > input_ts:
                    conversations.append({
                        "user": input_text.strip(),
                        "assistant": output_text.strip(),
                        "timestamp": input_ts
                    })
                    break
    except Exception as e:
        logger.error(f"[Foundry] Failed to extract from log: {e}")
    return conversations
```



### Voice Calibration

```python
def _calibrate_voice(self, sample_audio_path: Path) -> Dict[str, Any]:
    """Calibrate voice from audio sample."""
    logger.info(f"[VOICE] Calibrating voice from: {sample_audio_path}")
    
    try:
        # Load audio file
        import librosa
        audio, sr = librosa.load(str(sample_audio_path), sr=None)
        
        # Extract features
        pitch = librosa.yin(audio, fmin=50, fmax=400)
        pitch_mean = float(np.mean(pitch[pitch > 0]))
        
        # Analyze prosody (rate, volume)
        duration = len(audio) / sr
        rms = librosa.feature.rms(y=audio)[0]
        volume_mean = float(np.mean(rms))
        
        calibration_data = {
            "sample_path": str(sample_audio_path),
            "calibrated_at": time.time(),
            "pitch_mean": pitch_mean,
            "volume_mean": volume_mean,
            "speech_rate": len(audio) / duration if duration > 0 else 0,
            "status": "calibrated"
        }
        
        # Update voice_config
        if self.voice_config:
            self.voice_config["calibration"] = calibration_data
        
        return calibration_data
    except Exception as e:
        logger.error(f"[VOICE] Calibration failed: {e}")
        return {
            "sample_path": str(sample_audio_path),
            "calibrated_at": time.time(),
            "status": "failed",
            "error": str(e)
        }
```



### Ghost Interface Methods

```python
def _show_main_window(self, icon, item):
    """Show main window."""
    logger.info("[Ghost] Show main window requested")
    try:
        import webbrowser
        # Open dashboard URL (from config or default)
        config_path = Path("progeny_root/core/config.json")
        if config_path.exists():
            with open(config_path, "r") as f:
                config = json.load(f)
                port = config.get("ui", {}).get("dashboard_port", 3000)
                url = f"http://localhost:{port}"
                webbrowser.open(url)
        else:
            webbrowser.open("http://localhost:3000")
    except Exception as e:
        logger.error(f"[Ghost] Failed to open main window: {e}")

def _show_status(self, icon, item):
    """Show status."""
    state = self.limbic.state
    status_text = (
        f"Trust: {state.trust:.2f}\n"
        f"Warmth: {state.warmth:.2f}\n"
        f"Arousal: {state.arousal:.2f}\n"
        f"Valence: {state.valence:.2f}\n"
        f"Posture: {state.posture or 'AUTO'}"
    )
    logger.info(f"[Ghost] Status:\n{status_text}")
    # In a full implementation, show system tray notification or dialog
```



### Take the Wheel Execution

```python
# In monologue.py, replace TODO with:
from .agency import AgencySystem  # Already imported at top

# Inside the take_the_wheel method:
if tier >= 2:  # PARTNER or SURROGATE
    # Can execute
    response = f"{plan} I'm handling this now."
    
    # Execute planned actions
    if "tool" in plan_data and plan_data["tool"]:
        try:
            tool_result = self.agency.execute_tool(
                plan_data["tool"],
                plan_data.get("args", {}),
                override_reason=f"Take-the-Wheel: {plan_data.get('rationale', 'Autonomous action')}"
            )
            if tool_result.get("status") == "success":
                response += f"\n\n✓ Action completed: {tool_result.get('result', 'done')}"
            else:
                response += f"\n\n⚠ Action had issues: {tool_result.get('message', 'unknown error')}"
        except Exception as e:
            logger.error(f"[Monologue] Take-the-Wheel execution failed: {e}")
            response += f"\n\n✗ Execution failed: {str(e)}"
```



## Testing Strategy

1. **Unit Tests**: Add tests for new implementations
2. **Integration Tests**: Test placeholder replacements don't break existing functionality
3. **Manual Verification**: Test Ghost interface methods work

## Files to Modify

1. `sallie/deviations/api-path-convention-202501XX.md` - Update status
2. `progeny_root/core/foundry.py` - Fill 3 placeholders
3. `progeny_root/core/voice.py` - Fill calibration placeholder
4. `progeny_root/core/ghost.py` - Implement 2 methods
5. `progeny_root/core/monologue.py` - Replace TODO with execution
6. `progeny_root/core/spontaneity.py` - Add LLM generation option
7. `progeny_root/core/device_access/app_control.py` - Improve error handling
8. All `sallie/*.md` files - Replace date placeholders (use script/batch replacement)

## Estimated Effort

- Phase 1 (Deviations): 15 minutes
- Phase 2 (Code): 4-6 hours
- Phase 3 (Dates): 30 minutes (automated)
- Phase 4 (Quality): 1 hour
- **Total**: ~6-8 hours

## Honest Opinion: How to Make Everything Better

After completing the above, here are strategic improvements:

### High-Impact Improvements

1. **Testing Infrastructure**

- Current: Tests exist but coverage is incomplete
- Better: Comprehensive E2E test suite with real Ollama/Qdrant
- Impact: Prevents regressions, enables confident refactoring

2. **Error Recovery & Resilience**

- Current: Basic error handling
- Better: Circuit breakers, automatic retries with backoff, graceful degradation
- Impact: More robust in production

3. **Performance Monitoring**

- Current: Basic performance tracking
- Better: APM integration, detailed metrics, alerting
- Impact: Identify bottlenecks before users notice

4. **Documentation**

- Current: Good architectural docs
- Better: Interactive API docs (Swagger/OpenAPI), video tutorials, troubleshooting guides
- Impact: Easier onboarding, fewer support questions

5. **Configuration Management**

- Current: JSON config files
- Better: Environment-based config, hot-reloading, validation
- Impact: Easier deployment, fewer config errors

### Medium-Impact Improvements

6. **Voice Interface Polish**

- Complete Whisper/Piper integration with model caching
- Wake word optimization for lower false positives
- Voice activity detection improvements

7. **Foundry Production Readiness**

- Actual QLoRA training pipeline integration
- GPU support detection and utilization
- Training job queue management

8. **UI/UX Enhancements**

- Keyboard shortcuts help overlay
- Accessibility improvements (screen reader testing)
- Mobile-responsive design verification

9. **Security Hardening**

- Secrets management (vault integration)
- Rate limiting per user/IP
- Input sanitization audit

10. **Developer Experience**

    - Hot-reload for development
    - Better logging with structured logs (JSON)
    - Docker Compose for full stack
    - Pre-commit hooks for code quality

### Nice-to-Have Enhancements

11. **Advanced Features**

    - Multi-language support
    - Plugin system for extending capabilities
    - Webhook integrations
    - Export/import functionality

12. **Analytics & Insights**

    - Usage analytics (privacy-preserving)
    - Conversation quality metrics