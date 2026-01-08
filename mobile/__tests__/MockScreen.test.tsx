import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { View, Text, Button } from 'react-native'

// Mock component for testing
const MockScreen = ({ navigation }: any) => {
  const [count, setCount] = React.useState(0)
  
  return (
    <View testID="mock-screen">
      <Text testID="counter-text">Count: {count}</Text>
      <Button
        testID="increment-button"
        title="Increment"
        onPress={() => setCount(count + 1)}
      />
      <Button
        testID="navigate-button"
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  )
}

describe('MockScreen Component', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    isFocused: jest.fn(() => true),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }

  it('renders correctly', () => {
    const { getByTestId } = render(<MockScreen navigation={mockNavigation} />)
    
    expect(getByTestId('mock-screen')).toBeTruthy()
    expect(getByTestId('counter-text')).toBeTruthy()
    expect(getByTestId('increment-button')).toBeTruthy()
    expect(getByTestId('navigate-button')).toBeTruthy()
  })

  it('displays initial count as 0', () => {
    const { getByTestId } = render(<MockScreen navigation={mockNavigation} />)
    
    const counterText = getByTestId('counter-text')
    expect(counterText.props.children).toBe('Count: 0')
  })

  it('increments count when button is pressed', async () => {
    const { getByTestId } = render(<MockScreen navigation={mockNavigation} />)
    
    const incrementButton = getByTestId('increment-button')
    const counterText = getByTestId('counter-text')
    
    // Initial state
    expect(counterText.props.children).toBe('Count: 0')
    
    // Press button
    fireEvent.press(incrementButton)
    
    // Check updated state
    await waitFor(() => {
      expect(counterText.props.children).toBe('Count: 1')
    })
  })

  it('navigates to details when navigate button is pressed', () => {
    const { getByTestId } = render(<MockScreen navigation={mockNavigation} />)
    
    const navigateButton = getByTestId('navigate-button')
    fireEvent.press(navigateButton)
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Details')
  })

  it('handles multiple button presses correctly', async () => {
    const { getByTestId } = render(<MockScreen navigation={mockNavigation} />)
    
    const incrementButton = getByTestId('increment-button')
    const counterText = getByTestId('counter-text')
    
    // Press button multiple times
    fireEvent.press(incrementButton)
    fireEvent.press(incrementButton)
    fireEvent.press(incrementButton)
    
    await waitFor(() => {
      expect(counterText.props.children).toBe('Count: 3')
    })
  })

  it('maintains correct state after navigation', async () => {
    const { getByTestId, rerender } = render(<MockScreen navigation={mockNavigation} />)
    
    const incrementButton = getByTestId('increment-button')
    const counterText = getByTestId('counter-text')
    
    // Increment count
    fireEvent.press(incrementButton)
    
    await waitFor(() => {
      expect(counterText.props.children).toBe('Count: 1')
    })
    
    // Simulate component re-render (e.g., after navigation back)
    rerender(<MockScreen navigation={mockNavigation} />)
    
    // State should be maintained
    expect(counterText.props.children).toBe('Count: 1')
  })
})
