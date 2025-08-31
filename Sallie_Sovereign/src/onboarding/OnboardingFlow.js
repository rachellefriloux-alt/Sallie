/*
 * Sallie Sovereign 2.0 - React Native Android Launcher AI Hybrid
 * Function: User onboarding flow management
 */

export default class OnboardingFlow {
  constructor(identityManager, personaEngine) {
    this.identityManager = identityManager;
    this.personaEngine = personaEngine;
    this.steps = [
      'welcome',
      'permissions',
      'personalization',
      'ai_setup',
      'launcher_setup',
      'completion'
    ];
  }

  async startOnboarding(userId) {
    const user = await this.identityManager.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      step: 'welcome',
      totalSteps: this.steps.length,
      user: user
    };
  }

  async completeStep(userId, step, data) {
    const user = await this.identityManager.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user with step data
    if (!user.onboarding) {
      user.onboarding = {};
    }
    user.onboarding[step] = data;
    user.onboarding.completedSteps = user.onboarding.completedSteps || [];
    user.onboarding.completedSteps.push(step);

    await this.identityManager.updateUser(userId, user);

    // Get next step
    const currentIndex = this.steps.indexOf(step);
    const nextStep = this.steps[currentIndex + 1];

    return {
      step: nextStep,
      totalSteps: this.steps.length,
      completedSteps: user.onboarding.completedSteps.length,
      isComplete: !nextStep
    };
  }

  async getOnboardingProgress(userId) {
    const user = await this.identityManager.getUser(userId);
    if (!user || !user.onboarding) {
      return { progress: 0, completedSteps: 0, totalSteps: this.steps.length };
    }

    return {
      progress: (user.onboarding.completedSteps?.length || 0) / this.steps.length,
      completedSteps: user.onboarding.completedSteps?.length || 0,
      totalSteps: this.steps.length
    };
  }
}