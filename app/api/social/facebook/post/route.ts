import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { accessToken, pageId, imageUrl, caption, postToPage } = await request.json()

    if (!accessToken || !caption) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Determine the endpoint based on whether posting to a page or personal profile
    const endpoint = postToPage && pageId
      ? `https://graph.facebook.com/v18.0/${pageId}/photos`
      : `https://graph.facebook.com/v18.0/me/photos`

    const postData: any = {
      access_token: accessToken,
      caption: caption,
    }

    // Add image URL if provided
    if (imageUrl) {
      postData.url = imageUrl
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Failed to post to Facebook: ${errorData.error?.message || 'Unknown error'}`)
    }

    const responseData = await response.json()

    return NextResponse.json({
      success: true,
      post_id: responseData.id,
      message: 'Posted to Facebook successfully!'
    })

  } catch (error) {
    console.error('Facebook posting error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to post to Facebook' },
      { status: 500 }
    )
  }
}