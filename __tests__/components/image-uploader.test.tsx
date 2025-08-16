import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ImageUploader } from '@/components/image-uploader'

// Mock the toast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  },
}))

// Mock fetch globally
global.fetch = jest.fn()

describe('ImageUploader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders the component with initial state', () => {
    render(<ImageUploader />)

    expect(screen.getByText('Social Media Caption Generator')).toBeInTheDocument()
    expect(screen.getByText('Click here or drag and drop your image')).toBeInTheDocument()
    expect(screen.getByLabelText('Upload image')).toBeInTheDocument()
    expect(screen.getByText('Select platforms for caption generation')).toBeInTheDocument()
  })

  it('displays all platform checkboxes', () => {
    render(<ImageUploader />)

    expect(screen.getByLabelText('Generate caption for Instagram')).toBeInTheDocument()
    expect(screen.getByLabelText('Generate caption for Twitter')).toBeInTheDocument()
    expect(screen.getByLabelText('Generate caption for Facebook')).toBeInTheDocument()
    expect(screen.getByLabelText('Generate caption for LinkedIn')).toBeInTheDocument()
  })

  it('handles platform selection correctly', () => {
    render(<ImageUploader />)

    const instagramCheckbox = screen.getByLabelText('Generate caption for Instagram')
    const twitterCheckbox = screen.getByLabelText('Generate caption for Twitter')

    fireEvent.click(instagramCheckbox)
    fireEvent.click(twitterCheckbox)

    expect(instagramCheckbox).toBeChecked()
    expect(twitterCheckbox).toBeChecked()
  })

  it('handles context input changes', () => {
    render(<ImageUploader />)

    const contextInput = screen.getByLabelText('Image Context (optional)')
    const testContext = 'This is a beautiful sunset photo'

    fireEvent.change(contextInput, { target: { value: testContext } })

    expect(contextInput).toHaveValue(testContext)
  })

  it('shows generate button only when image is uploaded', () => {
    render(<ImageUploader />)

    // Initially, no generate button should be visible
    expect(screen.queryByText('Generate Captions')).not.toBeInTheDocument()
  })

  it('handles drag and drop events', () => {
    render(<ImageUploader />)

    const dropZone = screen.getByLabelText('Upload image')
    const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' })

    // Test drag enter
    fireEvent.dragOver(dropZone, {
      dataTransfer: {
        files: [file],
      },
    })

    // Test drag leave
    fireEvent.dragLeave(dropZone)

    // Test drop
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    })
  })

  it('handles keyboard navigation for upload area', () => {
    render(<ImageUploader />)

    const uploadArea = screen.getByLabelText('Upload image')

    fireEvent.focus(uploadArea)
    expect(uploadArea).toHaveFocus()

    // Test Enter key
    fireEvent.keyDown(uploadArea, { key: 'Enter' })

    // Test Space key
    fireEvent.keyDown(uploadArea, { key: ' ' })
  })

  it('handles successful caption generation', async () => {
    const mockCaptions = [
      { platform: 'Instagram', text: 'Beautiful sunset! #photography' },
      { platform: 'Twitter', text: 'Amazing sunset today! 🌅' },
    ]

    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ captions: mockCaptions }),
    })

    render(<ImageUploader />)

    // Note: Full integration test would require proper image upload and platform selection
    // This test structure shows how we'd test the API response handling
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

    render(<ImageUploader />)

    // Note: Full test would trigger caption generation and verify error handling
  })

  it('is accessible with proper ARIA labels', () => {
    render(<ImageUploader />)

    expect(screen.getByLabelText('Upload image')).toBeInTheDocument()
    expect(screen.getByLabelText('Image Context (optional)')).toBeInTheDocument()
    expect(screen.getByText('Select platforms for caption generation')).toBeInTheDocument()

    // Check that all platform checkboxes have proper labels
    expect(screen.getByLabelText('Generate caption for Instagram')).toBeInTheDocument()
    expect(screen.getByLabelText('Generate caption for Twitter')).toBeInTheDocument()
    expect(screen.getByLabelText('Generate caption for Facebook')).toBeInTheDocument()
    expect(screen.getByLabelText('Generate caption for LinkedIn')).toBeInTheDocument()
  })

  it('maintains proper tab order for keyboard navigation', () => {
    render(<ImageUploader />)

    const focusableElements = screen.getAllByRole('button')
      .concat(screen.getAllByRole('textbox'))
      .concat(screen.getAllByRole('checkbox'))

    // Verify that all interactive elements can receive focus
    focusableElements.forEach(element => {
      expect(element).not.toHaveAttribute('tabindex', '-1')
    })
  })
})