import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY!)

// Set a longer timeout for Vercel serverless functions
export const maxDuration = 60 // 60 seconds timeout

// Enable streaming for better performance
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { image, context, platforms = ["Instagram", "Twitter", "Facebook", "LinkedIn"] } = await request.json()

    // Validate input
    if (!image) {
      return Response.json({ error: "Image is required" }, { status: 400 })
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return Response.json({ error: "At least one platform must be selected" }, { status: 400 })
    }

    // Extract base64 image data
    const base64Image = image.split(",")[1]
    if (!base64Image) {
      return Response.json({ error: "Invalid image format" }, { status: 400 })
    }

    // Initialize the model with a more efficient configuration
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: "You are a social media content expert specializing in creating engaging captions.",
    })

    const contextPrompt = context ? `Additional context about the image: ${context}` : "No additional context provided."

    // Create a dynamic prompt based on selected platforms
    const platformsToGenerate = platforms.map((p) => p.toLowerCase()).join(", ")

    const prompt = `Analyze the image and the provided context to create platform-specific captions.

${contextPrompt}

IMPORTANT: Generate captions ONLY for these platforms: ${platformsToGenerate}.
Respond ONLY with a valid JSON object in exactly this format, no other text:

{
${
  platforms.includes("Instagram")
    ? `"instagram": {
  "caption": "Your engaging Instagram caption here",
  "hashtags": ["relevant", "hashtags", "here"]
},`
    : ""
}
${
  platforms.includes("Facebook")
    ? `"facebook": {
  "caption": "Your Facebook caption here"
},`
    : ""
}
${
  platforms.includes("LinkedIn")
    ? `"linkedin": {
  "caption": "Your LinkedIn caption here"
},`
    : ""
}
${
  platforms.includes("Twitter")
    ? `"twitter": {
  "caption": "Your Twitter caption here"
}`
    : ""
}
}

Guidelines for each platform:
${platforms.includes("Instagram") ? "- Instagram: Casual, trendy tone with relevant hashtags" : ""}
${platforms.includes("Facebook") ? "- Facebook: Conversational and engaging, can be longer" : ""}
${platforms.includes("LinkedIn") ? "- LinkedIn: Professional and business-focused" : ""}
${platforms.includes("Twitter") ? "- Twitter: Concise, within 280 characters" : ""}

Do not include any markdown, formatting, or additional text outside the JSON structure.`

    // Set a timeout for the API call
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 55000) // 55 seconds timeout
    })

    // Create the API call promise
    const apiCallPromise = model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ])

    // Race the API call against the timeout
    const result = (await Promise.race([apiCallPromise, timeoutPromise])) as any
    const response = await result.response
    let text = response.text()

    // Clean up the response to ensure valid JSON
    text = text.trim()
    if (text.startsWith("```json")) {
      text = text.replace(/```json\n?/, "").replace(/```$/, "")
    } else if (text.startsWith("```")) {
      text = text.replace(/```\n?/, "").replace(/```$/, "")
    }

    try {
      const parsedResponse = JSON.parse(text)

      // Create captions array only for selected platforms
      const captions = []

      if (platforms.includes("Instagram") && parsedResponse.instagram?.caption) {
        const hashtags = Array.isArray(parsedResponse.instagram.hashtags) ? parsedResponse.instagram.hashtags : []
        captions.push({
          platform: "Instagram",
          text: `${parsedResponse.instagram.caption}

${hashtags.map((tag) => `#${tag}`).join(" ")}`,
        })
      }

      if (platforms.includes("Facebook") && parsedResponse.facebook?.caption) {
        captions.push({
          platform: "Facebook",
          text: parsedResponse.facebook.caption,
        })
      }

      if (platforms.includes("LinkedIn") && parsedResponse.linkedin?.caption) {
        captions.push({
          platform: "LinkedIn",
          text: parsedResponse.linkedin.caption,
        })
      }

      if (platforms.includes("Twitter") && parsedResponse.twitter?.caption) {
        captions.push({
          platform: "Twitter",
          text: parsedResponse.twitter.caption,
        })
      }

      // Return the captions with cache control headers for Vercel
      return new Response(JSON.stringify({ captions }), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      })
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError, "\nResponse text:", text)

      // Fallback response with error message in captions
      const captions = platforms.map((platform) => ({
        platform,
        text: "Unable to generate caption. Please try again.",
      }))

      return Response.json({ captions })
    }
  } catch (error) {
    console.error("Error generating captions:", error)
    return Response.json({ error: "Failed to generate captions" }, { status: 500 })
  }
}

