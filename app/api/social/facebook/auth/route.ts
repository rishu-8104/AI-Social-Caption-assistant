import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      // Redirect to Facebook OAuth
      const facebookAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
      facebookAuthUrl.searchParams.set('client_id', process.env.FACEBOOK_APP_ID || '')
      facebookAuthUrl.searchParams.set('redirect_uri', process.env.FACEBOOK_REDIRECT_URI || '')
      facebookAuthUrl.searchParams.set('scope', 'pages_manage_posts,pages_read_engagement,publish_to_groups')
      facebookAuthUrl.searchParams.set('response_type', 'code')

      return NextResponse.redirect(facebookAuthUrl.toString())
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`
    )

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()

    // Get user pages (for posting to pages)
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.access_token}`
    )

    const pagesData = await pagesResponse.json()

    return NextResponse.json({
      success: true,
      access_token: tokenData.access_token,
      pages: pagesData.data || [],
    })

  } catch (error) {
    console.error('Facebook auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}