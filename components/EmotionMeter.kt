// Salle UI Component
// EmotionMeter.kt
// Migrated and upgraded for Sallie 2.0
// TODO: Integrate with ToneEngine and Persona UI


package com.sallie.components

import kotlin.math.roundToInt

data class Emotion(val name: String, val intensity: Double, val timestamp: Long)

class EmotionMeter {
    private val emotionHistory = mutableListOf<Emotion>()

    fun recordEmotion(name: String, intensity: Double) {
        val emotion = Emotion(name, intensity.coerceIn(0.0, 1.0), System.currentTimeMillis())
        emotionHistory.add(emotion)
    }

    fun getCurrentEmotion(): Emotion? = emotionHistory.lastOrNull()

    fun getEmotionSummary(): Map<String, Double> {
        return emotionHistory.groupBy { it.name }
            .mapValues { (_, emotions) ->
                emotions.map { it.intensity }.average().roundToInt().toDouble()
            }
    }

    fun visualize(): String {
        val current = getCurrentEmotion()
        return if (current != null) {
            "Current emotion: ${current.name} (Intensity: ${"%.2f".format(current.intensity)})"
        } else {
            "No emotion data recorded."
        }
    }
}
