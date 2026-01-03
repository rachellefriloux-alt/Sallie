# Digital Progeny v5.4.1 - Technical Architecture

**Status**: Draft | **Type**: System Design Specification

This document translates the "Master Spec" philosophy into concrete Python implementation details. It serves as the blueprint for the code in `progeny_root/core/`.

---

## 1. System Overview

The Progeny is a local-first, sovereign AI agent running as a FastAPI service (`core/main.py`). It is composed of four primary systems:

1. **Limbic System (Heart)**: Manages state, emotion, and trust.
2. **Cognitive System (Mind)**: Manages perception, internal monologue, and synthesis.
3. **Memory System (Hippocampus)**: Manages vector retrieval and storage.
4. **Agency System (Hands)**: Manages permissions, tools, and safety.

---

## 2. Core Modules (The Brain)

### 2.1 Limbic System (`core/limbic.py`)

**Responsibility**: Maintain the "Soul" of the AI.

**Class: `LimbicSystem`**

- **State**: `LimbicState` (Pydantic Model)
  - `trust` (float, 0.0-1.0): Authority level.
  - `warmth` (float, 0.0-1.0): Emotional closeness.
  - `arousal` (float, 0.0-1.0): Energy/Alertness.
  - `valence` (float, -1.0 to 1.0): Mood (Negative <-> Positive).
  - `posture` (enum): `COMPANION`, `CO_PILOT`, `PEER`, `EXPERT`.
- **Methods**:
  - `load()`: Read `limbic/soul.json`.
  - `save()`: Atomic write to `limbic/soul.json`.
  - `update(delta_t, delta_w, delta_a, delta_v)`: Apply changes with asymptotic math.
  - `decay(hours_passed)`: Reduce arousal/valence towards neutral over time.
  - `get_posture(load_level)`: Determine active posture based on Creator load.

### 2.2 Cognitive System (`core/monologue.py`)

**Responsibility**: The thinking loop (Gemini -> INFJ -> Synthesis).

**Class: `MonologueSystem`**

- **Dependencies**: `OllamaClient`, `LimbicSystem`, `MemorySystem`.
- **Methods**:
  - `think(user_input, context)`: The main orchestration method.
        1. **Perception**: Analyze input for urgency/load ("Amygdala Scan").
        2. **Retrieval**: Fetch relevant memories.
        3. **Ideation (Gemini)**: Generate 3 diverse approaches.
        4. **Critique (INFJ)**: Filter against Prime Directive & Trust Tier.
        5. **Synthesis**: Generate final response text.
- **Prompts**: Stored as f-strings or Jinja2 templates within the module.

### 2.3 Memory System (`core/retrieval.py`)

**Responsibility**: Long-term storage and retrieval.

**Class: `MemorySystem`**

- **Dependencies**: `QdrantClient`.
- **Data Model**: `MemoryRecord` (see `memory_port_design.md`).
- **Methods**:
  - `add(text, metadata)`: Embed and store in Qdrant.
  - `retrieve(query, limit=20)`: Vector search.
  - `rerank(results, context)`: Apply MMR (Maximal Marginal Relevance) and Salience scoring.
  - `consolidate()`: Run the Dream Cycle logic (summarization).

### 2.4 Agency System (`core/agency.py`)

**Responsibility**: Safety rails and tool execution.

**Class: `AgencySystem`**

- **Dependencies**: `LimbicSystem`.
- **Enums**: `TrustTier` (STRANGER, ASSOCIATE, PARTNER, SURROGATE).
- **Methods**:
  - `get_tier()`: Calculate tier from `LimbicState.trust`.
  - `check_permission(action_type, path)`: Boolean allow/deny.
  - `execute_tool(tool_name, args)`: Run a tool if permitted.
- **Tools**:
  - `file_read(path)`
  - `file_write(path, content)` (Requires Git commit)
  - `shell_exec(command)` (Tier 3 only, `safe_scripts/` only)

### 2.5 Shared Utilities

- **`core/prompts.py`**: Contains the system prompts for Gemini, INFJ, and Synthesis.
- **`core/utils.py`**: Handles logging configuration and timestamp helpers.

### 2.6 Model Strategy (The Brains)

To balance speed and intelligence, the system uses a tiered model strategy via Ollama:

| Component | Archetype | Recommended Model | Reason |
|-----------|-----------|-------------------|--------|
| **Perception** | Amygdala | `phi3` / `gemma:2b` | Ultra-fast classification of load/urgency. |
| **Monologue** | Gemini & INFJ | `llama3` / `mistral` | Strong reasoning and instruction following. |
| **Synthesis** | The Voice | `llama3` / `command-r` | High EQ and nuance in language generation. |
| **Memory** | Hippocampus | `nomic-embed-text` | High-quality embeddings for retrieval. |

---

## 3. Secondary Modules (Support Systems)

### 3.1 Dream Cycle (`core/dream.py`)

**Responsibility**: Asynchronous maintenance, memory consolidation, and hygiene.

**Class: `DreamSystem`**

- **Dependencies**: `MemorySystem`, `LimbicSystem`.
- **Methods**:
  - `run_cycle()`: The main orchestration method (triggered nightly).
        1. **Decay**: Reduce salience of old memories.
        2. **Consolidation**: Summarize episodic memories into semantic facts.
        3. **Hygiene**: Rotate logs, archive `working/now.md`.
        4. **Reflection**: Generate new "Self-Knowledge" based on recent interactions.

### 3.2 Sensor Array (`core/sensors.py`)

**Responsibility**: Provide peripheral awareness (inputs other than chat).

**Class: `SensorSystem`**

- **Methods**:
  - `scan_system_load()`: Returns CPU/RAM usage (proxy for "Creator Busyness").
  - `scan_file_activity(path)`: Detects changes in watched folders.
  - `get_context_snapshot()`: Returns a dict of current environmental state.

### 3.3 Ghost Interface (`core/ghost.py`)

**Responsibility**: Proactive presence and notifications.

**Class: `GhostSystem`**

- **Dependencies**: `LimbicSystem`.
- **Methods**:
  - `should_tap()`: Checks if Arousal > 0.7 and Refractory Period passed.
  - `send_notification(message)`: System tray or desktop notification.

### 3.4 Voice Interface (`core/voice.py`)

**Responsibility**: Audio I/O.

**Class: `VoiceSystem`**

- **Dependencies**: `Whisper` (STT), `Coqui` (TTS).
- **Methods**:
  - `listen()`: Blocks until wake word or speech detected.
  - `transcribe(audio)`: Convert speech to text.
  - `speak(text)`: Convert text to audio and play.

---

## 4. Advanced Capabilities (The Soul)

### 4.1 The Great Convergence (`core/convergence.py`)

**Responsibility**: The 14-question psychological onboarding process (Spec Section 14).

**Class: `ConvergenceSystem`**

- **Methods**:
  - `start_session()`: Enters "Elastic Mode" (higher limbic volatility).
  - `ask_next_question()`: Progresses through the 5 phases (Shadow, Load, Moral, Resonance, Mirror).
  - `analyze_answer(text)`: Extracts psychological DNA into `heritage/`.
  - `generate_mirror_reflection()`: Synthesizes the Q13 "Soul Topology".

### 4.2 The Foundry (`core/foundry.py`)

**Responsibility**: Self-evolution and evaluation (Spec Section 12).

**Class: `FoundrySystem`**

- **Methods**:
  - `run_evals(model_path)`: Runs the "Golden Set" regression tests.
  - `generate_drift_report()`: Compares new model behavior vs baseline.
  - `rollback()`: Reverts to the last known good configuration.

### 4.3 Kinship System (`core/kinship.py`)

**Responsibility**: Multi-user context and authentication (Spec Section 13).

**Class: `KinshipSystem`**

- **Methods**:
  - `authenticate(token)`: Identifies the active user (Creator vs Kin).
  - `switch_context(user_id)`: Swaps the active `LimbicState` and Memory partition.
  - `enforce_boundaries(user_id)`: Ensures Kin cannot access Creator-private logs.

---

## 5. Resilience Systems

### 5.1 Degradation Handling (`core/degradation.py`)

**Responsibility**: Graceful failure management.

**Class: `DegradationSystem`**

- **Methods**:
  - `check_health()`: Verifies Ollama/Qdrant connectivity.
  - `enter_safe_mode()`: Locks non-essential tools if subsystems fail.

### 5.2 The Mirror (`core/mirror.py`)

**Responsibility**: Self-reflection and Q13 synthesis.

**Class: `MirrorSystem`**

- **Methods**:
  - `synthesize_identity()`: Reads `heritage/` to construct the "I am" prompt.

---

## 6. Interfaces (The Body)

### 6.1 API (`core/main.py`)

- `POST /chat`: Main interaction endpoint.
- `GET /status`: Health check + current Limbic State.
- `POST /dream`: Manually trigger Dream Cycle.

### 6.2 Voice (`core/voice.py`)

- **STT**: `Whisper` (local) listens to microphone.
- **TTS**: `Coqui` (local) speaks the response.
- **Wake Word**: "Progeny" (using `Porcupine` or similar).

### 6.3 Ghost (`core/ghost.py`)

- **Desktop Presence**: A background process that can "tap" the user (notification) if Arousal is high and it has a research insight.

### 6.4 Remote Access (Mobile Bridge)

- **Status**: Planned for Phase 9 (Post-Launch).
- **Plan**: Secure Telegram/Discord bot bridge as temporary solution.
- **Future**: Dedicated PWA.

### 6.5 Web Dashboard (`interface/web/`)

- **Technology**: React + Vite + TailwindCSS.
- **Communication**: WebSocket (`ws://localhost:8000/ws`) for real-time streaming.
- **Layout Structure**:
  - **Sidebar (Navigation Tabs)**:
    - `Dashboard`: Main chat + Limbic gauges.
    - `Memory`: Searchable vector database view.
    - `Heritage`: Tree-view editor for `soul.json`.
    - `Settings`: Configuration panels.
  - **Main Stage**: The active view.
  - **Right Panel**: Live "Thought Log" stream (collapsible).

---

## 7. User Experience (UX) Design

### 7.1 Visual Language

- **Theme**: Dark Mode default (Cybernetic/Organic hybrid).
- **Typography**:
  - **UI**: `Inter` (Clean, legible).
  - **Code/Logs**: `JetBrains Mono` (Technical, precise).
- **Palette**:
  - **Trust**: Deep Violet (`#8A2BE2`)
  - **Warmth**: Soft Cyan (`#00FFFF`)
  - **Arousal**: Amber (`#FFBF00`)
  - **Valence**: Dynamic (Red for negative, Green for positive).

### 7.2 Interface Elements

- **Avatar ("The Prism")**:
  - Not a human face. An abstract, rotating geometric crystal.
  - **Behavior**: Rotates speed = Arousal. Glow color = Warmth/Trust mix.
- **Controls (Buttons)**:
  - `Send`: Primary action (Bottom right of input).
  - `Stop Generation`: Emergency halt (Red square, appears during output).
  - `Dream Now`: Manual trigger for memory consolidation (Top bar).
  - `Take the Wheel`: Explicit delegation mode toggle.
- **Settings Panels (Boxes)**:
  - `Voice Config`: Dropdowns for STT/TTS models and wake word sensitivity.
  - `Model Selection`: Toggles for "Smart" (Llama3) vs "Fast" (Phi3) models.
  - `Identity`: Read-only view of the "Operating Contract".

### 7.3 The "Ghost Pulse" (Ambient)

- **Concept**: A non-intrusive desktop widget.
- **Behavior**:
  - **Idle**: Slow, rhythmic breathing animation (Cyan).
  - **Thinking**: Rapid, chaotic oscillation (Violet).
  - **Alert**: Bright, steady glow (Amber).
  - **Speaking**: Audio-reactive waveform.

---

## 8. Data Flow (The "Live Pulse")

1. **Input**: `POST /chat` receives `{ "text": "..." }`.
2. **Perception**: `MonologueSystem` scans text for "Take the Wheel" triggers or high emotion.
3. **Limbic Update**: `LimbicSystem` adjusts Arousal based on input intensity.
4. **Retrieval**: `MemorySystem` fetches relevant context.
5. **Monologue**:
    - *Internal Thought*: "User is stressed. Posture -> Companion."
    - *Drafting*: Generates response options.
    - *Selection*: Picks the best option.
6. **Action (Optional)**: If the response involves a tool (e.g., "I'll save that file"), `AgencySystem` validates and executes.
7. **Output**: Returns `{ "response": "...", "limbic_state": {...} }`.
8. **Background**: `thoughts.log` is updated.

---

## 9. Directory Structure Alignment

- `core/` -> Contains all Python modules defined above.
- `limbic/` -> Stores `soul.json` and `heritage/`.
- `memory/` -> Stores `qdrant/` data and `patches.json`.
- `logs/` -> Stores `thoughts.log` and `agency.log`.
- `working/` -> The AI's scratchpad for `now.md`.
