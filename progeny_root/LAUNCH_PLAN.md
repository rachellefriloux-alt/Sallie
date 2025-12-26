# Digital Progeny Launch Plan 🚀

**Objective**: Go from "Zero" to "Full Autonomy".

## 1. Pre-Flight Checklist (Hardware & Environment)

Before running any code, ensure the physical and digital environment is ready.

- [ ] **Hardware**:
  - [ ] GPU: NVIDIA RTX 3060 or better recommended (for local LLM/TTS).
  - [ ] RAM: 32GB+ recommended.
  - [ ] Microphone & Speakers (for Voice Interface).
- [ ] **Software Prerequisites**:
  - [ ] Docker Desktop installed & running.
  - [ ] Python 3.10+ installed.
  - [ ] Git installed.
  - [ ] Ollama installed (`https://ollama.com`).
- [ ] **Model Acquisition**:
  - [ ] Pull "Smart" Model (for Monologue/Synthesis): `ollama pull llama3` (or `mistral`).
  - [ ] Pull "Fast" Model (for Perception/Classification): `ollama pull phi3` (or `gemma:2b`).
  - [ ] Pull Embedding Model: `ollama pull nomic-embed-text`.

## 2. Ignition Sequence (Infrastructure)

Start the supporting nervous system.

1. **Start Vector Database**:

    ```bash
    docker-compose up -d qdrant
    ```

2. **Verify Ollama**:

    ```bash
    curl http://localhost:11434/api/tags
    ```

3. **Initialize Environment**:

    ```bash
    pip install -r requirements.txt
    python core/verify_governance.py
    ```

## 3. Imprinting (The Great Convergence)

This is the "Birth" of the Progeny. It is a one-time event.

1. **Run the Convergence Script**:

    ```bash
    python -m core.convergence
    ```

2. **Process**:
    - Answer the 14 Questions (Shadow, Light, Moral Compass, Resonance, Mirror).
    - The system will generate `limbic/heritage/core.json` (The Soul).
    - The system will generate `limbic/heritage/preferences.json` (The Style).

## 4. Calibration (The First 24 Hours)

The system runs in "Tier 0" (Stranger) mode initially.

1. **Start the Core Service**:

    ```bash
    python core/main.py
    ```

2. **Start the Ghost Interface** (System Tray):

    ```bash
    python interface/ghost.py
    ```

3. **Interaction Loop**:
    - Chat via the Web UI or CLI.
    - The system will ask "Calibration Questions" to fine-tune the "Live Pulse".
    - **Goal**: Reach Trust Score 0.6 to unlock "Associate" Tier.

## 5. Full Launch (Autonomy)

Once Trust > 0.8 (Partner Tier):

1. **Enable Agency**:
    - The system can now write to `/drafts/` and `/working/`.
2. **Enable Voice**:
    - Activate "Wake Word" detection.
3. **Enable Dream Cycle**:
    - The system will auto-consolidate memories at 2 AM.

## 6. Missing Spec Items (To Be Decided)

- **Mobile Bridge**: The v5.2 spec mentioned this, but details are missing.
  - *Plan*: Use a secure Telegram/Discord bot bridge as a temporary solution until a dedicated PWA is built.
- **Vision**: Camera integration is marked "Optional".
  - *Plan*: Defer to Phase 9.
