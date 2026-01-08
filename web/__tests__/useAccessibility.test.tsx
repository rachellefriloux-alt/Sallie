import { renderHook, act } from '@testing-library/react'
import { useAccessibility } from '../hooks/useAccessibility'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

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

// Mock speech synthesis
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    getVoices: jest.fn(() => []),
  },
})

describe('useAccessibility Hook', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('should initialize with default settings', () => {
    const { result } = renderHook(() => useAccessibility())

    expect(result.current.settings.fontSize).toBe('medium')
    expect(result.current.settings.highContrast).toBe(false)
    expect(result.current.settings.reducedMotion).toBe(false)
    expect(result.current.settings.screenReader).toBe(false)
    expect(result.current.settings.keyboardNavigation).toBe(true)
  })

  it('should update settings correctly', () => {
    const { result } = renderHook(() => useAccessibility())

    act(() => {
      result.current.updateSettings({
        fontSize: 'large',
        highContrast: true,
      })
    })

    expect(result.current.settings.fontSize).toBe('large')
    expect(result.current.settings.highContrast).toBe(true)
    expect(result.current.settings.keyboardNavigation).toBe(true) // Other settings unchanged
  })

  it('should save settings to localStorage', () => {
    const { result } = renderHook(() => useAccessibility())

    act(() => {
      result.current.updateSettings({
        fontSize: 'extra-large',
        reducedMotion: true,
      })
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'accessibility-settings',
      expect.stringContaining('"fontSize":"extra-large"')
    )
  })

  it('should load settings from localStorage', () => {
    const mockSettings = {
      fontSize: 'large',
      highContrast: true,
      reducedMotion: true,
    }

    localStorageMock.getItem = jest.fn(() => JSON.stringify(mockSettings))

    const { result } = renderHook(() => useAccessibility())

    expect(result.current.settings.fontSize).toBe('large')
    expect(result.current.settings.highContrast).toBe(true)
    expect(result.current.settings.reducedMotion).toBe(true)
  })

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem = jest.fn(() => {
      throw new Error('Storage error')
    })

    const { result } = renderHook(() => useAccessibility())

    // Should still initialize with defaults
    expect(result.current.settings.fontSize).toBe('medium')
  })

  it('should calculate contrast ratio correctly', () => {
    const { result } = renderHook(() => useAccessibility())

    // Black on white - should be high contrast
    const ratio = result.current.getContrastRatio('#000000', '#ffffff')
    expect(ratio).toBeCloseTo(21, 0) // Maximum contrast ratio

    // White on black - should be the same
    const ratio2 = result.current.getContrastRatio('#ffffff', '#000000')
    expect(ratio2).toBeCloseTo(21, 0)
  })

  it('should determine color accessibility correctly', () => {
    const { result } = renderHook(() => useAccessibility())

    // Black on white should be accessible
    expect(result.current.isColorAccessible('#000000', '#ffffff')).toBe(true)

    // Light gray on white should not be accessible
    expect(result.current.isColorAccessible('#cccccc', '#ffffff')).toBe(false)
  })

  it('should return accessible color (high contrast)', () => {
    const { result } = renderHook(() => useAccessibility())

    // Light color should return black
    expect(result.current.getAccessibleColor('#ffffff')).toBe('#000000')

    // Dark color should return white
    expect(result.current.getAccessibleColor('#000000')).toBe('#ffffff')
  })

  it('should handle announcements correctly', () => {
    const { result } = renderHook(() => useAccessibility())

    act(() => {
      result.current.announce('Test announcement')
    })

    expect(result.current.announcements).toHaveLength(1)
    expect(result.current.announcements[0].message).toBe('Test announcement')
    expect(result.current.announcements[0].priority).toBe('polite')
  })

  it('should handle assertive announcements', () => {
    const { result } = renderHook(() => useAccessibility())

    act(() => {
      result.current.announce('Urgent announcement', 'assertive')
    })

    expect(result.current.announcements[0].priority).toBe('assertive')
  })

  it('should clean up old announcements', () => {
    const { result } = renderHook(() => useAccessibility())
    jest.useFakeTimers()

    act(() => {
      result.current.announce('Test announcement')
    })

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(6000) // 6 seconds
    })

    expect(result.current.announcements).toHaveLength(0)

    jest.useRealTimers()
  })

  it('should detect system preferences for reduced motion', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    const { result } = renderHook(() => useAccessibility())

    expect(result.current.settings.reducedMotion).toBe(true)
    expect(result.current.settings.reducedAnimations).toBe(true)
  })

  it('should detect screen reader', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        getVoices: jest.fn(() => [
          { name: 'Voice 1' },
          { name: 'Voice 2' },
        ]),
      },
    })

    const { result } = renderHook(() => useAccessibility())

    expect(result.current.settings.screenReader).toBe(true)
  })

  it('should handle focus trapping correctly', () => {
    const { result } = renderHook(() => useAccessibility())

    // Create mock container with focusable elements
    const container = document.createElement('div')
    const button1 = document.createElement('button')
    const button2 = document.createElement('button')
    
    container.appendChild(button1)
    container.appendChild(button2)
    document.body.appendChild(container)

    const cleanup = act(() => {
      return result.current.trapFocus(container)
    })

    expect(document.activeElement).toBe(button1)

    // Cleanup
    cleanup()
  })
})
