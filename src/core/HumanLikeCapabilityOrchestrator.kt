// Salle Persona: HumanLikeCapabilityOrchestrator
package org.sallie.core

import org.sallie.core.engine.ProactiveAssistanceEngine
import org.sallie.core.interfaces.IProactiveAssistanceEngine

class HumanLikeCapabilityOrchestrator(private val engine: IProactiveAssistanceEngine) {
    init { engine.initialize() }

    fun handleTask(taskName: String, context: Map<String, Any>) {
        engine.performTask(taskName, context)
    }

    fun saveState() {
        engine.saveToMemory()
    }

    fun reportStatus(): String = engine.status
}
