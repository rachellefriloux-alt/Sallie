/**
 * Adaptive UI System - Role-Based Layouts
 * Enhanced with animations, keyboard shortcuts, and accessibility
 * Supports: Work, Personal, Crisis, Creative, Learning modes
 */

class AdaptiveUI {
    constructor() {
        this.currentMode = localStorage.getItem('sallie-ui-mode') || 'personal';
        this.animationsEnabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.keyboardShortcuts = new Map();
        this.focusableElements = [];
        this.modes = {
            work: {
                name: 'Work',
                icon: '💼',
                colors: {
                    primary: '#3b82f6', // Blue
                    secondary: '#1e40af',
                    accent: '#60a5fa'
                },
                layout: 'compact',
                density: 'high'
            },
            personal: {
                name: 'Personal',
                icon: '🏠',
                colors: {
                    primary: '#8b5cf6', // Purple
                    secondary: '#7c3aed',
                    accent: '#a78bfa'
                },
                layout: 'spacious',
                density: 'medium'
            },
            crisis: {
                name: 'Crisis',
                icon: '🚨',
                colors: {
                    primary: '#ef4444', // Red
                    secondary: '#dc2626',
                    accent: '#f87171'
                },
                layout: 'minimal',
                density: 'low'
            },
            creative: {
                name: 'Creative',
                icon: '🎨',
                colors: {
                    primary: '#f59e0b', // Amber
                    secondary: '#d97706',
                    accent: '#fbbf24'
                },
                layout: 'flexible',
                density: 'medium'
            },
            learning: {
                name: 'Learning',
                icon: '📚',
                colors: {
                    primary: '#10b981', // Green
                    secondary: '#059669',
                    accent: '#34d399'
                },
                layout: 'structured',
                density: 'medium'
            }
        };
        
        this.init();
    }
    
    init() {
        this.createModeSelector();
        this.applyMode(this.currentMode);
        this.setupQuickActions();
        this.setupKeyboardShortcuts();
        this.setupAccessibility();
        this.setupAnimations();
        this.loadSavedPreferences();
    }
    
    loadSavedPreferences() {
        // Load saved mode and preferences
        const savedMode = localStorage.getItem('sallie-ui-mode');
        if (savedMode && this.modes[savedMode]) {
            this.currentMode = savedMode;
        }
        
        // Load animation preference
        const animationsPref = localStorage.getItem('sallie-animations');
        if (animationsPref !== null) {
            this.animationsEnabled = animationsPref === 'true';
        }
    }
    
    createModeSelector() {
        const selector = document.createElement('div');
        selector.className = 'mode-selector';
        selector.setAttribute('role', 'tablist');
        selector.setAttribute('aria-label', 'Select UI mode');
        
        selector.innerHTML = Object.keys(this.modes).map((mode, index) => `
            <button class="mode-btn ${mode === this.currentMode ? 'active' : ''}" 
                    data-mode="${mode}" 
                    role="tab"
                    aria-selected="${mode === this.currentMode}"
                    aria-controls="mode-${mode}"
                    id="mode-tab-${mode}"
                    tabindex="${mode === this.currentMode ? '0' : '-1'}"
                    title="${this.modes[mode].name} (Press ${index + 1} to switch)">
                <span class="mode-icon" aria-hidden="true">${this.modes[mode].icon}</span>
                <span class="mode-name">${this.modes[mode].name}</span>
            </button>
        `).join('');
        
        // Add click handlers
        selector.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.switchMode(mode);
            });
            
            // Keyboard navigation
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.switchMode(btn.dataset.mode);
                }
            });
        });
        
        // Insert into header
        const header = document.querySelector('.chat-header');
        if (header) {
            const actions = header.querySelector('.chat-actions');
            if (actions) {
                header.insertBefore(selector, actions);
            } else {
                header.appendChild(selector);
            }
        }
    }
    
    switchMode(mode) {
        if (!this.modes[mode]) return;
        
        const previousMode = this.currentMode;
        this.currentMode = mode;
        
        // Animate transition
        if (this.animationsEnabled) {
            this.animateModeTransition(previousMode, mode);
        }
        
        this.applyMode(mode);
        
        // Update active button with accessibility
        document.querySelectorAll('.mode-btn').forEach(btn => {
            const isActive = btn.dataset.mode === mode;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
            btn.setAttribute('tabindex', isActive ? '0' : '-1');
        });
        
        // Save preference
        localStorage.setItem('sallie-ui-mode', mode);
        
        // Announce to screen readers
        this.announceToScreenReader(`Switched to ${this.modes[mode].name} mode`);
        
        // Notify backend (optional)
        this.notifyModeChange(mode);
    }
    
    animateModeTransition(fromMode, toMode) {
        const container = document.querySelector('.app-container');
        if (!container) return;
        
        // Add transition class
        container.classList.add('mode-transitioning');
        
        // Fade out
        container.style.opacity = '0.7';
        container.style.transform = 'scale(0.98)';
        
        // After fade, apply new mode
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'scale(1)';
            
            setTimeout(() => {
                container.classList.remove('mode-transitioning');
            }, 300);
        }, 200);
    }
    
    applyMode(mode) {
        const modeConfig = this.modes[mode];
        const root = document.documentElement;
        
        // Update CSS variables
        root.style.setProperty('--mode-primary', modeConfig.colors.primary);
        root.style.setProperty('--mode-secondary', modeConfig.colors.secondary);
        root.style.setProperty('--mode-accent', modeConfig.colors.accent);
        
        // Apply layout class
        document.body.className = `mode-${mode} layout-${modeConfig.layout}`;
        
        // Update UI density
        this.applyDensity(modeConfig.density);
        
        // Mode-specific customizations
        this.customizeForMode(mode);
    }
    
    applyDensity(density) {
        const container = document.querySelector('.app-container');
        if (!container) return;
        
        container.className = container.className.replace(/density-\w+/g, '');
        container.classList.add(`density-${density}`);
    }
    
    customizeForMode(mode) {
        // Work mode: Compact, task-focused
        if (mode === 'work') {
            this.showProductivityFeatures(true);
            this.setChatWidth('narrow');
        }
        
        // Personal mode: Warm, spacious
        if (mode === 'personal') {
            this.showProductivityFeatures(false);
            this.setChatWidth('wide');
        }
        
        // Crisis mode: Minimal, focused
        if (mode === 'crisis') {
            this.showProductivityFeatures(false);
            this.hideSidebar();
            this.setChatWidth('full');
        }
        
        // Creative mode: Flexible, visual
        if (mode === 'creative') {
            this.showProductivityFeatures(true);
            this.setChatWidth('wide');
        }
        
        // Learning mode: Structured, hierarchical
        if (mode === 'learning') {
            this.showProductivityFeatures(true);
            this.setChatWidth('medium');
        }
    }
    
    showProductivityFeatures(show) {
        // Toggle productivity panels, quick actions, etc.
        const features = document.querySelectorAll('.productivity-feature');
        features.forEach(f => f.style.display = show ? 'block' : 'none');
    }
    
    setChatWidth(width) {
        const mainStage = document.querySelector('.main-stage');
        if (!mainStage) return;
        
        mainStage.className = mainStage.className.replace(/width-\w+/g, '');
        mainStage.classList.add(`width-${width}`);
    }
    
    hideSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.display = 'none';
        }
    }
    
    setupQuickActions() {
        // Create quick action buttons based on mode
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'quick-actions';
        actionsContainer.setAttribute('role', 'toolbar');
        actionsContainer.setAttribute('aria-label', 'Quick actions');
        
        const actions = [
            { action: 'new-task', title: 'New Task', shortcut: 'N', icon: 'plus' },
            { action: 'search', title: 'Search', shortcut: 'K', icon: 'search' },
            { action: 'settings', title: 'Settings', shortcut: ',', icon: 'settings' },
            { action: 'help', title: 'Help & Shortcuts', shortcut: '?', icon: 'help' }
        ];
        
        actionsContainer.innerHTML = actions.map(a => `
            <button class="quick-action" 
                    data-action="${a.action}" 
                    aria-label="${a.title} (Press ${a.shortcut})"
                    title="${a.title} (${a.shortcut})"
                    data-shortcut="${a.shortcut}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    ${this.getActionIcon(a.icon)}
                </svg>
                <span class="sr-only">${a.title}</span>
            </button>
        `).join('');
        
        // Insert into header
        const header = document.querySelector('.chat-header');
        if (header) {
            const actionsEl = header.querySelector('.chat-actions');
            if (actionsEl) {
                actionsEl.appendChild(actionsContainer);
            } else {
                header.appendChild(actionsContainer);
            }
        }
        
        // Add click handlers
        actionsContainer.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
            
            // Keyboard support
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleQuickAction(btn.dataset.action);
                }
            });
        });
    }
    
    getActionIcon(iconType) {
        const icons = {
            plus: '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',
            search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
            settings: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
            help: '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>'
        };
        return icons[iconType] || icons.plus;
    }
    
    handleQuickAction(action) {
        switch(action) {
            case 'new-task':
                this.promptNewTask();
                break;
            case 'search':
                this.openSearch();
                break;
            case 'settings':
                this.openSettings();
                break;
            case 'help':
                this.showKeyboardShortcuts();
                break;
        }
    }
    
    promptNewTask() {
        const task = prompt('What task would you like to create?');
        if (task) {
            // Send to backend
            this.sendToBackend('create_task', { task });
            this.announceToScreenReader('Task created');
        }
    }
    
    openSearch() {
        const searchInput = document.querySelector('input[type="search"], #search-input');
        if (searchInput) {
            searchInput.focus();
            this.announceToScreenReader('Search focused');
        } else {
            // Create search input if it doesn't exist
            this.createSearchInput();
        }
    }
    
    createSearchInput() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input type="search" 
                   id="search-input" 
                   placeholder="Search conversations, memories..."
                   aria-label="Search"
                   autocomplete="off">
            <button class="search-close" aria-label="Close search" onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(searchContainer);
        document.getElementById('search-input').focus();
    }
    
    openSettings() {
        // Create settings panel
        const settingsPanel = document.createElement('div');
        settingsPanel.className = 'settings-panel';
        settingsPanel.setAttribute('role', 'dialog');
        settingsPanel.setAttribute('aria-labelledby', 'settings-title');
        settingsPanel.innerHTML = `
            <div class="settings-content">
                <h2 id="settings-title">Settings</h2>
                <label>
                    <input type="checkbox" ${this.animationsEnabled ? 'checked' : ''} 
                           onchange="window.adaptiveUI.toggleAnimations(this.checked)">
                    Enable animations
                </label>
                <button onclick="this.closest('.settings-panel').remove()" aria-label="Close settings">Close</button>
            </div>
        `;
        document.body.appendChild(settingsPanel);
        settingsPanel.querySelector('button').focus();
    }
    
    toggleAnimations(enabled) {
        this.animationsEnabled = enabled;
        localStorage.setItem('sallie-animations', enabled);
        this.announceToScreenReader(`Animations ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    showKeyboardShortcuts() {
        const shortcuts = Array.from(this.keyboardShortcuts.entries())
            .map(([key, desc]) => `<tr><td><kbd>${key}</kbd></td><td>${desc}</td></tr>`)
            .join('');
        
        const helpPanel = document.createElement('div');
        helpPanel.className = 'help-panel';
        helpPanel.setAttribute('role', 'dialog');
        helpPanel.setAttribute('aria-labelledby', 'help-title');
        helpPanel.innerHTML = `
            <div class="help-content">
                <h2 id="help-title">Keyboard Shortcuts</h2>
                <table>
                    <thead>
                        <tr><th>Key</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        ${shortcuts}
                    </tbody>
                </table>
                <button onclick="this.closest('.help-panel').remove()" aria-label="Close help">Close</button>
            </div>
        `;
        document.body.appendChild(helpPanel);
        helpPanel.querySelector('button').focus();
    }
    
    setupKeyboardShortcuts() {
        // Register keyboard shortcuts
        this.keyboardShortcuts.set('1', 'Switch to Work mode');
        this.keyboardShortcuts.set('2', 'Switch to Personal mode');
        this.keyboardShortcuts.set('3', 'Switch to Crisis mode');
        this.keyboardShortcuts.set('4', 'Switch to Creative mode');
        this.keyboardShortcuts.set('5', 'Switch to Learning mode');
        this.keyboardShortcuts.set('N', 'New task');
        this.keyboardShortcuts.set('K', 'Search');
        this.keyboardShortcuts.set(',', 'Settings');
        this.keyboardShortcuts.set('?', 'Show shortcuts');
        this.keyboardShortcuts.set('Esc', 'Close dialogs');
        
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            const key = e.key;
            const ctrl = e.ctrlKey || e.metaKey;
            
            // Mode switching (1-5)
            if (key >= '1' && key <= '5') {
                const modes = ['work', 'personal', 'crisis', 'creative', 'learning'];
                const modeIndex = parseInt(key) - 1;
                if (modes[modeIndex]) {
                    e.preventDefault();
                    this.switchMode(modes[modeIndex]);
                }
            }
            
            // Quick actions
            if (key === 'n' || key === 'N') {
                if (!ctrl) {
                    e.preventDefault();
                    this.handleQuickAction('new-task');
                }
            }
            
            if (key === 'k' || key === 'K') {
                if (!ctrl) {
                    e.preventDefault();
                    this.openSearch();
                }
            }
            
            if (key === ',') {
                e.preventDefault();
                this.openSettings();
            }
            
            if (key === '?') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }
            
            // Escape closes dialogs
            if (key === 'Escape') {
                const dialogs = document.querySelectorAll('.settings-panel, .help-panel, .search-container');
                dialogs.forEach(d => d.remove());
            }
        });
    }
    
    setupAccessibility() {
        // Add skip link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Ensure main content has ID
        const mainContent = document.querySelector('.main-stage, .chat-container, main');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
        
        // Add ARIA live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'aria-live-region';
        document.body.appendChild(liveRegion);
        
        // Track focusable elements
        this.updateFocusableElements();
        
        // Add focus indicators
        this.addFocusIndicators();
    }
    
    setupAnimations() {
        if (!this.animationsEnabled) {
            document.documentElement.style.setProperty('--animation-duration', '0s');
            return;
        }
        
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            .mode-transitioning {
                transition: opacity 0.2s ease, transform 0.2s ease;
            }
            
            .quick-action:focus-visible,
            .mode-btn:focus-visible {
                outline: 2px solid var(--mode-accent);
                outline-offset: 2px;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .fade-in {
                animation: fadeIn 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
    
    updateFocusableElements() {
        this.focusableElements = Array.from(
            document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        );
    }
    
    addFocusIndicators() {
        // Focus indicators are added via CSS in setupAnimations
        // This method can be extended for additional focus management
    }
    
    notifyModeChange(mode) {
        // Notify backend about mode change (optional)
        if (window.ws && window.ws.readyState === WebSocket.OPEN) {
            window.ws.send(JSON.stringify({
                type: 'mode_change',
                mode: mode
            }));
        }
    }
    
    sendToBackend(type, data) {
        if (window.ws && window.ws.readyState === WebSocket.OPEN) {
            window.ws.send(JSON.stringify({ type, ...data }));
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adaptiveUI = new AdaptiveUI();
    });
} else {
    window.adaptiveUI = new AdaptiveUI();
}

