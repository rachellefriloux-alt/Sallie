# Legacy Mining — `before-main`

This repo primarily contributes **persona/tone behavioral machinery** (the “tough love meets soul care” operationalization).

## High-signal reusable patterns

### 1) Persona engine as state machine

From `personaCore/src/main/kotlin/com/sallie/personaCore/PersonaEngine.kt`:

- `PersonaMood` (steady/focused/supportive/gentle_push)
- `PersonaProfile` (tough_love/soul_care/wise_sister/balanced)
- maps `UserContext` + `SituationContext` → mood + profile
- directness
- warmth
- urgency

This is a portable pattern: **separate the “persona decision” layer from response generation**.

## Gaps / caveats

- Kotlin is app-embedded; Progeny will need a server-side equivalent.

## Progeny port recommendation

- takes structured signals (stress, energy, needs flags)
- outputs a small, stable persona state object
