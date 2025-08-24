# Sallie

**Persona:** Tough love meets soul care

## Overview
Sallie is a modular, production-ready AI companion and launcher platform. It features advanced emotional intelligence, persona evolution, secure identity management, and a modern UI. All modules are fully integrated and tested.

## Features
- Adaptive Persona Engine
- Emotional Intelligence & Tone Analysis
- Secure Identity & Onboarding
- Dynamic Response Templates
- Modular Kotlin/JS/Android architecture
- Full Gradle build, test, and CI/CD support

## Modules
- `core`: Orchestration, persona logic, memory, values
- `ai`: Emotional intelligence, OpenAI integration
- `identity`: Secure user management
- `onboarding`: User onboarding flow
- `personaCore`: Persona evolution
- `responseTemplates`: Dynamic responses
- `tone`: Tone analysis
- `components`: UI components
- `app`: Main application entry point

## Build & Run
```sh
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

## Security
- Service account and secrets managed via environment variables
- Secure password hashing in identity module

## Packaging
- JVM: JAR
- Android: APK
- Docker: Add Dockerfile for containerization

## Release Notes
See `RELEASE_NOTES.md` for version history and changes.

## License
MIT or custom license as desired.
