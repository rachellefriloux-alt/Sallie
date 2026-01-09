import { renderHook, act } from '@testing-library/react'
import { useAccessibility } from '../../hooks/useAccessibility'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock document methods
Object.defineProperty(document, 'getElementById', {
  value: jest.fn(),
  writable: true,
})

Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockImplementation(() => ({
    innerText: '',
    setAttribute: jest.fn(),
    removeAttribute: jest.fn(),
  })),
  writable: true,
})

describe('useAccessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('Settings Management', () => {
    it('should initialize with default settings', () => {
      const { result } = renderHook(() => useAccessibility())

      expect(result.current.settings).toMatchObject({
        fontSize: 16,
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
        colorBlindness: 'none',
        keyboardNavigation: true,
        focusVisible: true,
        skipLinks: true,
        landmarks: true,
        altText: true,
        captions: true,
        transcripts: true,
        readableFonts: true,
        reducedAnimations: false,
        extendedTimeouts: false,
        simpleInterface: false,
        voiceControl: false,
      })
    })

    it('should load settings from localStorage', () => {
      const mockSettings = {
        fontSize: 20,
        highContrast: true,
        reducedMotion: true,
        screenReader: true,
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSettings))

      const { result } = renderHook(() => useAccessibility())

      expect(result.current.settings.fontSize).toBe(20)
      expect(result.current.settings.highContrast).toBe(true)
      expect(result.current.settings.reducedMotion).toBe(true)
      expect(result.current.settings.screenReader).toBe(true)
    })

    it('should update settings and save to localStorage', () => {
      const { result } = renderHook(() => useAccessibility())

      act(() => {
        result.current.updateSetting('fontSize', 24)
        result.current.updateSetting('highContrast', true)
      })

      expect(result.current.settings.fontSize).toBe(24)
      expect(result.current.settings.highContrast).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sallie_accessibility',
        expect.stringContaining('"fontSize":24')
      )
    })

    it('should reset settings to defaults', () => {
      const { result } = renderHook(() => useAccessibility())

      // Change some settings
      act(() => {
        result.current.updateSetting('fontSize', 32)
        result.current.updateSetting('highContrast', true)
      })

      // Reset
      act(() => {
        result.current.resetSettings()
      })

      expect(result.current.settings.fontSize).toBe(16)
      expect(result.current.settings.highContrast).toBe(false)
    })
  })

  describe('System Preference Detection', () => {
    it('should detect system dark mode preference', () => {
      const mockMatchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))

      window.matchMedia = mockMatchMedia

      const { result } = renderHook(() => useAccessibility())

      act(() => {
        const prefersDark = result.current.detectSystemPreferences()
        expect(prefersDark).toHaveProperty('prefersDarkMode')
        expect(prefersDark.prefersDarkMode).toBe(true)
      })
    })

    it('should detect system reduced motion preference', () => {
      const mockMatchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))

      window.matchMedia = mockMatchMedia

      const { result } = renderHook(() => useAccessibility())

      act(() => {
        const preferences = result.current.detectSystemPreferences()
        expect(preferences.prefersReducedMotion).toBe(true)
      })
    })

    it('should detect system high contrast preference', () => {
      const mockMatchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))

      window.matchMedia = mockMatchMedia

      const { result } = renderHook(() => useAccessibility())

      act(() => {
        const preferences = result.current.detectSystemPreferences()
        expect(preferences.prefersHighContrast).toBe(true)
      })
    })
  })

  describe('Screen Reader Support', () => {
    it('should announce messages to screen readers', () => {
      const { result } = renderHook(() => useAccessibility())

      const mockElement = {
        innerText: '',
        setAttribute: jest.fn(),
        removeAttribute: jest.fn(),
      }

      document.getElementById = jest.fn().mockReturnValue(mockElement)

      act(() => {
        result.current.announceToScreenReader('Test message')
      })

      expect(document.getElementById).toHaveBeenCalledWith('sallie-screen-reader-announcements')
      expect(mockElement.innerText).toBe('Test message')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite')
    })

    it('should create live region if it does not exist', () => {
      const { result } = renderHook(() => useAccessibility())

      const mockElement = {
        innerText: '',
        setAttribute: jest.fn(),
        removeAttribute: jest.fn(),
      }

      document.getElementById = jest.fn().mockReturnValue(null)
      document.createElement = jest.fn().mockReturnValue(mockElement)

      act(() => {
        result.current.announceToScreenReader('Test message')
      })

      expect(document.createElement).toHaveBeenCalledWith('div')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('id', 'sallie-screen-reader-announcements')
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite')
    })

    it('should handle urgent announcements', () => {
      const { result } = renderHook(() => useAccessibility())

      const mockElement = {
        innerText: '',
        setAttribute: jest.fn(),
        removeAttribute: jest.fn(),
      }

      document.getElementById = jest.fn().mockReturnValue(mockElement)

      act(() => {
        result.current.announceToScreenReader('Urgent message', 'assertive')
      })

      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive')
    })
  })

  describe('Focus Management', () => {
    it('should set focus to element', () => {
      const { result } = renderHook(() => useAccessibility())

      const mockElement = {
        focus: jest.fn(),
      }

      document.getElementById = jest.fn().mockReturnValue(mockElement)

      act(() => {
        result.current.setFocus('test-element')
      })

      expect(document.getElementById).toHaveBeenCalledWith('test-element')
      expect(mockElement.focus).toHaveBeenCalled()
    })

    it('should handle focus trapping within container', () => {
      const { result } = renderHook(() => useAccessibility())

      const mockContainer = {
        querySelectorAll: jest.fn().mockReturnValue([
          { focus: jest.fn() },
          { focus: jest.fn() },
          { focus: jest.fn() },
        ]),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }

      document.getElementById = jest.fn().mockReturnValue(mockContainer)

      act(() => {
        const cleanup = result.current.trapFocus('modal-container')
        expect(typeof cleanup).toBe('function')
      })

      expect(mockContainer.querySelectorAll).toHaveBeenCalledWith(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    })

    it('should handle keyboard navigation in focus trap', () => {
      const { result } = renderHook(() => useAccessibility())

      const mockElements = [
        { focus: jest.fn() },
        { focus: jest.fn() },
        { focus: jest.fn() },
      ]

      const mockContainer = {
        querySelectorAll: jest.fn().mockReturnValue(mockElements),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }

      document.getElementById = jest.fn().mockReturnValue(mockContainer)

      act(() => {
        result.current.trapFocus('modal-container')
      })

      // Simulate keyboard event
      const keyboardEvent = new KeyboardEvent('keydown', { key: 'Tab' })
      const eventHandler = mockContainer.addEventListener.mock.calls[0][1]
      eventHandler(keyboardEvent)
    })
  })

  describe('Color Accessibility', () => {
    it('should calculate contrast ratio', () => {
      const { result } = renderHook(() => useAccessibility())

      act(() => {
        const ratio = result.current.calculateContrastRatio('#000000', '#FFFFFF')
        expect(ratio).toBe(21) // Maximum contrast
      })

      act(() => {
        const ratio = result.current.calculateContrastRatio('#FFFFFF', '#FFFFFF')
        expect(ratio).toBe(1) // Minimum contrast
      })
    })

    it('should check WCAG compliance', () => {
      const { result } = renderHook(() => useAccessibility())

      act(() => {
        const compliance = result.current.checkWCAGCompliance('#000000', '#FFFFFF', 'large')
        expect(compliance.aa).toBe(true)
        expect(compliance.aaa).toBe(true)
      })

      act(() => {
        const compliance = result.current.checkWCAGCompliance('#808080', '#FFFFFF', 'normal')
        expect(compliance.aa).toBe(false) // Gray on white fails AA
      })
    })

    it('should generate accessible colors', () => {
      const { result } = renderHook(() => useAccessibility())

      act(() => {
        const colors = result.current.generateAccessibleColors('#0000FF')
        expect(colors).toHaveProperty('background')
        expect(colors).toHaveProperty('foreground')
        expect(colors).toHaveProperty('border')
        expect(colors).toHaveProperty('hover')
      })
    })

    it('should apply color blindness filters', () => {
      const { result } = renderHook(() => useAccessibility())

      const filters = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia']

      filters.forEach(filter => {
        act(() => {
          result.current.updateSetting('colorBlindness', filter)
          expect(result.current.settings.colorBlindness).toBe(filter)
        })
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should handle keyboard shortcuts', () => {
      const { result } = renderHook(() => useAccessibility())

      const mockHandler = jest.fn()

      act(() => {
        result.current.registerKeyboardShortcut('alt+n', mockHandler)
      })

      // Simulate keyboard event
      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'n',
        altKey: true,
      })

      act(() => {
        result.current.handleKeyboardEvent(keyboardEvent)
      })

      expect(mockHandler).toHaveBeenCalled()
    })

    it('should handle skip links', () => {
      const { result } = renderHook(() => useAccessibility())

      act(() => {
        result.current.updateSetting('skipLinks', true)
      })

      expect(result.current.settings.skipLinks).toBe(true)
    })

    it('should handle focus indicators', () => {
      const { result } = renderHook(() => useAccessibility())

      act(() => {
        result.current.updateSetting('focusVisible', true)
      })

      expect(result.current.settings.focusVisible).toBe(true)
    })
  })

  describe('Voice Control', () => {
    it('should initialize voice control', () => {
      const { result } = renderHook(() => useAccessibility())

      const mockRecognition = {
        start: jest.fn(),
        stop: jest.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      }

      Object.defineProperty(window, 'SpeechRecognition', {
        value: jest.fn().mockImplementation(() => mockRecognition),
        writable: true,
      })

      act(() => {
        result.current.updateSetting('voiceControl', true)
      })

      expect(result.current.settings.voiceControl).toBe(true)
    })

    it('should handle voice commands', () => {
      const { result } = renderHook(() => useAccessibility())

      const mockRecognition = {
        start: jest.fn(),
        stop: jest.fn(),
        onresult: null,
        onerror: null,
        onend: null,
      }

      Object.defineProperty(window, 'SpeechRecognition', {
        value: jest.fn().mockImplementation(() => mockRecognition),
        writable: true,
      })

      act(() => {
        result.current.updateSetting('voiceControl', true)
      })

      // Simulate voice recognition result
      const mockEvent = {
        results: [
          {
            0: {
              transcript: 'click submit',
              confidence: 0.9,
            },
          },
        ],
      }

      if (mockRecognition.onresult) {
        mockRecognition.onresult(mockEvent)
      }
    })
  })

  describe('Accessibility Features', () => {
    it('should handle font size adjustments', () => {
      const { result } = renderHook(() => useAccessibility())

      const fontSizes = [12, 14, 16, 18, 20, 24, 32]

      fontSizes.forEach(size => {
        act(() => {
          result.current.updateSetting('fontSize', size)
          expect(result.current.settings.fontSize).toBe(size)
        })
      })
    })

    it('should handle high contrast mode', () => {
      const { result } = renderHook(() => useAccessibility())

      act(() => {
        result.current.updateSetting('highContrast', true)
      })

      expect(result.current.settings.highContrast).toBe(true)
    })

    it('should handle reduced motion', () => {
      const { result } = renderHook(() => useAccessibility())

      act(() => {
        result.current.updateSetting('reducedMotion', true)
      })

      expect(result.current.settings.reducedMotion).toBe(true)
    })

    it('should handle readable fonts', () => {
      const { result } = renderHook(() => useAccessibility())

      act(() => {
        result.current.updateSetting('readableFonts', true)
      })

      expect(result.current.settings.readableFonts).toBe(true)
    })

    it('should handle simple interface mode', () => {
      const { result } = renderHook(() => useAccessibility())

      act(() => {
        result.current.updateSetting('simpleInterface', true)
      })

      expect(result.current.settings.simpleInterface).toBe(true)
    })
  })

  describe('Accessibility Testing', () => {
    it('should run accessibility audit', () => {
      const { result } = renderHook(() => useAccessibility())

      act(() => {
        const audit = result.current.runAccessibilityAudit()
        expect(audit).toHaveProperty('score')
        expect(audit).toHaveProperty('issues')
        expect(audit).toHaveProperty('recommendations')
      })
    })

    it('should check alt text compliance', () => {
      const { result } = renderHook(() => useAccessibility())

      const mockImages = [
        { alt: 'Descriptive text', src: 'image1.jpg' },
        { alt: '', src: 'image2.jpg' },
        { alt: 'Decorative image', src: 'image3.jpg' },
      ]

      document.querySelectorAll = jest.fn().mockReturnValue(mockImages)

      act(() => {
        const compliance = result.current.checkAltTextCompliance()
        expect(compliance.total).toBe(3)
        expect(compliance.compliant).toBe(2)
        expect(compliance.missing).toBe(1)
      })
    })

    it('should check heading structure', () => {
      const { result } = renderHook(() => useAccessibility())

      const mockHeadings = [
        { tagName: 'H1', textContent: 'Main Title' },
        { tagName: 'H2', textContent: 'Section Title' },
        { tagName: 'H3', textContent: 'Subsection Title' },
        { tagName: 'H4', textContent: 'Sub-subsection Title' },
      ]

      document.querySelectorAll = jest.fn().mockReturnValue(mockHeadings)

      act(() => {
        const structure = result.current.checkHeadingStructure()
        expect(structure.valid).toBe(true)
        expect(structure.levels).toEqual([1, 2, 3, 4])
      })
    })
  })
})
