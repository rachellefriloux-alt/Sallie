# Project Inventory - Digital Progeny v5.4.1

**Generated**: 2025-01-XX  
**Workspace**: C:\Sallie  
**Canonical Spec**: TheDigitalProgeny5.2fullthing.txt (v5.4.1, 3506 lines)

## File Structure

### Root Files
- `TheDigitalProgeny5.2fullthing.txt` - Master architectural specification (3506 lines)
- `bootstrap_progeny.py` - Genesis/bootstrap script
- `start_progeny.bat` / `start_progeny_native.bat` - Launch scripts
- `debug_qdrant.py` - Debug utility

### Core Application (`progeny_root/`)
- **Python Modules** (25 files in `core/`):
  - `main.py` - FastAPI entry point, WebSocket support
  - `limbic.py` - Limbic state management (Trust/Warmth/Arousal/Valence/Posture)
  - `monologue.py` - Cognitive loop (Perception → Retrieval → Gemini/INFJ → Synthesis)
  - `perception.py` - Input analysis (urgency, load, sentiment)
  - `synthesis.py` - Response generation with posture/tone
  - `retrieval.py` - Memory system (Qdrant integration, MMR ranking)
  - `agency.py` - Permission matrix, trust tiers, tool execution
  - `tools.py` - Tool registry (file ops, git, shell)
  - `dream.py` - Dream Cycle (consolidation, hygiene)
  - `convergence.py` - Great Convergence (14-question onboarding)
  - `extraction.py` - Pattern extraction for Dream Cycle
  - `mirror.py` - Q13 Mirror Test synthesis
  - `ghost.py` - Ghost Interface (system tray, notifications)
  - `voice.py` - Voice interface (STT/TTS)
  - `sensors.py` - Environmental monitoring
  - `degradation.py` - Failure handling, graceful degradation
  - `foundry.py` - Model fine-tuning, evaluation harness
  - `kinship.py` - Multi-user context isolation
  - `llm_router.py` - Smart routing (Gemini primary, Ollama fallback)
  - `gemini_client.py` - Gemini API client
  - `prompts.py` - System prompts (Perception, Gemini, INFJ, Synthesis)
  - `config.py` / `config.json` - Configuration management
  - `utils.py` - Logging, helpers
  - `verify_governance.py` - Safety verification

- **Configuration**:
  - `config.json` - Runtime config (models, paths, behavior)
  - `requirements.txt` - Python dependencies
  - `docker-compose.yml` / `docker-compose.lan.yml` - Infrastructure
  - `pytest.ini` - Test configuration

- **Data Directories**:
  - `limbic/` - Soul state, Heritage DNA
    - `soul.json` - Current limbic state
    - `heritage/core.json` - Stable identity DNA
    - `heritage/preferences.json` - Tunable preferences
    - `heritage/learned.json` - Learned beliefs
    - `heritage/history/` - Version snapshots
  - `memory/` - Vector storage
    - `qdrant/` - Docker Qdrant data
    - `qdrant_local/` - Embedded Qdrant (SQLite)
    - `patches.json` - Hypothesis sandbox
  - `working/` - Second Brain (mutable scratchpad)
    - `now.md` - Current priorities
    - `open_loops.json` - Reminders
    - `decisions.json` - Decision log
    - `tuning.md` - Repair notes
  - `logs/` - System logs
    - `thoughts.log` - Internal monologue
    - `agency.log` - Tool execution
    - `error.log` - Errors
  - `sensors/` - Sensor data (file activity, system load)
  - `drafts/` - Quarantine for Tier 1 output
  - `outbox/` - Message drafts
  - `archive/` - Historical data
  - `backups/` - Snapshots

- **Interface**:
  - `interface/web/index.html` - Web dashboard (React-like, vanilla JS)
  - `interface/ghost.py` - System tray interface

- **Documentation**:
  - `README.md` - Developer handover
  - `SETUP_GUIDE.md` - Docker setup
  - `SETUP_NATIVE.md` - Native setup
  - `TECHNICAL_ARCHITECTURE.md` - Implementation blueprint
  - `LAUNCH_PLAN.md` - Launch strategy
  - `docs/` - Legacy docs, memory design

- **Tests**:
  - `tests/test_agency.py` - Agency system tests
  - `tests/test_monologue.py` - Monologue tests
  - `tests/test_integration.py` - Integration tests

## Languages & Technologies

- **Backend**: Python 3.11+, FastAPI, Pydantic
- **LLM**: Gemini API (primary), Ollama (fallback)
- **Vector DB**: Qdrant (Docker or embedded SQLite)
- **Frontend**: Vanilla HTML/CSS/JS (WebSocket)
- **Infrastructure**: Docker Compose (Ollama + Qdrant)
- **Dependencies**: See `requirements.txt`

## Key Scripts

- `python -m progeny_root.core.main` - Start FastAPI server
- `uvicorn core.main:app --reload` - Development server
- `docker-compose up -d` - Start infrastructure
- `python bootstrap_progeny.py` - Initialize directories

## Immediate Issues

1. **Missing `sallie/` directory** - Required for plan/deviations/docs
2. **No comprehensive test suite** - Only 3 test files, missing coverage
3. **Web UI is basic** - No React/Next.js, just vanilla HTML
4. **No CI/CD** - Missing GitHub Actions or similar
5. **No design tokens** - CSS variables exist but not documented
6. **Missing accessibility audit** - No ARIA, keyboard navigation incomplete
7. **No RUNNING.md** - Setup guides exist but no single "how to run" doc
8. **Dream Cycle incomplete** - Basic structure, missing full extraction/hypothesis logic
9. **Convergence incomplete** - Questions defined, extraction/compilation missing
10. **No style guide** - Design system not documented

## Dependencies Status

- `requirements.txt` exists with commented-out packages (sentence-transformers, whisper, TTS)
- Some dependencies may need verification (plyer, pystray for Ghost UI)
- No `package.json` (frontend is vanilla JS, no build step)

