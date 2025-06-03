import { render, screen } from '@testing-library/react'
import { 
  MobileCard, 
  MobileCardHeader, 
  MobileCardTitle, 
  MobileCardDescription, 
  MobileCardContent, 
  MobileCardFooter 
} from '@/components/ui/mobile-card'

describe('MobileCard Components', () => {
  describe('MobileCard', () => {
    it('renders with default variant', () => {
      render(
        <MobileCard data-testid="mobile-card">
          <div>Card content</div>
        </MobileCard>
      )
      
      const card = screen.getByTestId('mobile-card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('p-4', 'sm:p-6')
    })

    it('renders with compact variant', () => {
      render(
        <MobileCard variant="compact" data-testid="mobile-card">
          <div>Card content</div>
        </MobileCard>
      )
      
      const card = screen.getByTestId('mobile-card')
      expect(card).toHaveClass('p-3', 'sm:p-4')
    })

    it('renders with full-width variant', () => {
      render(
        <MobileCard variant="full-width" data-testid="mobile-card">
          <div>Card content</div>
        </MobileCard>
      )
      
      const card = screen.getByTestId('mobile-card')
      expect(card).toHaveClass('w-full')
    })

    it('applies custom className', () => {
      render(
        <MobileCard className="custom-class" data-testid="mobile-card">
          <div>Card content</div>
        </MobileCard>
      )
      
      const card = screen.getByTestId('mobile-card')
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('MobileCardHeader', () => {
    it('renders with default spacing', () => {
      render(
        <MobileCardHeader data-testid="card-header">
          <div>Header content</div>
        </MobileCardHeader>
      )
      
      const header = screen.getByTestId('card-header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('pb-3')
    })

    it('renders with compact spacing', () => {
      render(
        <MobileCardHeader compact data-testid="card-header">
          <div>Header content</div>
        </MobileCardHeader>
      )
      
      const header = screen.getByTestId('card-header')
      expect(header).toHaveClass('pb-2')
    })
  })

  describe('MobileCardTitle', () => {
    it('renders with default size', () => {
      render(<MobileCardTitle>Test Title</MobileCardTitle>)
      
      const title = screen.getByRole('heading', { name: 'Test Title' })
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-lg', 'sm:text-xl')
    })

    it('renders with small size', () => {
      render(<MobileCardTitle size="sm">Test Title</MobileCardTitle>)
      
      const title = screen.getByRole('heading', { name: 'Test Title' })
      expect(title).toHaveClass('text-base', 'sm:text-lg')
    })

    it('renders with large size', () => {
      render(<MobileCardTitle size="lg">Test Title</MobileCardTitle>)
      
      const title = screen.getByRole('heading', { name: 'Test Title' })
      expect(title).toHaveClass('text-xl', 'sm:text-2xl')
    })
  })

  describe('MobileCardDescription', () => {
    it('renders description text', () => {
      render(<MobileCardDescription>Test description</MobileCardDescription>)
      
      const description = screen.getByText('Test description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-sm', 'sm:text-base')
    })
  })

  describe('MobileCardContent', () => {
    it('renders with normal spacing', () => {
      render(
        <MobileCardContent data-testid="card-content">
          <div>Content</div>
        </MobileCardContent>
      )
      
      const content = screen.getByTestId('card-content')
      expect(content).toHaveClass('space-y-3', 'sm:space-y-4')
    })

    it('renders with tight spacing', () => {
      render(
        <MobileCardContent spacing="tight" data-testid="card-content">
          <div>Content</div>
        </MobileCardContent>
      )
      
      const content = screen.getByTestId('card-content')
      expect(content).toHaveClass('space-y-2')
    })

    it('renders with loose spacing', () => {
      render(
        <MobileCardContent spacing="loose" data-testid="card-content">
          <div>Content</div>
        </MobileCardContent>
      )
      
      const content = screen.getByTestId('card-content')
      expect(content).toHaveClass('space-y-4', 'sm:space-y-6')
    })
  })

  describe('MobileCardFooter', () => {
    it('renders with row direction by default', () => {
      render(
        <MobileCardFooter data-testid="card-footer">
          <div>Footer content</div>
        </MobileCardFooter>
      )
      
      const footer = screen.getByTestId('card-footer')
      expect(footer).toHaveClass('flex', 'flex-col', 'sm:flex-row')
    })

    it('renders with column direction', () => {
      render(
        <MobileCardFooter direction="column" data-testid="card-footer">
          <div>Footer content</div>
        </MobileCardFooter>
      )
      
      const footer = screen.getByTestId('card-footer')
      expect(footer).toHaveClass('flex', 'flex-col')
    })
  })

  describe('Complete MobileCard', () => {
    it('renders a complete card structure', () => {
      render(
        <MobileCard data-testid="complete-card">
          <MobileCardHeader>
            <MobileCardTitle>Card Title</MobileCardTitle>
            <MobileCardDescription>Card description</MobileCardDescription>
          </MobileCardHeader>
          <MobileCardContent>
            <p>Card content goes here</p>
          </MobileCardContent>
          <MobileCardFooter>
            <button>Action</button>
          </MobileCardFooter>
        </MobileCard>
      )
      
      expect(screen.getByTestId('complete-card')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument()
      expect(screen.getByText('Card description')).toBeInTheDocument()
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })
  })
}) 