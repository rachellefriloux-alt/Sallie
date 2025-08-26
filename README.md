# Sallie

**Persona:** Tough love meets soul care
---
provenance:
	repo: Sallie
	path: /docs
	scope: canonical
---

## Overview
Sallie is a modular, production-ready AI companion and launcher platform. It features advanced emotional intelligence, persona evolution, secure identity management, and a modern UI. All modules are fully integrated and tested.

## Features
- Adaptive Persona Engine
- Emotional Intelligence & Tone Analysis
- Secure Identity & Onboarding
- `ai`: Emotional intelligence, OpenAI integration
- `identity`: Secure user management
./gradlew.bat clean build test assemble
./gradlew.bat :app:run
```

## Testing
All modules have sample and extensible test support. Run:
```sh
./gradlew.bat test
```

## CI/CD
- Recommended: GitHub Actions, GitLab CI, or similar
- Linting: ktlint
- Coverage: Jacoco
- Secure password hashing in identity module

- Android: APK
- Docker: Add Dockerfile for containerization

## License
MIT or custom license as desired.
