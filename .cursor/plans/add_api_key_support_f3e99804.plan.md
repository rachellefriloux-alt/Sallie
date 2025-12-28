---
name: Add API Key Support
overview: "Add OpenAI API support as an additional option alongside Gemini, and securely store the provided Gemini API key. This extends the LLM router to support three providers: Gemini (primary), OpenAI (optional), and Ollama (fallback)."
todos:
  - id: create-openai-client
    content: Create OpenAI client module (openai_client.py) with chat, embed, and health check methods
    status: pending
  - id: update-llm-router
    content: Extend LLMRouter to support OpenAI as middle priority (Gemini → OpenAI → Ollama)
    status: pending
    dependencies:
      - create-openai-client
  - id: update-config
    content: Add Gemini API key and OpenAI configuration to config.json
    status: pending
  - id: update-main-init
    content: Update main.py to initialize OpenAI client and pass to LLMRouter
    status: pending
    dependencies:
      - create-openai-client
      - update-llm-router
  - id: update-requirements
    content: Add openai package to requirements.txt
    status: pending
  - id: update-docs
    content: Update RUNNING.md and API_DOCUMENTATION.md with OpenAI support
    status: pending
    dependencies:
      - update-config
  - id: test-provider-chain
    content: Test that provider fallback chain works (Gemini → OpenAI → Ollama)
    status: pending
    dependencies:
      - update-main-init
---

#Add API Key Support (OpenAI + Gemini)

## Overview

Add OpenAI API support as an additional LLM provider option, and securely store the provided Gemini API key. The system will support three LLM providers: Gemini (primary), OpenAI (optional), and Ollama (local fallback).

## Current State

- System uses Gemini API (primary) and Ollama (fallback)
- Gemini API key field exists but is empty in config.json
- No OpenAI support currently
- LLM router handles Gemini + Ollama

## Implementation Tasks

### 1. Add OpenAI Client

**File**: `progeny_root/core/openai_client.py` (new)

- Create OpenAI client similar to GeminiClient:
- Support for chat completions
- Support for embeddings
- Rate limiting
- Error handling and retries
- Health check method

**Features**:

- Use OpenAI Python SDK (openai package)
- Support for gpt-4, gpt-3.5-turbo models
- Support for text-embedding-3-small/large embeddings
- Fallback handling

### 2. Update LLM Router

**File**: `progeny_root/core/llm_router.py`

- Extend LLMRouter to support three providers:
- Priority: Gemini → OpenAI → Ollama
- Try each in order if previous fails
- Health checks for all providers
- Configuration for provider priority

**Changes**:

- Add `openai_client` parameter to `__init__`
- Update `chat()` to try OpenAI after Gemini
- Update `embed()` to try OpenAI embeddings
- Update health check to include OpenAI

### 3. Update Config Schema

**File**: `progeny_root/core/config.json`

- Add OpenAI configuration:
  ```json
                  "llm": {
                    "provider": "gemini",
                    "gemini_api_key": "AIzaSyAFGMHiK2SaAzjmCrH3_3-lcUXy_c4nPuM",
                    "gemini_model": "gemini-1.5-flash",
                    "openai_api_key": "",
                    "openai_model": "gpt-4",
                    "fallback_provider": "ollama",
                    "fallback_model": "tinyllama",
                    "ollama_url": "http://localhost:11434"
                  },
                  "embeddings": {
                    "provider": "gemini",
                    "gemini_model": "text-embedding-004",
                    "openai_model": "text-embedding-3-small",
                    "fallback_provider": "ollama",
                    "fallback_model": "nomic-embed-text",
                    "vector_size": 768
                  }
  ```




### 4. Update Main Initialization

**File**: `progeny_root/core/main.py`

- Initialize OpenAI client if API key provided
- Pass OpenAI client to LLMRouter
- Update initialization logic to handle three providers

### 5. Secure Key Storage

**File**: `progeny_root/core/config.json`

- Store Gemini key in config (already provided)
- Add OpenAI key field (empty by default)
- Document that keys should be in .env or secrets.json for production

**Security Notes**:

- Keys in config.json are visible (acceptable for local dev)
- For production, recommend using environment variables or encrypted secrets.json
- Add .env support for keys (optional enhancement)

### 6. Update Requirements

**File**: `progeny_root/requirements.txt`

- Add `openai>=1.0.0` package

### 7. Update Documentation

**Files**: `RUNNING.md`, `API_DOCUMENTATION.md`

- Document OpenAI support
- Update environment variables section
- Add OpenAI configuration examples

## Files to Modify

1. `progeny_root/core/config.json` - Add Gemini key and OpenAI config
2. `progeny_root/core/llm_router.py` - Add OpenAI support
3. `progeny_root/core/main.py` - Initialize OpenAI client
4. `progeny_root/requirements.txt` - Add openai package
5. `RUNNING.md` - Update docs

## Files to Create

1. `progeny_root/core/openai_client.py` - OpenAI client implementation

## Acceptance Criteria

- [ ] Gemini API key stored in config.json
- [ ] OpenAI client implemented and tested
- [ ] LLM router supports three providers (Gemini → OpenAI → Ollama)
- [ ] System works with Gemini key provided
- [ ] System works with OpenAI key if provided
- [ ] System falls back to Ollama if both APIs unavailable
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced