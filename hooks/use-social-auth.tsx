"use client"

import { useState, useEffect, useCallback } from 'react'
import { socialAuthStorage, SocialAuthData, initiateOAuth, isPlatformAuthenticated } from '@/lib/social-auth'

export interface UseSocialAuthReturn {
  isAuthenticated: (platform: 'instagram' | 'facebook') => boolean
  authData: Record<string, SocialAuthData | null>
  login: (platform: 'instagram' | 'facebook') => void
  logout: (platform: 'instagram' | 'facebook') => void
  refreshAuthState: () => void
}

export function useSocialAuth(): UseSocialAuthReturn {
  const [authData, setAuthData] = useState<Record<string, SocialAuthData | null>>({
    instagram: null,
    facebook: null,
  })

  // Load auth data from localStorage on mount
  useEffect(() => {
    const loadAuthData = () => {
      setAuthData({
        instagram: socialAuthStorage.get('instagram'),
        facebook: socialAuthStorage.get('facebook'),
      })
    }

    loadAuthData()

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('social_auth_')) {
        loadAuthData()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Check if platform is authenticated
  const isAuthenticated = useCallback((platform: 'instagram' | 'facebook'): boolean => {
    return isPlatformAuthenticated(platform)
  }, [])

  // Initiate login flow
  const login = useCallback((platform: 'instagram' | 'facebook') => {
    initiateOAuth(platform)
  }, [])

  // Logout from platform
  const logout = useCallback((platform: 'instagram' | 'facebook') => {
    socialAuthStorage.remove(platform)
    setAuthData(prev => ({
      ...prev,
      [platform]: null,
    }))
  }, [])

  // Refresh auth state
  const refreshAuthState = useCallback(() => {
    setAuthData({
      instagram: socialAuthStorage.get('instagram'),
      facebook: socialAuthStorage.get('facebook'),
    })
  }, [])

  return {
    isAuthenticated,
    authData,
    login,
    logout,
    refreshAuthState,
  }
}