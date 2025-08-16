"use client"

import { Button } from "@/components/ui/button"
import { useSocialAuth } from "@/hooks/use-social-auth"
import { getPlatformDisplayName } from "@/lib/social-auth"
import { LogIn, LogOut, Instagram, Facebook } from "lucide-react"

interface SocialAuthButtonProps {
  platform: 'instagram' | 'facebook'
  variant?: 'default' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function SocialAuthButton({
  platform,
  variant = 'outline',
  size = 'sm',
  className = ''
}: SocialAuthButtonProps) {
  const { isAuthenticated, login, logout } = useSocialAuth()
  const isAuth = isAuthenticated(platform)
  const displayName = getPlatformDisplayName(platform)

  const getIcon = () => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />
      case 'facebook':
        return <Facebook className="h-4 w-4" />
      default:
        return null
    }
  }

  const getColors = () => {
    if (isAuth) {
      return 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-200 dark:border-green-700'
    }

    switch (platform) {
      case 'instagram':
        return 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:hover:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700'
      case 'facebook':
        return 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
      default:
        return ''
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => isAuth ? logout(platform) : login(platform)}
      className={`${getColors()} ${className}`}
      aria-label={isAuth ? `Disconnect from ${displayName}` : `Connect to ${displayName}`}
    >
      {getIcon()}
      {isAuth ? (
        <>
          <LogOut className="h-3 w-3 ml-1" />
          <span className="ml-1">Connected</span>
        </>
      ) : (
        <>
          <LogIn className="h-3 w-3 ml-1" />
          <span className="ml-1">Connect</span>
        </>
      )}
    </Button>
  )
}