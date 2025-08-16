// Social media authentication and posting utilities

export interface SocialAuthData {
  platform: 'instagram' | 'facebook'
  accessToken: string
  userId?: string
  pages?: Array<{ id: string; name: string; access_token: string }>
  isAuthenticated: boolean
}

export interface PostingParams {
  platform: 'instagram' | 'facebook'
  caption: string
  imageUrl?: string
  accessToken: string
  userId?: string
  pageId?: string
  postToPage?: boolean
}

// Store auth data in localStorage (in production, you'd want to use a more secure method)
export const socialAuthStorage = {
  set: (platform: string, data: SocialAuthData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`social_auth_${platform}`, JSON.stringify(data))
    }
  },

  get: (platform: string): SocialAuthData | null => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(`social_auth_${platform}`)
      return data ? JSON.parse(data) : null
    }
    return null
  },

  remove: (platform: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`social_auth_${platform}`)
    }
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('social_auth_instagram')
      localStorage.removeItem('social_auth_facebook')
    }
  }
}

// Initiate OAuth flow
export const initiateOAuth = (platform: 'instagram' | 'facebook') => {
  if (typeof window !== 'undefined') {
    window.location.href = `/api/social/${platform}/auth`
  }
}

// Post to social media platform
export const postToSocialMedia = async (params: PostingParams): Promise<{ success: boolean; message: string; postId?: string }> => {
  try {
    const response = await fetch(`/api/social/${params.platform}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: params.accessToken,
        userId: params.userId,
        pageId: params.pageId,
        imageUrl: params.imageUrl,
        caption: params.caption,
        postToPage: params.postToPage,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to post')
    }

    const data = await response.json()
    return {
      success: true,
      message: data.message,
      postId: data.post_id,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to post to social media',
    }
  }
}

// Upload image to a public URL (you'll need to implement this based on your hosting solution)
export const uploadImageToPublicUrl = async (imageDataUrl: string): Promise<string> => {
  // For now, we'll return the data URL directly
  // In production, you'd want to upload to a service like Cloudinary, AWS S3, etc.

  // Convert data URL to blob
  const response = await fetch(imageDataUrl)
  const blob = await response.blob()

  // Create a temporary object URL (this won't work for Instagram/Facebook posting)
  // You should replace this with actual file upload logic
  return URL.createObjectURL(blob)
}

// Check if platform requires authentication
export const isPlatformAuthenticated = (platform: 'instagram' | 'facebook'): boolean => {
  const authData = socialAuthStorage.get(platform)
  return authData?.isAuthenticated && !!authData.accessToken
}

// Get platform display name
export const getPlatformDisplayName = (platform: string): string => {
  const names: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
  }
  return names[platform.toLowerCase()] || platform
}