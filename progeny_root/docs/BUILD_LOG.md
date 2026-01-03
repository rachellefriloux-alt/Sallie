# Implementation Checklist

Use this document to track your progress as you build the Python core.

## Phase 0: Infrastructure ✅

- [x] Directory structure created (`bootstrap_progeny.py`)
- [x] Docker Compose configured (`docker-compose.yml`)
- [x] Configuration file seeded (`core/config.json`)
- [x] Governance script ready (`core/verify_governance.py`)

## Phase 1: The Heart (Limbic System)

- [ ] Create `core/limbic.py`
- [ ] Implement `LimbicState` Pydantic model
- [ ] Implement `load_state()` and `save_state()` (Atomic writes)
- [ ] Implement `update(delta_t, delta_w, ...)` with asymptotic math
- [ ] Implement `decay()` function for Arousal
- [ ] Test: Run a script that initializes Soul, updates Trust, and verifies JSON output.

## Phase 2: The Mind (Cognitive Core)

- [ ] Create `core/monologue.py`
- [ ] Set up Ollama API client (using requests or library)
- [ ] Implement Perception prompt ("Amygdala Scan")
- [ ] Implement Gemini prompt ("Divergent Options")
- [ ] Implement INFJ prompt ("Convergent Filter")
- [ ] Implement Synthesis prompt ("Final Voice")
- [ ] Test: Feed a text input and see the internal debate logged to stdout.

## Phase 3: Memory (Retrieval)

- [ ] Create `core/retrieval.py` (Note: Handover referred to this as `memory.py`)
- [ ] Connect to Qdrant (localhost:6333)
- [ ] Implement `add_memory(text, salience)`
- [ ] Implement `retrieve(query_text)`
- [ ] Test: Add a memory ("My name is Creator"), then query "Who am I?".

## Phase 4: The Loop (Integration)

- [ ] Create `core/main.py`
- [ ] Build the `POST /chat` endpoint
- [ ] Wire the loop: Input -> Perception -> Memory -> Monologue -> Output
- [ ] Connect `thoughts.log` to capture the internal monologue
- [ ] Test: Send a curl request to localhost:8000 and get a response.

## Phase 5: Agency (The Hands)

- [ ] Create `core/agency.py`
- [ ] Implement `PermissionMatrix` check based on Trust score
- [ ] Create `core/tools.py` with safe file writing functions
- [ ] Test: Try to write a file with Trust 0.5 (Should fail/draft) vs Trust 0.9 (Should succeed).

## Phase 6: Advanced Capabilities (The Soul)

- [ ] Create `core/foundry.py` (Stub)
  - [ ] Implement `EvaluationHarness` class
  - [ ] Implement `DriftReport` generation
- [ ] Create `core/convergence.py`
  - [ ] Implement the 14-question script logic
  - [ ] Implement "Elastic Mode" trust updates
- [ ] Create `core/kinship.py`
  - [ ] Implement `ContextManager` for multi-user state
  - [ ] Implement `Auth` middleware for API

## Phase 7: Interface (The Body)

- [ ] Create `interface/ghost.py`
  - [ ] Implement system tray icon (using `plyer` or similar)
  - [ ] Implement "Shoulder Tap" notification logic
- [ ] Create `interface/voice.py`
  - [ ] Implement STT loop (Whisper)
  - [ ] Implement TTS loop (Piper/Coqui)
- [ ] Create `interface/web/` (React Dashboard)
  - [ ] Scaffold basic React app
  - [ ] Connect to `POST /chat` and `GET /limbic`

## Phase 8: Launch & Onboarding 🚀

- [ ] **Hardware Setup**:
  - [ ] Install Ollama & Pull Models (`llama3`, `mistral`)
  - [ ] Install Qdrant (Docker)
- [ ] **The Great Convergence**:
  - [ ] Run `python -m core.convergence` to imprint the soul.
- [ ] **Legacy Migration**:
  - [ ] Run `python scripts/migrate_legacy.py` (if applicable).
- [ ] **System Start**:
  - [ ] Run `docker-compose up -d` (Infrastructure)
  - [ ] Run `python core/main.py` (The Progeny)

