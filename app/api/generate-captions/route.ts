import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

// Platform-specific configuration
const platformConfig = {
  Instagram: {
    tone: 'casual and trendy',
    length: '1-2 sentences with 8-15 hashtags',
    emojis: 'encouraged',
    sample: 'Amazing sunset! 🌅 #sunset #photography #nature #beautiful'
  },
  Twitter: {
    tone: 'concise and engaging',
    length: 'under 240 characters with 2-3 hashtags',
    emojis: 'minimal',
    sample: 'Beautiful sunset tonight! 🌅 #sunset #nature'
  },
  Facebook: {
    tone: 'conversational and storytelling',
    length: 'longer form, ask questions to engage',
    emojis: 'moderate',
    sample: 'What an incredible sunset! There\'s something magical about...'
  },
  LinkedIn: {
    tone: 'professional and insightful',
    length: 'thought leadership style with 2-3 professional hashtags',
    emojis: 'minimal or none',
    sample: 'Taking time to appreciate nature can enhance creativity and productivity. #leadership #mindfulness'
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API key is not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    const { image, context, platforms } = await request.json()

    // Validate required fields
    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      )
    }

    if (!platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform must be selected' },
        { status: 400 }
      )
    }

    // Validate image format
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      )
    }

    // Extract base64 image data
    const base64Image = image.split(',')[1]
    if (!base64Image) {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      )
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    const contextPrompt = context
      ? `Additional context about the image: ${context}`
      : "No additional context provided."

    // Build platform-specific guidelines
    const platformGuidelines = platforms.map((platform: string) => {
      const config = platformConfig[platform as keyof typeof platformConfig]
      if (!config) return ''

      return `${platform}:
- Tone: ${config.tone}
- Length: ${config.length}
- Emoji usage: ${config.emojis}
- Example: ${config.sample}`
    }).join('\n\n')

    const prompt = `You are a social media content expert. Analyze this image and create engaging captions for the specified platforms.

${contextPrompt}

Generate captions for these platforms: ${platforms.join(', ')}

Platform Guidelines:
${platformGuidelines}

Return ONLY a valid JSON object in this exact format:
{
  "captions": [
    {"platform": "Instagram", "text": "Your complete caption with hashtags"},
    {"platform": "Twitter", "text": "Your tweet with hashtags"}
  ]
}

Important: Return only the JSON object, no markdown or additional text.`

    // Generate content with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 55000)
    })

    const apiCallPromise = model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ])

    const result = await Promise.race([apiCallPromise, timeoutPromise]) as any
    const response = await result.response
    let text = response.text()

    // Clean up response
    text = text.trim()
    if (text.startsWith("```json")) {
      text = text.replace(/```json\n?/, "").replace(/```$/, "")
    } else if (text.startsWith("```")) {
      text = text.replace(/```\n?/, "").replace(/```$/, "")
    }

    // Parse and validate response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(text)
    } catch (error) {
      throw new Error('Invalid JSON response from AI')
    }

    // Validate response structure
    if (!parsedResponse.captions || !Array.isArray(parsedResponse.captions)) {
      throw new Error('Invalid response structure')
    }

    // Filter captions for requested platforms only
    const captions = parsedResponse.captions.filter((caption: any) =>
      platforms.includes(caption.platform) && caption.text
    )

    if (captions.length === 0) {
      throw new Error('No valid captions generated')
    }

    return NextResponse.json({ captions })

  } catch (error) {
    console.error('Error generating captions:', error)

    return NextResponse.json(
      { error: 'Failed to generate captions' },
      { status: 500 }
    )
  }
}

