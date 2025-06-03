import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { 
  MobileForm, 
  MobileFormField, 
  MobileFormLabel, 
  MobileFormInput, 
  MobileFormTextarea, 
  MobileFormSelect, 
  MobileFormButton, 
  MobileFormError, 
  MobileFormDescription 
} from '@/components/ui/mobile-form'

describe('MobileForm Components', () => {
  describe('MobileForm', () => {
    it('renders form with proper spacing', () => {
      render(
        <MobileForm data-testid="mobile-form">
          <div>Form content</div>
        </MobileForm>
      )
      
      const form = screen.getByTestId('mobile-form')
      expect(form).toBeInTheDocument()
      expect(form).toHaveClass('space-y-4', 'sm:space-y-6')
    })

    it('handles form submission', async () => {
      const handleSubmit = jest.fn((e) => e.preventDefault())
      
      render(
        <MobileForm onSubmit={handleSubmit} data-testid="mobile-form">
          <MobileFormButton type="submit">Submit</MobileFormButton>
        </MobileForm>
      )
      
      const form = screen.getByTestId('mobile-form')
      const submitButton = screen.getByRole('button', { name: 'Submit' })
      
      fireEvent.click(submitButton)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  describe('MobileFormField', () => {
    it('renders field container', () => {
      render(
        <MobileFormField data-testid="form-field">
          <div>Field content</div>
        </MobileFormField>
      )
      
      const field = screen.getByTestId('form-field')
      expect(field).toBeInTheDocument()
      expect(field).toHaveClass('space-y-2')
    })
  })

  describe('MobileFormLabel', () => {
    it('renders label text', () => {
      render(<MobileFormLabel>Email Address</MobileFormLabel>)
      
      const label = screen.getByText('Email Address')
      expect(label).toBeInTheDocument()
      expect(label).toHaveClass('text-sm', 'sm:text-base')
    })

    it('shows required indicator', () => {
      render(<MobileFormLabel required>Email Address</MobileFormLabel>)
      
      expect(screen.getByText('Email Address')).toBeInTheDocument()
      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('associates with form control', () => {
      render(
        <div>
          <MobileFormLabel htmlFor="email">Email Address</MobileFormLabel>
          <MobileFormInput id="email" type="email" />
        </div>
      )
      
      const label = screen.getByText('Email Address')
      const input = screen.getByRole('textbox')
      
      expect(label).toHaveAttribute('for', 'email')
      expect(input).toHaveAttribute('id', 'email')
    })
  })

  describe('MobileFormInput', () => {
    it('renders input with mobile-friendly sizing', () => {
      render(<MobileFormInput placeholder="Enter text" />)
      
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('h-12', 'sm:h-10', 'text-base', 'sm:text-sm')
    })

    it('handles different input types', () => {
      render(<MobileFormInput type="email" placeholder="Enter email" />)
      
      const input = screen.getByPlaceholderText('Enter email')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('handles user input', async () => {
      const user = userEvent.setup()
      render(<MobileFormInput placeholder="Enter text" />)
      
      const input = screen.getByPlaceholderText('Enter text')
      await user.type(input, 'Hello World')
      
      expect(input).toHaveValue('Hello World')
    })

    it('applies disabled state', () => {
      render(<MobileFormInput disabled placeholder="Disabled input" />)
      
      const input = screen.getByPlaceholderText('Disabled input')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })
  })

  describe('MobileFormTextarea', () => {
    it('renders textarea with mobile-friendly sizing', () => {
      render(<MobileFormTextarea placeholder="Enter message" />)
      
      const textarea = screen.getByPlaceholderText('Enter message')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveClass('min-h-[80px]', 'sm:min-h-[60px]', 'text-base', 'sm:text-sm')
    })

    it('handles user input', async () => {
      const user = userEvent.setup()
      render(<MobileFormTextarea placeholder="Enter message" />)
      
      const textarea = screen.getByPlaceholderText('Enter message')
      await user.type(textarea, 'This is a test message')
      
      expect(textarea).toHaveValue('This is a test message')
    })
  })

  describe('MobileFormSelect', () => {
    it('renders select with options', () => {
      render(
        <MobileFormSelect>
          <option value="">Select option</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </MobileFormSelect>
      )
      
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
      expect(select).toHaveClass('h-12', 'sm:h-10', 'text-base', 'sm:text-sm')
      
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(3)
    })

    it('handles selection change', async () => {
      const user = userEvent.setup()
      render(
        <MobileFormSelect>
          <option value="">Select option</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </MobileFormSelect>
      )
      
      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'option1')
      
      expect(select).toHaveValue('option1')
    })
  })

  describe('MobileFormButton', () => {
    it('renders with default variant and size', () => {
      render(<MobileFormButton>Click me</MobileFormButton>)
      
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('h-12', 'sm:h-10', 'text-base', 'sm:text-sm')
    })

    it('renders with different variants', () => {
      render(<MobileFormButton variant="destructive">Delete</MobileFormButton>)
      
      const button = screen.getByRole('button', { name: 'Delete' })
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
    })

    it('renders with different sizes', () => {
      render(<MobileFormButton size="lg">Large Button</MobileFormButton>)
      
      const button = screen.getByRole('button', { name: 'Large Button' })
      expect(button).toHaveClass('h-14', 'sm:h-11')
    })

    it('renders full width', () => {
      render(<MobileFormButton fullWidth>Full Width</MobileFormButton>)
      
      const button = screen.getByRole('button', { name: 'Full Width' })
      expect(button).toHaveClass('w-full')
    })

    it('handles click events', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      
      render(<MobileFormButton onClick={handleClick}>Click me</MobileFormButton>)
      
      const button = screen.getByRole('button', { name: 'Click me' })
      await user.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('applies disabled state', () => {
      render(<MobileFormButton disabled>Disabled</MobileFormButton>)
      
      const button = screen.getByRole('button', { name: 'Disabled' })
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })
  })

  describe('MobileFormError', () => {
    it('renders error message', () => {
      render(<MobileFormError>This field is required</MobileFormError>)
      
      const error = screen.getByText('This field is required')
      expect(error).toBeInTheDocument()
      expect(error).toHaveClass('text-sm', 'text-destructive')
    })
  })

  describe('MobileFormDescription', () => {
    it('renders description text', () => {
      render(<MobileFormDescription>Enter your email address</MobileFormDescription>)
      
      const description = screen.getByText('Enter your email address')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-xs', 'sm:text-sm', 'text-muted-foreground')
    })
  })

  describe('Complete Form', () => {
    it('renders a complete form with all components', async () => {
      const user = userEvent.setup()
      const handleSubmit = jest.fn((e) => e.preventDefault())
      
      render(
        <MobileForm onSubmit={handleSubmit}>
          <MobileFormField>
            <MobileFormLabel htmlFor="email" required>Email</MobileFormLabel>
            <MobileFormInput id="email" type="email" placeholder="Enter email" />
            <MobileFormDescription>We'll never share your email</MobileFormDescription>
          </MobileFormField>
          
          <MobileFormField>
            <MobileFormLabel htmlFor="message">Message</MobileFormLabel>
            <MobileFormTextarea id="message" placeholder="Enter message" />
          </MobileFormField>
          
          <MobileFormField>
            <MobileFormLabel htmlFor="category">Category</MobileFormLabel>
            <MobileFormSelect id="category">
              <option value="">Select category</option>
              <option value="support">Support</option>
              <option value="sales">Sales</option>
            </MobileFormSelect>
          </MobileFormField>
          
          <MobileFormButton type="submit" fullWidth>Submit Form</MobileFormButton>
        </MobileForm>
      )
      
      // Check all form elements are present
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter message')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('We\'ll never share your email')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit Form' })).toBeInTheDocument()
      
      // Test form interaction
      const emailInput = screen.getByPlaceholderText('Enter email')
      const submitButton = screen.getByRole('button', { name: 'Submit Form' })
      
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)
      
      expect(emailInput).toHaveValue('test@example.com')
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
}) 