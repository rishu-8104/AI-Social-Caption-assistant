/**
 * @jest-environment node
 */

import { POST } from '@/app/api/generate-captions/route'

// Mock the Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
}))

// Mock NextRequest and NextResponse
const mockNextRequest = (body: any) => {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any
}

const mockNextResponse = {
  json: jest.fn().mockImplementation((data, init) => ({
    status: init?.status || 200,
    json: () => Promise.resolve(data),
  })),
}

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => ({
      status: init?.status || 200,
      json: () => Promise.resolve(data),
    })),
  },
}))

describe('/api/generate-captions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variables
    process.env.GOOGLE_AI_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns error when API key is missing', async () => {
    delete process.env.GOOGLE_AI_API_KEY

    const request = mockNextRequest({
      image: 'data:image/jpeg;base64,validimagedata',
      context: 'A beautiful sunset photo',
      platforms: ['Instagram'],
    })

    const result = await POST(request)
    expect(result.status).toBe(500)
  })

  it('returns error for missing image', async () => {
    const request = mockNextRequest({
      context: 'A beautiful sunset photo',
      platforms: ['Instagram'],
    })

    const result = await POST(request)
    expect(result.status).toBe(400)
  })

  it('returns error for missing platforms', async () => {
    const request = mockNextRequest({
      image: 'data:image/jpeg;base64,validimagedata',
      context: 'A beautiful sunset photo',
    })

    const result = await POST(request)
    expect(result.status).toBe(400)
  })

  it('returns error for empty platforms array', async () => {
    const request = mockNextRequest({
      image: 'data:image/jpeg;base64,validimagedata',
      context: 'A beautiful sunset photo',
      platforms: [],
    })

    const result = await POST(request)
    expect(result.status).toBe(400)
  })

  it('returns error for invalid image format', async () => {
    const request = mockNextRequest({
      image: 'invalid-image-data',
      context: 'A beautiful sunset photo',
      platforms: ['Instagram'],
    })

    const result = await POST(request)
    expect(result.status).toBe(400)
  })

  it('successfully generates captions for valid request', async () => {
    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          captions: [
            { platform: 'Instagram', text: 'Beautiful sunset! #photography #nature' },
            { platform: 'Twitter', text: 'Amazing sunset today! 🌅' },
          ]
        }),
      },
    })

    const { GoogleGenerativeAI } = require('@google/generative-ai')
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }))

    const request = mockNextRequest({
      image: 'data:image/jpeg;base64,validimagedata',
      context: 'A beautiful sunset photo',
      platforms: ['Instagram', 'Twitter'],
    })

    const result = await POST(request)
    expect(result.status).toBe(200)
    expect(mockGenerateContent).toHaveBeenCalled()
  })

  it('handles AI API errors gracefully', async () => {
    const mockGenerateContent = jest.fn().mockRejectedValue(new Error('AI API Error'))

    const { GoogleGenerativeAI } = require('@google/generative-ai')
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }))

    const request = mockNextRequest({
      image: 'data:image/jpeg;base64,validimagedata',
      context: 'A beautiful sunset photo',
      platforms: ['Instagram'],
    })

    const result = await POST(request)
    expect(result.status).toBe(500)
  })

  it('handles invalid JSON response from AI', async () => {
    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () => 'invalid json response',
      },
    })

    const { GoogleGenerativeAI } = require('@google/generative-ai')
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }))

    const request = mockNextRequest({
      image: 'data:image/jpeg;base64,validimagedata',
      context: 'A beautiful sunset photo',
      platforms: ['Instagram'],
    })

    const result = await POST(request)
    expect(result.status).toBe(500)
  })
})