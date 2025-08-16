import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      // Redirect to Instagram OAuth
      const instagramAuthUrl = new URL('https://api.instagram.com/oauth/authorize')
      instagramAuthUrl.searchParams.set('client_id', process.env.INSTAGRAM_CLIENT_ID || '')
      instagramAuthUrl.searchParams.set('redirect_uri', process.env.INSTAGRAM_REDIRECT_URI || '')
      instagramAuthUrl.searchParams.set('scope', 'user_profile,user_media')
      instagramAuthUrl.searchParams.set('response_type', 'code')

      return NextResponse.redirect(instagramAuthUrl.toString())
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID || '',
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET || '',
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || '',
        code,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()

    // Get long-lived access token
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${tokenData.access_token}`
    )

    const longLivedTokenData = await longLivedTokenResponse.json()

    // Store token in session/database (for now, we'll return it)
    return NextResponse.json({
      success: true,
      access_token: longLivedTokenData.access_token,
      user_id: tokenData.user_id,
    })

  } catch (error) {
    console.error('Instagram auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}