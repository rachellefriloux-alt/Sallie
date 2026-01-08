import { render, screen } from '@testing-library/react'
import { Avatar } from '../components/Avatar'

describe('Avatar Component', () => {
  it('renders Sallie avatar with correct structure', () => {
    render(<Avatar isConnected={false} />)
    
    // Check main container
    const avatarRegion = screen.getByRole('region', { name: 'Sallie avatar' })
    expect(avatarRegion).toBeInTheDocument()
    
    // Check avatar circle
    const avatarCircle = avatarRegion.querySelector('.w-36.h-36')
    expect(avatarCircle).toBeInTheDocument()
    
    // Check name
    expect(screen.getByText('Sallie')).toBeInTheDocument()
    
    // Check initial status
    expect(screen.getByText('Connecting...')).toBeInTheDocument()
  })

  it('shows online status when connected', () => {
    render(<Avatar isConnected={true} />)
    
    const statusText = screen.getByText('Online')
    expect(statusText).toBeInTheDocument()
    
    const statusIndicator = screen.getByLabelText('Online')
    expect(statusIndicator).toHaveClass('bg-success', 'animate-pulse')
  })

  it('shows connecting status when not connected', () => {
    render(<Avatar isConnected={false} />)
    
    const statusText = screen.getByText('Connecting...')
    expect(statusText).toBeInTheDocument()
    
    const statusIndicator = screen.getByLabelText('Offline')
    expect(statusIndicator).toHaveClass('bg-error')
  })

  it('has correct accessibility attributes', () => {
    render(<Avatar isConnected={true} />)
    
    // Check ARIA labels
    expect(screen.getByRole('region', { name: 'Sallie avatar' })).toBeInTheDocument()
    expect(screen.getByLabelText('Online')).toBeInTheDocument()
  })

  it('applies correct CSS classes and styling', () => {
    render(<Avatar isConnected={true} />)
    
    const avatarContainer = screen.getByRole('region', { name: 'Sallie avatar' })
    expect(avatarContainer).toHaveClass('text-center', 'py-5')
    
    // Check gradient text for name
    const nameElement = screen.getByText('Sallie')
    expect(nameElement).toHaveClass(
      'text-2xl',
      'font-semibold',
      'mb-2',
      'bg-gradient-to-r',
      'from-primary',
      'to-secondary',
      'bg-clip-text',
      'text-transparent'
    )
  })
})
