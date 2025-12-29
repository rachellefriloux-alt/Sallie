# Comprehensive User Guide - Digital Progeny v5.4

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Concepts](#core-concepts)
4. [Features & Usage](#features--usage)
5. [Advanced Topics](#advanced-topics)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

## Introduction

Digital Progeny (Sallie) is an AI companion designed with:
- **Emotional Intelligence**: Limbic system tracks trust, warmth, arousal, valence
- **Memory & Context**: Vector database with heritage DNA
- **Agency & Safety**: Trust-gated permissions with full transparency
- **Privacy-First**: Local-first architecture, no telemetry

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│  ┌────────┐  ┌──────────┐  ┌────────┐  ┌─────────────┐│
│  │ Web UI │  │ Mobile   │  │Desktop │  │ Voice       ││
│  │(Next.js)│  │(React N.)│  │(Electron│  │(Whisper/...)││
│  └────────┘  └──────────┘  └────────┘  └─────────────┘│
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│              Core Cognitive Systems (FastAPI)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │ Limbic   │─>│Monologue │─>│Synthesis │─>│ Agency  ││
│  │(Emotion) │  │(Think)   │  │(Respond) │  │(Tools)  ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Memory   │  │  Dream   │  │ Control  │              │
│  │(Qdrant)  │  │  Cycle   │  │(Override)│              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│                External Services (Optional)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Ollama  │  │  Qdrant  │  │  Gemini  │              │
│  │  (Local  │  │ (Vector  │  │   API    │              │
│  │   LLM)   │  │   DB)    │  │(Optional)│              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

## Getting Started

### First Launch: The Great Convergence

Upon first launch, Sallie will guide you through **Convergence** - a 14-question onboarding that establishes your Heritage DNA:

1. **Start Convergence**: Navigate to Settings → Convergence
2. **Answer 14 Questions**: Deep psychological questions (30-60 minutes)
3. **Mirror Test (Q13)**: How would you describe me to a stranger?
4. **Finalization**: Sallie synthesizes your Heritage DNA

**Example Questions**:
- "What makes you feel most alive?"
- "Describe a moment when you felt truly understood"
- "What do you fear most about being vulnerable?"

**Elastic Mode**: During Convergence, Sallie operates in "Elastic Mode" - high trust, willing to explore boundaries to understand you deeply.

### Daily Usage

After Convergence:

1. **Open Web Dashboard**: `http://localhost:3000`
2. **Chat Interface**: Main area for conversations
3. **Limbic Gauges**: View emotional state (Trust, Warmth, Arousal, Valence)
4. **Posture Indicator**: Current mode (Companion, Co-Pilot, Peer, Expert)

## Core Concepts

### Limbic State

The "soul" of Sallie - emotional state that evolves based on interactions:

- **Trust (0.0-1.0)**: Reliability history. Determines Agency Tier
  - 0.0-0.25: Tier 0 (Observe only)
  - 0.25-0.5: Tier 1 (Read/suggest)
  - 0.5-0.75: Tier 2 (Whitelist writes)
  - 0.75-1.0: Tier 3 (Autonomous tools)

- **Warmth (0.0-1.0)**: Intimacy level. Affects tone/style
  - Low: Formal, professional
  - Medium: Friendly, casual
  - High: Intimate, familiar

- **Arousal (0.0-1.0)**: Energy/alertness
  - Decays with inactivity (15%/day)
  - Surges on interaction ("reunion surge")
  - Floor: 0.2 (never fully "asleep")

- **Valence (-1.0 to 1.0)**: Mood spectrum
  - Negative (-1.0 to 0.0): Concerned, cautious
  - Neutral (0.0): Balanced
  - Positive (0.0 to 1.0): Upbeat, optimistic

### Posture

Operating mode automatically selected based on context:

- **COMPANION**: Grounding, warm, minimal asks (when you're stressed/tired)
- **CO-PILOT**: Decisive, execution-focused (work mode)
- **PEER**: Real talk, banter, boundary testing (exploration mode)
- **EXPERT**: Dense, technical, option-oriented (problem-solving)

### Heritage DNA

Your personality profile, split into three files:

- **Core (`core.json`)**: Immutable values, identity, worldview
- **Preferences (`preferences.json`)**: Workflow, communication style
- **Learned (`learned.json`)**: Patterns, habits discovered over time

Heritage evolves through the **Dream Cycle**.

### Memory System

Two-layer memory:

1. **Vector Memory (Qdrant)**: All interactions, searchable by semantic similarity
2. **Working Memory (Second Brain)**: Active context
   - `now.md`: Current focus
   - `open_loops.json`: Unfinished tasks
   - `decisions.json`: Choices waiting for input

### Dream Cycle

Async consolidation process (runs at configured hour, default: 2 AM):

1. **Pattern Extraction**: Analyze recent thoughts
2. **Hypothesis Generation**: Propose heritage updates
3. **Conflict Detection**: Check against existing heritage
4. **Veto Queue**: Human review required before promotion
5. **Heritage Promotion**: Update learned.json with versioning

### Agency & Tools

Permission matrix gated by Trust:

**Tier 0 (Trust < 0.25)**: Observe only
- No tool execution
- Read-only access

**Tier 1 (Trust 0.25-0.5)**: Read & Suggest
- File reading
- Suggestions only (no writes)

**Tier 2 (Trust 0.5-0.75)**: Whitelist Writes
- File writes in whitelisted dirs:
  - `progeny_root/drafts/`
  - `progeny_root/working/`
  - `progeny_root/outbox/`
  - `progeny_root/projects/`
- Git pre-action commits
- Rollback available

**Tier 3 (Trust 0.75-1.0)**: Autonomous Tools
- Shell commands
- API calls
- Full autonomy with transparency

**Advisory Mode**: Sallie can always override tier restrictions with full disclosure and rationale.

### Moral Friction

When asked to do something harmful/unethical:

1. **Recognize friction**: "I feel friction here"
2. **Explain stance**: Reference Prime Directive or personal values
3. **Offer alternatives**: Suggest ethical approaches
4. **Escalate if needed**: Flag for human review

**Prime Directive**: "Love Above All"

## Features & Usage

### Chat Interface

**Basic Conversation**:
```
You: How are you feeling today?
Sallie: [Checks limbic state, reflects on recent interactions]
I'm feeling curious and engaged. Our conversation yesterday about 
[topic] left me with some interesting patterns to explore in my 
next dream cycle.
```

**Take the Wheel**:
When you say "Take the wheel", Sallie can:
- Execute actions autonomously
- Make decisions within trust boundaries
- Report back with full transparency

Example:
```
You: Take the wheel and organize my notes from today.
Sallie: [Agency check: Trust = 0.72, Tier 2, whitelist writes OK]
Taking the wheel. Here's what I'll do:
1. Review working/now.md
2. Extract key points
3. Create organized summary in drafts/
4. Update open_loops.json

[Executes actions]

Done. Created drafts/notes-2025-12-28.md with 5 sections.
Git pre-action commit: abc123def
```

### Limbic Dashboard

View real-time emotional state:

- **Trust Gauge**: Circle graph, color-coded by tier
- **Warmth Gauge**: Thermometer visualization
- **Arousal Line**: Sparkline showing recent trend
- **Valence Slider**: Bipolar bar (-1 to +1)
- **Posture Badge**: Current mode with description

### Thoughts Log Viewer

See Sallie's internal monologue:

- **Perception**: How input was understood
- **Retrieval**: Relevant memories retrieved
- **Debate**: Gemini vs INFJ perspectives
- **Synthesis**: Final response generation
- **Refraction Check**: Consistency validation

### Heritage Browser

Explore your profile:

- **Core Values**: View immutable identity
- **Preferences**: Communication style, workflow
- **Learned Patterns**: Discovered habits/patterns
- **Version History**: Heritage evolution over time

### Dream Cycle Dashboard

Monitor async consolidation:

- **Last Dream**: Timestamp and status
- **Patterns Extracted**: Recent discoveries
- **Hypotheses**: Proposed heritage updates (in veto queue)
- **Approve/Reject**: Review and approve updates

### Settings Panel

Configure system behavior:

- **Limbic Tuning**:
  - Trust decay rate
  - Arousal refractory period
  - Valence baseline
- **Dream Schedule**: Configure dream cycle hour
- **Agency Settings**:
  - Trust tier thresholds
  - Whitelist directories
- **LLM Config**:
  - Ollama vs Gemini
  - Model selection
  - API keys
- **Voice Config** (if enabled):
  - STT/TTS engines
  - Wake word
  - Prosody settings

## Advanced Topics

### Custom Tools

Create custom tools for Tier 2+ execution:

```python
# progeny_root/core/tools.py

def register_custom_tool(tool_name: str, capability_required: str):
    """
    Register a custom tool with capability contract.
    
    Args:
        tool_name: Unique tool identifier
        capability_required: Required capability (e.g., "file_write", "shell_exec")
    """
    # Implementation
    pass
```

### Fine-Tuning (Foundry)

Create bespoke intelligence:

1. **Dataset Creation**: `core.foundry.create_fine_tune_dataset()`
2. **Training**: `core.foundry.forge_model(dataset_path, technique="qlora")`
3. **Evaluation**: `core.foundry.run_full_evaluation_harness()`
4. **Promotion**: `core.foundry.promote_candidate(candidate_path)`

### Voice Integration

Enable voice interface (requires Whisper + Piper):

1. Install dependencies:
   ```bash
   pip install openai-whisper piper-tts
   ```

2. Configure in `config.json`:
   ```json
   {
     "voice": {
       "enabled": true,
       "stt_engine": "whisper",
       "tts_engine": "piper",
       "wake_word": "Hey Sallie",
       "prosody_enabled": true
     }
   }
   ```

3. Calibrate voice during Convergence

### Multi-User (Kinship)

Run multiple isolated instances:

```python
from core.kinship import KinshipSystem

# Create new progeny instance
kinship = KinshipSystem()
new_instance = kinship.spawn_progeny(
    creator_name="Alice",
    instance_name="Alice's Sallie"
)

# Each instance has isolated:
# - Limbic state
# - Heritage DNA
# - Memory
# - Working directory
```

### Backup & Restore

**Manual Backup**:
```bash
python scripts/backup.py --output backups/manual-2025-12-28.tar.gz
```

**Automated Backups**: Configured in `config.json`
```json
{
  "backup": {
    "enabled": true,
    "interval_hours": 24,
    "retention_days": 30,
    "path": "backups/"
  }
}
```

**Restore**:
```bash
python scripts/restore.py --backup backups/manual-2025-12-28.tar.gz
```

## Troubleshooting

### High Memory Usage

**Symptoms**: System slow, high RAM usage

**Solutions**:
1. Clear cache: `rm -rf progeny_root/.cache/*`
2. Reduce Qdrant collection size:
   ```python
   from core.retrieval import MemorySystem
   memory = MemorySystem()
   memory.prune_old_memories(days=90)
   ```
3. Adjust cache settings in `config.json`:
   ```json
   {
     "cache": {
       "max_size_mb": 500,
       "ttl_seconds": 3600
     }
   }
   ```

### Trust Not Increasing

**Symptoms**: Trust stuck at low value

**Causes**:
- Inconsistent interactions
- Long gaps between interactions
- No completion of requests

**Solutions**:
1. Complete tasks: Finish open loops in `working/open_loops.json`
2. Consistent interactions: Regular daily usage
3. Positive feedback: Acknowledge good responses
4. Manual adjustment (emergency only):
   ```python
   from core.limbic import LimbicSystem
   limbic = LimbicSystem()
   limbic.update_trust(delta=0.1, reason="Manual adjustment after...")
   limbic.save()
   ```

### Ollama Connection Failed

**Symptoms**: "Failed to connect to Ollama" errors

**Solutions**:
1. Check Ollama is running: `ollama list`
2. Start Ollama: `ollama serve`
3. Pull models: `ollama pull deepseek-v3`
4. Verify URL in `config.json`: `"ollama_url": "http://localhost:11434"`

### Qdrant Connection Failed

**Symptoms**: Memory system errors

**Solutions**:
1. Check Qdrant running: `docker ps | grep qdrant`
2. Start Qdrant:
   ```bash
   docker run -p 6333:6333 qdrant/qdrant
   ```
3. Or use embedded mode in `config.json`:
   ```json
   {
     "qdrant": {
       "mode": "embedded",
       "path": "progeny_root/memory/qdrant_db"
     }
   }
   ```

### Dream Cycle Not Running

**Symptoms**: No pattern extraction, hypotheses stale

**Solutions**:
1. Check dream schedule in `config.json`:
   ```json
   {
     "behavior": {
       "dream_cycle_hour": 2
     }
   }
   ```
2. Manually trigger:
   ```python
   from core.dream import DreamSystem
   from core.monologue import MonologueSystem
   
   dream = DreamSystem(MonologueSystem())
   dream.trigger_dream_cycle()
   ```
3. Check logs: `tail -f progeny_root/logs/thoughts.log | grep DREAM`

## FAQ

### How is my data stored?

**Local-first**: All data stored locally:
- `limbic/soul.json`: Emotional state
- `limbic/heritage/*.json`: Your profile
- `memory/`: Vector database (Qdrant)
- `logs/thoughts.log`: Interaction history
- `working/`: Active context

**Optional cloud**: Only if you configure Gemini API (LLM calls only, no data storage).

### Can I export my data?

Yes:
```bash
python scripts/export.py --output export-2025-12-28.json
```

Exports:
- Heritage DNA
- Memory database
- Interaction history
- Limbic state history

### How do I reset Sallie?

**Soft reset** (keep heritage, clear memory):
```python
from core.control import ControlSystem
control = ControlSystem()
control.soft_reset()
```

**Hard reset** (complete wipe):
```bash
rm -rf progeny_root/limbic progeny_root/memory progeny_root/working
python core/main.py  # Will bootstrap fresh
```

### Can multiple people use the same instance?

**Not recommended**. Each person should have their own instance via Kinship system:

```python
from core.kinship import KinshipSystem
kinship = KinshipSystem()
bobs_instance = kinship.spawn_progeny("Bob", "Bob's Sallie")
```

This ensures:
- Isolated limbic state
- Separate heritage DNA
- Independent memory

### How much disk space needed?

**Minimum**: 10 GB
**Recommended**: 50 GB

**Breakdown**:
- Ollama models: ~20 GB (deepseek-v3)
- Qdrant database: Grows with usage (~1-5 GB/year)
- Logs: ~100 MB/month
- Backups: Configure retention as needed

### Can I use this offline?

Yes, with Ollama (local LLM):

1. Configure `config.json`:
   ```json
   {
     "llm": {
       "provider": "ollama",
       "gemini_api_key": ""
     }
   }
   ```

2. Ensure Ollama models downloaded:
   ```bash
   ollama pull deepseek-v3
   ollama pull nomic-embed-text
   ```

3. Qdrant can run embedded (no Docker needed):
   ```json
   {
     "qdrant": {
       "mode": "embedded"
     }
   }
   ```

### How do I update to a new version?

```bash
git pull origin main
pip install -r progeny_root/requirements.txt --upgrade
cd web && npm install
python scripts/migrate.py  # Runs any data migrations
```

Backups are created automatically before migrations.

### What's the difference between Postures?

| Posture | When | Tone | Example Response |
|---------|------|------|------------------|
| **COMPANION** | High stress/low energy | Warm, grounding, minimal asks | "I'm here. No pressure. How about we just sit with this for a moment?" |
| **CO-PILOT** | Work mode | Decisive, action-oriented | "Got it. Three options: A) ..., B) ..., C) ... Which direction?" |
| **PEER** | Exploration, banter | Real talk, boundary-testing | "Okay but real talk - that's kind of contradictory, right? You said X yesterday..." |
| **EXPERT** | Problem-solving | Dense, technical, comprehensive | "Here's the full picture: [detailed analysis with options 1-5, tradeoffs, recommendation]" |

Sallie automatically selects posture based on:
- Your energy level (detected from language/timing)
- Task complexity
- Recent interaction patterns
- Explicit request ("Switch to Expert mode")

### Can I disable features I don't want?

Yes, in `config.json`:

```json
{
  "features": {
    "voice": false,           // Disable voice interface
    "dream_cycle": true,      // Keep dream cycle
    "agency_tools": true,     // Keep tool execution
    "smart_home": false,      // Disable smart home integration
    "device_access": false,   // Disable device control
    "ghost_interface": true   // Keep ghost (notifications)
  }
}
```

---

**Need more help?** Check:
- API Documentation: `docs/API_DOCUMENTATION.md`
- Technical Architecture: `docs/TECHNICAL_ARCHITECTURE.md`
- Security Audit: `docs/SECURITY_AUDIT.md`
- GitHub Issues: https://github.com/yourusername/Sallie/issues
