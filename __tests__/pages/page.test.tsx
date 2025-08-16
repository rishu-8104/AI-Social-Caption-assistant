import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock the ImageUploader component
jest.mock('@/components/image-uploader', () => ({
  ImageUploader: () => <div data-testid="image-uploader">Image Uploader Component</div>,
}))

// Mock dynamic imports for icons
jest.mock('next/dynamic', () => {
  return (importFn: any) => {
    const ComponentMock = () => <div data-testid="dynamic-icon">Icon</div>
    ComponentMock.displayName = 'DynamicIconMock'
    return ComponentMock
  }
})

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the main heading', () => {
    render(<Home />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Social Media Caption Generator')
  })

  it('renders the description text', () => {
    render(<Home />)

    const description = screen.getByText(/Upload an image and get AI-generated captions/i)
    expect(description).toBeInTheDocument()
  })

  it('renders the ImageUploader component', () => {
    render(<Home />)

    const imageUploader = screen.getByTestId('image-uploader')
    expect(imageUploader).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<Home />)

    // Check for main element
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()

    // Check for proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveAttribute('id', 'main-heading')
  })

  it('has proper accessibility attributes', () => {
    render(<Home />)

    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('aria-labelledby', 'main-heading')

    // Check for skip link
    const skipLink = screen.getByText('Skip to main content')
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-heading')
  })

  it('applies responsive classes correctly', () => {
    render(<Home />)

    const main = screen.getByRole('main')
    expect(main).toHaveClass('min-h-screen')
    expect(main).toHaveClass('px-4')
    expect(main).toHaveClass('py-6')
    expect(main).toHaveClass('sm:px-6')
    expect(main).toHaveClass('sm:py-8')
    expect(main).toHaveClass('md:px-8')
    expect(main).toHaveClass('lg:px-12')
  })

  it('renders background floating icons container', () => {
    render(<Home />)

    // Look for the floating icons container
    const floatingIconsContainer = screen.getByLabelText(/Social Media Caption Generator/i)
      .closest('main')
      ?.querySelector('[aria-hidden="true"]')

    expect(floatingIconsContainer).toBeInTheDocument()
  })

  it('has proper contrast and color scheme classes', () => {
    render(<Home />)

    const main = screen.getByRole('main')
    expect(main).toHaveClass('bg-slate-900')

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('bg-gradient-to-r')
    expect(heading).toHaveClass('from-purple-400')
    expect(heading).toHaveClass('via-pink-300')
    expect(heading).toHaveClass('to-blue-400')
    expect(heading).toHaveClass('bg-clip-text')
    expect(heading).toHaveClass('text-transparent')
  })

  it('renders with proper container structure', () => {
    render(<Home />)

    // Check for main container structure
    const container = screen.getByRole('main').querySelector('.max-w-7xl')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('mx-auto')
    expect(container).toHaveClass('relative')
    expect(container).toHaveClass('z-10')
  })

  it('has proper text sizing across breakpoints', () => {
    render(<Home />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveClass('text-2xl')
    expect(heading).toHaveClass('sm:text-3xl')
    expect(heading).toHaveClass('md:text-4xl')
    expect(heading).toHaveClass('lg:text-5xl')
    expect(heading).toHaveClass('xl:text-6xl')
  })

  it('maintains focus management for accessibility', () => {
    render(<Home />)

    const skipLink = screen.getByText('Skip to main content')
    expect(skipLink).toHaveClass('sr-only')
    expect(skipLink).toHaveClass('focus:not-sr-only')
    expect(skipLink).toHaveClass('focus:absolute')
  })

  it('renders without crashing', () => {
    expect(() => render(<Home />)).not.toThrow()
  })

  it('has proper meta structure for SEO', () => {
    render(<Home />)

    // Verify main content is structured for SEO
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()

    const description = screen.getByText(/Upload an image and get AI-generated captions/i)
    expect(description).toBeInTheDocument()
  })
})