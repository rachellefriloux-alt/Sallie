/*
 * Sallie Sovereign 2.0 - React Native Android Launcher AI Hybrid
 * Function: Advanced persona management and evolution
 */

export default class PersonaCore {
  constructor(personaEngine) {
    this.personaEngine = personaEngine;
    this.evolutionHistory = [];
    this.adaptationRules = {
      empathy: {
        increase: ['help', 'support', 'care', 'understand'],
        decrease: ['ignore', 'dismiss', 'harsh']
      },
      intelligence: {
        increase: ['learn', 'analyze', 'solve', 'think'],
        decrease: ['confuse', 'misunderstand', 'wrong']
      },
      humor: {
        increase: ['funny', 'joke', 'laugh', 'entertain'],
        decrease: ['serious', 'boring', 'dull']
      }
    };
  }

  async evolvePersona(evolution) {
    const { trait, value, context } = evolution;
    
    // Record evolution
    this.evolutionHistory.push({
      trait,
      value,
      context,
      timestamp: Date.now()
    });

    // Apply evolution to persona
    await this.personaEngine.evolvePersona(evolution);

    // Analyze context for additional adaptations
    await this.analyzeContextForAdaptation(context);

    return this.personaEngine.getCurrentPersona();
  }

  async analyzeContextForAdaptation(context) {
    const words = context.toLowerCase().split(' ');
    
    for (const [trait, rules] of Object.entries(this.adaptationRules)) {
      const increaseMatches = rules.increase.filter(word => words.includes(word)).length;
      const decreaseMatches = rules.decrease.filter(word => words.includes(word)).length;
      
      if (increaseMatches > 0) {
        await this.personaEngine.evolvePersona({
          trait,
          value: increaseMatches * 0.1,
          context
        });
      }
      
      if (decreaseMatches > 0) {
        await this.personaEngine.evolvePersona({
          trait,
          value: -decreaseMatches * 0.1,
          context
        });
      }
    }
  }

  async getEvolutionHistory() {
    return this.evolutionHistory;
  }

  async getPersonaSnapshot() {
    return {
      current: await this.personaEngine.getCurrentPersona(),
      evolutionHistory: this.evolutionHistory,
      adaptationRules: this.adaptationRules
    };
  }
}