import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { accessToken, userId, imageUrl, caption } = await request.json()

    if (!accessToken || !userId || !imageUrl || !caption) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Step 1: Create media container
    const containerResponse = await fetch(
      `https://graph.instagram.com/v18.0/${userId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken,
        }),
      }
    )

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json()
      throw new Error(`Failed to create media container: ${errorData.error?.message || 'Unknown error'}`)
    }

    const containerData = await containerResponse.json()

    // Step 2: Publish the media
    const publishResponse = await fetch(
      `https://graph.instagram.com/v18.0/${userId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken,
        }),
      }
    )

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json()
      throw new Error(`Failed to publish media: ${errorData.error?.message || 'Unknown error'}`)
    }

    const publishData = await publishResponse.json()

    return NextResponse.json({
      success: true,
      post_id: publishData.id,
      message: 'Posted to Instagram successfully!'
    })

  } catch (error) {
    console.error('Instagram posting error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to post to Instagram' },
      { status: 500 }
    )
  }
}