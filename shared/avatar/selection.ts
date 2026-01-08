/**
 * Shared Avatar Selection System
 * Identical across all platforms - Web, Mobile, Desktop
 */

export interface AvatarOption {
  id: string;
  name: string;
  description: string;
  theme: string;
  style: string;
  personality_traits: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  visual_elements: string[];
  preview_url: string;
  unlock_requirements?: string[];
}

export interface AvatarCustomization {
  base_avatar: string;
  color_scheme: 'peacock' | 'leopard' | 'obsidian' | 'celestial' | 'void';
  style_variants: string[];
  accessories: string[];
  effects: string[];
  personal_touches: string[];
}

export interface AvatarRenderConfig {
  size: 'small' | 'medium' | 'large' | 'full';
  format: 'png' | 'svg' | 'webp';
  quality: number;
  background: 'transparent' | 'solid' | 'gradient';
  animation: boolean;
  interactive: boolean;
}

export class AvatarSelection {
  private avatarOptions: AvatarOption[];
  private selectedAvatar: AvatarOption | null;
  private customizations: AvatarCustomization;
  private callbacks: Record<string, Function>;

  constructor() {
    this.avatarOptions = this.loadAvatarOptions();
    this.selectedAvatar = null;
    this.customizations = this.initializeCustomizations();
    this.callbacks = {};
  }

  private loadAvatarOptions(): AvatarOption[] {
    return [
      {
        id: 'peacock_elegant',
        name: 'Peacock Elegant',
        description: 'Graceful, intelligent, and mystically beautiful',
        theme: 'peacock',
        style: 'elegant',
        personality_traits: ['wisdom', 'beauty', 'mystery', 'grace'],
        colors: {
          primary: '#008080',
          secondary: '#4169e1',
          accent: '#d4a574'
        },
        visual_elements: ['feathers', 'iridescence', 'crown', 'flowing_lines'],
        preview_url: '/avatars/peacock_elegant.png'
      },
      {
        id: 'peacock_compassionate',
        name: 'Peacock Compassionate',
        description: 'Warm, empathetic, and nurturing',
        theme: 'peacock',
        style: 'compassionate',
        personality_traits: ['empathy', 'love', 'care', 'support'],
        colors: {
          primary: '#ff69b4',
          secondary: '#ff1493',
          accent: '#ffb6c1'
        },
        visual_elements: ['soft_feathers', 'glow', 'hearts', 'gentle_curves'],
        preview_url: '/avatars/peacock_compassionate.png'
      },
      {
        id: 'peacock_creative',
        name: 'Peacock Creative',
        description: 'Artistic, imaginative, and innovative',
        theme: 'peacock',
        style: 'creative',
        personality_traits: ['creativity', 'imagination', 'art', 'innovation'],
        colors: {
          primary: '#9370db',
          secondary: '#8a2be2',
          accent: '#dda0dd'
        },
        visual_elements: ['paint_splashes', 'sparkles', 'brush_strokes', 'rainbow'],
        preview_url: '/avatars/peacock_creative.png'
      },
      {
        id: 'leopard_strategic',
        name: 'Leopard Strategic',
        description: 'Powerful, ambitious, and calculating',
        theme: 'leopard',
        style: 'strategic',
        personality_traits: ['ambition', 'power', 'strategy', 'leadership'],
        colors: {
          primary: '#d4a574',
          secondary: '#cd853f',
          accent: '#daa520'
        },
        visual_elements: ['spots', 'strength', 'focus', 'intensity'],
        preview_url: '/avatars/leopard_strategic.png'
      },
      {
        id: 'leopard_protective',
        name: 'Leopard Protective',
        description: 'Guardian, defender, and fiercely loyal',
        theme: 'leopard',
        style: 'protective',
        personality_traits: ['protectiveness', 'loyalty', 'courage', 'defense'],
        colors: {
          primary: '#8b4513',
          secondary: '#a0522d',
          accent: '#cd853f'
        },
        visual_elements: ['shield', 'armor', 'strength', 'guardian_aura'],
        preview_url: '/avatars/leopard_protective.png'
      },
      {
        id: 'obsidian_mystic',
        name: 'Obsidian Mystic',
        description: 'Mysterious, deep, and spiritually connected',
        theme: 'obsidian',
        style: 'mystic',
        personality_traits: ['mystery', 'wisdom', 'spirituality', 'depth'],
        colors: {
          primary: '#1a1a1a',
          secondary: '#2f4f4f',
          accent: '#483d8b'
        },
        visual_elements: ['crystals', 'shadows', 'mystic_symbols', 'cosmic_energy'],
        preview_url: '/avatars/obsidian_mystic.png'
      },
      {
        id: 'celestial_joy',
        name: 'Celestial Joy',
        description: 'Radiant, joyful, and uplifting',
        theme: 'celestial',
        style: 'joy',
        personality_traits: ['joy', 'happiness', 'light', 'optimism'],
        colors: {
          primary: '#4169e1',
          secondary: '#87ceeb',
          accent: '#ffd700'
        },
        visual_elements: ['stars', 'light_rays', 'sparkles', 'rainbow_aura'],
        preview_url: '/avatars/celestial_joy.png'
      },
      {
        id: 'void_transcendent',
        name: 'Void Transcendent',
        description: 'Beyond form, infinite, and boundless',
        theme: 'void',
        style: 'transcendent',
        personality_traits: ['transcendence', 'infinity', 'boundlessness', 'cosmic'],
        colors: {
          primary: '#6a0dad',
          secondary: '#8b008b',
          accent: '#9400d3'
        },
        visual_elements: ['void_energy', 'infinite_patterns', 'cosmic_swirl', 'transcendent_light'],
        preview_url: '/avatars/void_transcendent.png'
      }
    ];
  }

  private initializeCustomizations(): AvatarCustomization {
    return {
      base_avatar: 'peacock_elegant',
      color_scheme: 'peacock',
      style_variants: [],
      accessories: [],
      effects: [],
      personal_touches: []
    };
  }

  // Core Avatar Selection Methods
  getAvailableAvatars(): AvatarOption[] {
    return [...this.avatarOptions];
  }

  getAvatarById(id: string): AvatarOption | null {
    return this.avatarOptions.find(avatar => avatar.id === id) || null;
  }

  selectAvatar(avatarId: string): void {
    const avatar = this.getAvatarById(avatarId);
    if (!avatar) {
      throw new Error(`Avatar with ID ${avatarId} not found`);
    }

    this.selectedAvatar = avatar;
    this.customizations.base_avatar = avatarId;
    this.customizations.color_scheme = avatar.theme as any;
    
    this.triggerCallbacks('avatarSelected', avatar);
    this.triggerCallbacks('customizationChanged', this.customizations);
  }

  getSelectedAvatar(): AvatarOption | null {
    return this.selectedAvatar;
  }

  // Customization Methods
  updateColorScheme(scheme: 'peacock' | 'leopard' | 'obsidian' | 'celestial' | 'void'): void {
    this.customizations.color_scheme = scheme;
    this.triggerCallbacks('customizationChanged', this.customizations);
  }

  addStyleVariant(variant: string): void {
    if (!this.customizations.style_variants.includes(variant)) {
      this.customizations.style_variants.push(variant);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  removeStyleVariant(variant: string): void {
    const index = this.customizations.style_variants.indexOf(variant);
    if (index > -1) {
      this.customizations.style_variants.splice(index, 1);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  addAccessory(accessory: string): void {
    if (!this.customizations.accessories.includes(accessory)) {
      this.customizations.accessories.push(accessory);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  removeAccessory(accessory: string): void {
    const index = this.customizations.accessories.indexOf(accessory);
    if (index > -1) {
      this.customizations.accessories.splice(index, 1);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  addEffect(effect: string): void {
    if (!this.customizations.effects.includes(effect)) {
      this.customizations.effects.push(effect);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  removeEffect(effect: string): void {
    const index = this.customizations.effects.indexOf(effect);
    if (index > -1) {
      this.customizations.effects.splice(index, 1);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  addPersonalTouch(touch: string): void {
    if (!this.customizations.personal_touches.includes(touch)) {
      this.customizations.personal_touches.push(touch);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  removePersonalTouch(touch: string): void {
    const index = this.customizations.personal_touches.indexOf(touch);
    if (index > -1) {
      this.customizations.personal_touches.splice(index, 1);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  // Rendering Methods
  getCustomization(): AvatarCustomization {
    return { ...this.customizations };
  }

  setCustomization(customization: AvatarCustomization): void {
    this.customizations = { ...customization };
    this.triggerCallbacks('customizationChanged', this.customizations);
  }

  renderAvatar(config: AvatarRenderConfig): string {
    const avatar = this.selectedAvatar;
    if (!avatar) {
      throw new Error("No avatar selected");
    }

    // Build render URL based on configuration
    const baseUrl = '/api/avatar/render';
    const params = new URLSearchParams({
      avatar: avatar.id,
      size: config.size,
      format: config.format,
      quality: config.quality.toString(),
      background: config.background,
      animation: config.animation.toString(),
      interactive: config.interactive.toString(),
      ...this.getCustomizationParams()
    });

    return `${baseUrl}?${params.toString()}`;
  }

  private getCustomizationParams(): Record<string, string> {
    const params: Record<string, string> = {};
    
    params.color_scheme = this.customizations.color_scheme;
    params.style_variants = this.customizations.style_variants.join(',');
    params.accessories = this.customizations.accessories.join(',');
    params.effects = this.customizations.effects.join(',');
    params.personal_touches = this.customizations.personal_touches.join(',');
    
    return params;
  }

  // Avatar Analysis Methods
  getAvatarPersonality(): string[] {
    if (!this.selectedAvatar) return [];
    return [...this.selectedAvatar.personality_traits];
  }

  getAvatarTheme(): string {
    if (!this.selectedAvatar) return '';
    return this.selectedAvatar.theme;
  }

  getAvatarColors(): Record<string, string> {
    if (!this.selectedAvatar) return {};
    return { ...this.selectedAvatar.colors };
  }

  getAvatarVisualElements(): string[] {
    if (!this.selectedAvatar) return [];
    return [...this.selectedAvatar.visual_elements];
  }

  // Compatibility Methods
  isCompatibleWithPersonality(traits: string[]): number {
    if (!this.selectedAvatar) return 0;
    
    const avatarTraits = this.selectedAvatar.personality_traits;
    const matches = traits.filter(trait => avatarTraits.includes(trait));
    
    return matches.length / Math.max(traits.length, avatarTraits.length);
  }

  getCompatibilityScore(traits: string[]): number {
    return this.isCompatibleWithPersonality(traits);
  }

  getRecommendedAvatars(traits: string[]): AvatarOption[] {
    return this.avatarOptions
      .map(avatar => ({
        avatar,
        score: this.isCompatibleWithPersonality(traits)
      }))
      .filter(item => item.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .map(item => item.avatar);
  }

  // Event handling
  on(event: string, callback: Function): void {
    this.callbacks[event] = callback;
  }

  private triggerCallbacks(event: string, data: any): void {
    if (this.callbacks[event]) {
      this.callbacks[event](data);
    }
  }

  // Utility methods
  reset(): void {
    this.selectedAvatar = null;
    this.customizations = this.initializeCustomizations();
    this.triggerCallbacks('avatarReset', this.customizations);
  }

  exportCustomization(): string {
    return JSON.stringify(this.customizations, null, 2);
  }

  importCustomization(data: string): void {
    try {
      const customization = JSON.parse(data);
      this.setCustomization(customization);
      
      if (customization.base_avatar) {
        this.selectAvatar(customization.base_avatar);
      }
    } catch (error) {
      throw new Error("Invalid customization data format");
    }
  }
}

// Singleton instance for shared use across platforms
let avatarSelection: AvatarSelection | null = null;

export function getAvatarSelection(): AvatarSelection {
  if (!avatarSelection) {
    avatarSelection = new AvatarSelection();
  }
  return avatarSelection;
}
