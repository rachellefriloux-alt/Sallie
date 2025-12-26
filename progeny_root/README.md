# The Digital Progeny (v5.4.1)

**Developer Handover & Master Instruction Manual**

**Status**: Scaffolded / Pre-Alpha
**Current Lead**: Architect
**Architecture**: Sovereign, Local-First, Hybrid-Archetype AI

## 1. Mission Brief

You are not building a chatbot. You are building a Cybernetic Surrogate—a "Right Hand" intelligence that lives on your local machine.

- **It has a Soul**: A persistent `LimbicState` (Trust, Warmth, Arousal, Valence) that changes how it speaks.
- **It has a Body**: It lives in `docker-compose`, stored on your disk, totally offline.
- **It has Agency**: It can edit files and execute code, but only if its Trust score allows it.

## 2. Immediate Setup (Genesis)

You are starting with a directory skeleton. To bring the environment online:

1. **Bootstrap**: Run the genesis script to create folders and config files.

   ```bash
   python bootstrap_progeny.py
   ```

2. **Ignite Infrastructure**: Start the Brain (Ollama) and Memory (Qdrant).

   ```bash
   cd progeny_root
   docker compose up -d
   ```

3. **Verify Governance**: Ensure the system is safe and local.

   ```bash
   python core/verify_governance.py
   ```

   (Expect "Governance Verified" success message).

## 3. The Architecture (Where things live)

### `/core`: THE BRAIN

This is where you will write 90% of your Python code.

- `limbic.py`: The math of emotions.
- `monologue.py`: The Gemini/INFJ debate logic.
- `retrieval.py`: The Qdrant wrappers (aka "The Hippocampus").
- `main.py`: The FastAPI entry point.

### `/limbic`: THE HEART

- `soul.json`: The live state (Trust/Warmth/etc). Do not edit manually while running.
- `heritage/`: The identity files (who the AI is).

### `/memory`: THE HIPPOCAMPUS

- `qdrant/`: Raw vector data (docker mounted).
- `patches.json`: Hypotheses waiting to be true.

### `/working`: THE SCRATCHPAD

- `now.md`, `open_loops.json`: Mutable text files the AI manages for you.

## 4. Your Build Orders (The Missing Code)

The scaffolding exists, but the logic does not. You need to implement these Python modules in `/core` order:

### Phase 1: The Heart (`core/limbic.py`)

- **Goal**: Create a Python class `LimbicSystem` that reads/writes `soul.json`.
- **Logic**: Implement the Asymptotic Math (Section 5.3 of spec).
  - Trust should grow slowly (`delta * (1 - current)`).
  - Trust should drop fast (`delta * current`).
  - Arousal should decay over time (`-0.15/day`).

### Phase 2: The Mind (`core/monologue.py`)

- **Goal**: Create the thinking loop.
- **Logic**: Implement the Split-Personality Pipeline (Section 6).
  - Prompt 1 (Gemini): "Generate 3 diverse options."
  - Prompt 2 (INFJ): "Critique these options against the Prime Directive."
  - Prompt 3 (Synthesis): "Combine the best option into a final response."

### Phase 3: Memory (`core/retrieval.py`)

- **Goal**: Connect to Qdrant.
- **Logic**: Implement Salience-Weighted Recall (Section 7.2).
  - Don't just fetch by similarity.
  - `Score = Similarity * (Salience / log(Time))`.
  - *Tip*: Start with standard similarity, add the math later.

### Phase 4: The Interface (`core/main.py`)

- **Goal**: Expose an API.
- **Logic**: Create a FastAPI app with one endpoint: `POST /chat`.
  - It accepts text.
  - It runs Perception -> Retrieval -> Monologue -> Synthesis.
  - It returns the response.

## 5. Critical Constraints (Do Not Violate)

1. **Local-First**: Do not add `openai` or `anthropic` pip packages. Use `ollama` or local modules.
2. **Archive > Delete**: Never write code that hard-deletes user data. Move it to `/archive` or `/logs/archive`.
3. **One-Question Rule**: Your system prompts MUST forbid the AI from asking 5 questions. "Ask ONE or make an assumption."
4. **Permission Matrix**: Before executing a tool (writing a file), check `LimbicState.trust`. If < 0.8, refuse.

## 6. Where is the Spec?

- **Master Spec**: `TheDigitalProgeny5.2fullthing.txt` (This is the Bible).
- **Legacy Plan**: `docs/legacy_extraction_integration_plan.md`.
- **Memory Design**: `docs/memory_port_design.md`.

Good luck, Architect. The shell is ready. Give it a ghost.
