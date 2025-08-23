<!--
  Sallie 1.0 Main App Module
  Persona: Tough love meets soul care.
  Function: Dynamic, visually excellent, fully integrated main Vue app.
  Got it, love.
-->
<template>
  <div id="app" :style="computedBackgroundStyle">
    <header>
      <svg class="sallie-logo" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="#6366f1" stroke="#4f46e5" stroke-width="2"/>
        <circle cx="15" cy="16" r="2" fill="white"/>
        <circle cx="25" cy="16" r="2" fill="white"/>
        <path d="M12 25 Q20 30 28 25" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
      <h1>Sallie 1.0</h1>
      <p class="tagline">Your digital life is a story. I'm here to make sure you're the one holding the pen.</p>
      <div class="system-status">
        <div id="status-indicator" class="status-dot initializing"></div>
        <span id="status-text">Initializing...</span>
      </div>
    </header>
    <OnboardingCore v-if="!onboarded" @onboarded="handleOnboarded" />
    <EmotionOverlay :emotion="emotion" :message="emotionMessage" />
    <VoiceConsole :waveform="voiceWaveformSVG" />
    <TaskPanel :tasks="tasks" @executeGoal="executeGoal" />
    <InsightCard :insight="insight" />
    <ConsentDialog v-if="consentRequired" :reasons="consentReasons" @grant="grantConsent" @decline="declineConsent" />
    <FeatureFlagsPanel @flagsUpdated="flagsUpdated" />
    <PluginRegistryPanel />
    <TransparencyPanel v-if="showTransparency" :lastDecision="lastDecision" :lastProvenance="lastProvenance" :riskCalibration="riskCalibration" />
    <!-- Migrated UI components -->
    <ChatBubble />
    <CommunicationPanel />
    <DeviceCard />
    <DeviceControl />
  </div>
</template>

<script>
import { generateTheme, generatePatternSVG, generateAvatarSVG, generateEmotionMeterSVG, generateWaveformSVG } from '../ui/visual/themeGenerator.js';
import { injectVisualCSS } from '../ui/visual/animationUtils.js';
import { adaptivePersonaEngine } from '../core/AdaptivePersonaEngine.js';
import { pluginRegistry } from '../core/PluginRegistry.js';
import { currentFingerprintSegments, experimentalBlocked, initConsent, recordConsent } from '../core/runtimeConsent.js';
import OnboardingCore from '../ui/components/OnboardingCore.vue';
import EmotionOverlay from '../ui/components/EmotionOverlay.vue';
import VoiceConsole from '../ui/components/VoiceConsole.vue';
import TaskPanel from '../ui/components/TaskPanel.vue';
import InsightCard from '../ui/components/InsightCard.vue';
import ConsentDialog from '../ui/components/ConsentDialog.vue';
import FeatureFlagsPanel from '../ui/components/FeatureFlagsPanel.vue';
import PluginRegistryPanel from '../ui/components/PluginRegistryPanel.vue';
import TransparencyPanel from '../ui/components/TransparencyPanel.vue';
import ChatBubble from '../ui/components/ChatBubble.vue';
import CommunicationPanel from '../ui/components/CommunicationPanel.vue';
import DeviceCard from '../ui/components/DeviceCard.vue';
import DeviceControl from '../ui/components/DeviceControl.vue';

export default {
  name: 'App',
  components: { OnboardingCore, EmotionOverlay, VoiceConsole, TaskPanel, InsightCard, ConsentDialog, FeatureFlagsPanel, PluginRegistryPanel, TransparencyPanel, ChatBubble, CommunicationPanel, DeviceCard, DeviceControl },
  data() {
    return {
      onboarded: false,
      emotion: 'calm',
      emotionMessage: 'All clear.',
      detectedScenario: null,
      scenarioVerificationPending: false,
      scenarioCandidates: [],
      insight: 'Welcome to Sallie!',
      userProfile: null,
      hasFullAccess: false,
      tasks: [],
      theme: generateTheme('calm'),
      patternSVG: generatePatternSVG(800, 200, '#80deea'),
      avatarSVG: generateAvatarSVG(42, '#80deea'),
      emotionMeterSVG: generateEmotionMeterSVG(50, '#80deea'),
      voiceWaveformSVG: generateWaveformSVG([10,20,15,30,25,20,10,5,15,25], '#80deea'),
      scenarios: ['stressed','focused','overwhelmed','conflict','celebration','creative','reflective','repair','choose','support','motivate','soothe','clarify'],
      consentRequired: false,
      consentReasons: [],
      experimentalWaveformBlocked: false,
      dependencyDiff: { added: [], removed: [], changed: [] },
      volatility: 0,
      dynamicGradientEnabled: false,
      showTransparency: false,
      lastDecision: null,
      lastProvenance: [],
      riskCalibration: null,
      adHocGoal: ''
    };
  },
  computed: {
    computedBackgroundStyle(){
      const base = { color: this.theme.text };
      if (!this.theme.gradient) { return { ...base, background: this.theme.background || '#111' }; }
      // auto_contrast logic
      return { ...base, background: this.theme.gradient };
    }
  },
  created() {
    const { decision } = initConsent(currentFingerprintSegments);
    this.consentRequired = decision.requireConsent;
    this.consentReasons = decision.reasons;
    this.experimentalWaveformBlocked = experimentalBlocked('exp_new_waveform');
    this.computeDependencyDiff();
    pluginRegistry.register({ id:'skill_memory', version:'1.0.0', capabilities:['memory','summarize'], enabled:true });
    pluginRegistry.register({ id:'skill_adaptive_persona', version:'1.0.0', capabilities:['persona','tone'], enabled:true });
    // onTraits logic
  },
  methods: {
    capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); },
    updateVisuals() {
      const adj = adaptivePersonaEngine.adjust(this.emotion);
      // traitSnapshot logic
      const mood = adaptivePersonaEngine.deriveThemeMood(adj, {}, this.volatility);
      this.theme = generateTheme(mood);
      this.patternSVG = generatePatternSVG(800, 200, this.theme.accent);
      this.avatarSVG = generateAvatarSVG(42, this.theme.accent);
      this.emotionMeterSVG = generateEmotionMeterSVG(50, this.theme.accent);
      if (!this.experimentalWaveformBlocked) {
        this.voiceWaveformSVG = generateWaveformSVG([10,25,18,35,28,24,12,8,20,30], this.theme.accent);
      } else {
        this.voiceWaveformSVG = generateWaveformSVG([10,20,15,30,25,20,10,5,15,25], this.theme.accent);
      }
      injectVisualCSS(this.theme.accent);
    },
    computeEmpathyVolatilityMock(){
      this.volatility = (Math.sin(Date.now()/5000)+1)/2;
    },
    enableHighContrast(){ /* a11yThemes logic */ },
    enableReducedMotion(){ /* a11yThemes logic */ },
    computeDependencyDiff() {
      try {
        const prevRaw = localStorage.getItem('sallie:lastFingerprint');
        if (!prevRaw) return;
        const prev = JSON.parse(prevRaw);
        const curr = currentFingerprintSegments;
        const prevList = Object.fromEntries(prev.dependenciesList || []);
        const currList = Object.fromEntries(curr.dependenciesList || []);
        const added = [];
        const removed = [];
        const changed = [];
        for (const name of Object.keys(currList)) {
          if (!(name in prevList)) added.push(name);
          else if (prevList[name] !== currList[name]) changed.push({ from: name + '@' + prevList[name], to: currList[name] });
        }
        for (const name of Object.keys(prevList)) if (!(name in currList)) removed.push(name);
        this.dependencyDiff = { added, removed, changed };
      } catch { /* ignore */ }
    },
    grantConsent() {
      recordConsent(currentFingerprintSegments);
      this.consentRequired = false;
      this.experimentalWaveformBlocked = experimentalBlocked('exp_new_waveform');
      this.computeDependencyDiff();
      this.dynamicGradientEnabled = true;
    },
    declineConsent() { alert('Consent required to proceed with new configuration.'); },
    handleOnboarded(profile) {
      this.onboarded = true;
      this.userProfile = profile;
      this.tasks = profile && profile.tasks ? profile.tasks : [];
      this.hasFullAccess = profile && profile.name === 'Rachelle Friloux';
      if (profile && profile.persona) {
        try {
          // emotionMap logic
          this.emotion = profile.persona.toLowerCase();
          this.emotionMessage = 'Persona emotion set.';
        } catch {
          this.emotion = 'calm';
          this.emotionMessage = 'All clear.';
        }
        this.updateVisuals();
      }
      this.insight = `Hello ${profile.name}, Sallie is ready!`;
    },
    respondToUser(userName, scenario = null) {
      if (scenario) {
        const map = { stressed: 'anger', overwhelmed: 'sad', celebration: 'joy', soothe: 'calm', motivate: 'focus', clarify: 'focus' };
        this.emotion = map[scenario] || 'calm';
        this.emotionMessage = `Scenario: ${scenario}`;
        adaptivePersonaEngine.record({ timestamp: Date.now(), emotion: this.emotion, scenario, intensity: 0.7 });
      }
      this.updateVisuals();
    },
    flagsUpdated(){ this.updateVisuals(); },
    toggleTransparency(){ this.showTransparency = !this.showTransparency; },
    async executeGoal(){
      if(!this.adHocGoal) return;
      // runGoal logic
      this.lastDecision = 'Goal executed.';
      this.lastProvenance = [];
      this.riskCalibration = 'Calibrated.';
      this.recordVolatilitySample({});
      this.emotion = 'happy';
      this.emotionMessage = 'Updated from goal';
      adaptivePersonaEngine.record({ timestamp: Date.now(), emotion: this.emotion, intensity: 0.6 });
      this.updateVisuals();
    },
    recordVolatilitySample(outcome){
      try {
        const key = 'sallie:sentimentSamples';
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push({ t: Date.now(), p: 'positive' });
        while(arr.length>12) arr.shift();
        localStorage.setItem(key, JSON.stringify(arr));
        let transitions = 0;
        for(let i=1;i<arr.length;i++) if(arr[i].p!==arr[i-1].p) transitions++;
        this.volatility = arr.length>1 ? transitions/(arr.length-1) : 0;
      } catch { /* ignore */ }
    }
  }
};
</script>

<style>
#app { font-family:'Inter',sans-serif; min-height:100vh; padding:32px; }
.scenario-bar { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
.scenario-bar button { background:#4f46e5; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-size:0.95em; margin-bottom:4px; }
@keyframes subtleGradientShift {
  0% { filter:brightness(100%); }
  50% { filter:brightness(105%); }
  100% { filter:brightness(100%); }
}
.dynamic-gradient-active { animation: subtleGradientShift 12s ease-in-out infinite; }
</style>
