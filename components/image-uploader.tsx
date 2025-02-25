"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  BookmarkIcon,
  CopyIcon,
  Facebook,
  Heart,
  Instagram,
  Linkedin,
  LoaderIcon,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Send,
  Share2,
  ThumbsUp,
  Twitter,
  UploadIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Add a type for the platform data
interface PlatformData {
  name: string
  icon: React.ElementType
  color: string
}

interface Caption {
  platform: string
  text: string
}

export function ImageUploader() {
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [captions, setCaptions] = useState<Caption[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [context, setContext] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>("")
  const [lastSelectedPlatform, setLastSelectedPlatform] = useState<string>("")
  const { toast } = useToast()
  const resultsRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Define platform data once to avoid recreating objects
  const platforms: PlatformData[] = [
    { name: "Instagram", icon: Instagram, color: "text-pink-600" },
    { name: "Twitter", icon: Twitter, color: "text-blue-500" },
    { name: "Facebook", icon: Facebook, color: "text-blue-600" },
    { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  ]

  // Set the active tab when captions are updated
  useEffect(() => {
    if (captions.length > 0) {
      // If the last selected platform is in the captions, set it as active
      if (
        lastSelectedPlatform &&
        captions.some((c) => c.platform.toLowerCase() === lastSelectedPlatform.toLowerCase())
      ) {
        setActiveTab(lastSelectedPlatform.toLowerCase())
      } else {
        // Otherwise, set the first caption's platform as active
        setActiveTab(captions[0].platform.toLowerCase())
      }
    }
  }, [captions, lastSelectedPlatform])

  const handleImageUpload = useCallback(
    (file: File) => {
      if (!file.type.includes("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an image file.",
        })
        return
      }

      // Optimize image handling with size check
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
        })
        return
      }

      // Convert to base64
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setImage(base64)
        setCaptions([]) // Reset captions when new image is uploaded
      }
      reader.readAsDataURL(file)
    },
    [toast],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleImageUpload(file)
      }
    },
    [handleImageUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  // Update platform selection handler to track the last selected platform
  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms((prev) => [...prev, platform])
      setLastSelectedPlatform(platform) // Track the most recently selected platform
    } else {
      setSelectedPlatforms((prev) => prev.filter((p) => p !== platform))
      // If the deselected platform was the last selected, clear it
      if (lastSelectedPlatform === platform) {
        setLastSelectedPlatform("")
      }
    }
  }

  // Optimize API call with AbortController for cancellation
  const generateCaptions = async () => {
    if (!image) {
      toast({
        variant: "destructive",
        title: "No image selected",
        description: "Please upload an image first.",
      })
      return
    }

    if (selectedPlatforms.length === 0) {
      toast({
        variant: "destructive",
        title: "No platforms selected",
        description: "Please select at least one social media platform.",
      })
      return
    }

    setLoading(true)

    // Create an AbortController to cancel the request if needed
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

    try {
      const response = await fetch("/api/generate-captions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image, context, platforms: selectedPlatforms }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error("Failed to generate captions")
      }

      const data = await response.json()
      setCaptions(data.captions)

      // Scroll to results after a short delay to ensure rendering
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch (error) {
      // Check if the error is due to an aborted request
      if ((error as Error).name === "AbortError") {
        toast({
          variant: "destructive",
          title: "Request timeout",
          description: "The caption generation took too long. Please try again.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate captions. Please try again.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The caption has been copied to your clipboard.",
    })
  }

  // Get the platform icon with appropriate color and accessibility attributes
  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find((p) => p.name.toLowerCase() === platform.toLowerCase())
    if (!platformData) return null

    const Icon = platformData.icon
    return <Icon className={`h-5 w-5 ${platformData.color} animate-pulse`} aria-hidden="true" />
  }

  return (
    <div className="space-y-8">
      <Card className="p-6 w-[400px] mx-auto bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-2 border-purple-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] transform">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-bold text-center animate-pulse bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Social Media Caption Generator
          </h2>
          <div
            className={cn(
              "w-full aspect-square relative border-2 border-dashed rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:border-primary hover:bg-primary/5",
              isDragging ? "border-primary bg-primary/10" : "border-purple-300 dark:border-slate-600",
              image ? "border-none" : "",
            )}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            role="button"
            tabIndex={0}
            aria-label="Upload image"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click()
              }
            }}
          >
            {image ? (
              <Image
                src={image || "/placeholder.svg"}
                alt="Uploaded image"
                fill
                className="object-cover rounded-lg"
                priority
                sizes="(max-width: 400px) 100vw, 400px"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-8 text-center">
                <UploadIcon
                  className="w-8 h-8 text-purple-500 dark:text-purple-400 animate-bounce"
                  aria-hidden="true"
                />
                <p className="text-purple-700 dark:text-purple-300 animate-pulse">
                  Click here or drag and drop your image
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Supports: JPG, PNG, GIF</p>
              </div>
            )}
          </div>
          <div className="w-full space-y-2">
            <Label htmlFor="context" className="text-purple-800 dark:text-purple-200">
              Image Context (optional)
            </Label>
            <Textarea
              id="context"
              placeholder="Add details about your image to improve caption generation..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="resize-none border-purple-200 dark:border-slate-700 focus:border-purple-400"
              aria-describedby="context-description"
            />
            <p id="context-description" className="text-xs text-purple-800 dark:text-purple-200">
              Providing context helps the AI generate more relevant captions
            </p>
          </div>
          <div className="w-full space-y-2">
            <fieldset>
              <legend className="text-purple-800 dark:text-purple-200 mb-2">
                Select platforms for caption generation
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((platform) => (
                  <div key={platform.name} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`platform-${platform.name}`}
                      checked={selectedPlatforms.includes(platform.name)}
                      onChange={(e) => handlePlatformChange(platform.name, e.target.checked)}
                      className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      aria-label={`Generate caption for ${platform.name}`}
                    />
                    <Label
                      htmlFor={`platform-${platform.name}`}
                      className="text-sm font-medium text-purple-800 dark:text-purple-200 cursor-pointer"
                    >
                      {platform.name}
                    </Label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="image-upload"
            ref={fileInputRef}
            onChange={handleFileInput}
            aria-label="Upload image file"
          />
          {image && (
            <Button
              onClick={generateCaptions}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 hover:from-purple-700 hover:via-pink-600 hover:to-blue-700 text-white transition-all duration-300 hover:scale-105 transform"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <LoaderIcon className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  <span>Generating...</span>
                </>
              ) : (
                "Generate Captions"
              )}
            </Button>
          )}
        </div>
      </Card>

      {loading && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          role="alert"
          aria-live="assertive"
        >
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-2xl max-w-md w-full flex flex-col items-center gap-4 animate-bounce-slow">
            <div className="relative w-20 h-20" aria-hidden="true">
              <div className="absolute inset-0 rounded-full border-8 border-t-purple-600 border-r-pink-500 border-b-blue-500 border-l-green-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-8 border-t-blue-500 border-r-green-500 border-b-purple-600 border-l-pink-500 animate-spin-slow"></div>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent animate-pulse">
              Generating Captions
            </h3>
            <p className="text-center text-slate-600 dark:text-slate-300">
              Our AI is analyzing your image and crafting the perfect captions for your selected platforms...
            </p>
            <div className="flex gap-2 mt-2" aria-hidden="true">
              {selectedPlatforms.map((platform) => {
                const PlatformIcon = platforms.find((p) => p.name === platform)?.icon || Instagram
                const color = platforms.find((p) => p.name === platform)?.color || "text-pink-600"
                return <PlatformIcon key={platform} className={`h-6 w-6 ${color} animate-pulse`} />
              })}
            </div>
          </div>
        </div>
      )}

      {captions.length > 0 && (
        <div ref={resultsRef} tabIndex={-1}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-3xl mx-auto">
            <TabsList
              className={`grid w-full p-1 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-700 transition-all duration-300 hover:shadow-md ${captions.length > 3 ? "grid-cols-4" : `grid-cols-${captions.length}`}`}
              aria-label="Social media platforms"
            >
              {captions.some((c) => c.platform === "Instagram") && (
                <TabsTrigger
                  value="instagram"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                >
                  {getPlatformIcon("Instagram")}
                  <span>Instagram</span>
                </TabsTrigger>
              )}
              {captions.some((c) => c.platform === "Twitter") && (
                <TabsTrigger
                  value="twitter"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                >
                  {getPlatformIcon("Twitter")}
                  <span>Twitter</span>
                </TabsTrigger>
              )}
              {captions.some((c) => c.platform === "Facebook") && (
                <TabsTrigger
                  value="facebook"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                >
                  {getPlatformIcon("Facebook")}
                  <span>Facebook</span>
                </TabsTrigger>
              )}
              {captions.some((c) => c.platform === "LinkedIn") && (
                <TabsTrigger
                  value="linkedin"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
                >
                  {getPlatformIcon("LinkedIn")}
                  <span>LinkedIn</span>
                </TabsTrigger>
              )}
            </TabsList>

            {captions.some((c) => c.platform === "Instagram") && (
              <TabsContent value="instagram">
                <Card className="w-full max-w-md mx-auto border-2 border-purple-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-3 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 border-2 border-pink-200">
                        <AvatarImage src="/placeholder.svg" alt="User profile" />
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
                          UI
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm text-purple-900 dark:text-purple-100">username</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-purple-700 dark:text-purple-300"
                      aria-label="More options"
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                  {image && (
                    <div className="relative aspect-square">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt="Instagram post"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                  )}
                  <div className="p-3 space-y-3 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-pink-600 dark:text-pink-400 hover:text-pink-700"
                          aria-label="Like"
                        >
                          <Heart className="h-5 w-5" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-purple-600 dark:text-purple-400 hover:text-purple-700"
                          aria-label="Comment"
                        >
                          <MessageCircle className="h-5 w-5" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:text-blue-700"
                          aria-label="Share"
                        >
                          <Send className="h-5 w-5" aria-hidden="true" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700"
                        aria-label="Save"
                      >
                        <BookmarkIcon className="h-5 w-5" aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-sm text-purple-900 dark:text-purple-100">username</span>
                        <p className="text-sm flex-1 text-slate-900 dark:text-slate-100">
                          {captions.find((c) => c.platform === "Instagram")?.text}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-slate-500 text-xs font-normal">
                        View all 123 comments
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            )}

            {captions.some((c) => c.platform === "Twitter") && (
              <TabsContent value="twitter">
                <Card className="w-full max-w-md mx-auto border-2 border-blue-200 dark:border-slate-700">
                  <div className="p-4 space-y-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-blue-200">
                        <AvatarImage src="/placeholder.svg" alt="User profile" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white">
                          UI
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-900 dark:text-blue-100">Display Name</span>
                          <span className="text-blue-600 dark:text-blue-400">@username</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-700 dark:text-blue-300"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                    <p className="text-[15px] text-slate-900 dark:text-slate-100">
                      {captions.find((c) => c.platform === "Twitter")?.text}
                    </p>
                    {image && (
                      <div className="relative aspect-video mt-3 rounded-xl overflow-hidden border border-blue-200 dark:border-slate-700">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt="Tweet image"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:text-blue-700"
                        aria-label="Reply"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 dark:text-green-400 hover:text-green-700"
                        aria-label="Retweet"
                      >
                        <Repeat2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-700"
                        aria-label="Like"
                      >
                        <Heart className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:text-blue-700"
                        aria-label="Share"
                      >
                        <Share2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            )}

            {captions.some((c) => c.platform === "Facebook") && (
              <TabsContent value="facebook">
                <Card className="w-full max-w-md mx-auto border-2 border-blue-200 dark:border-slate-700">
                  <div className="p-4 space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-10 h-10 border-2 border-blue-200">
                          <AvatarImage src="/placeholder.svg" alt="User profile" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                            UI
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-blue-900 dark:text-blue-100">Display Name</p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">Just now</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-700 dark:text-blue-300"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                    <p className="text-[15px] text-slate-900 dark:text-slate-100">
                      {captions.find((c) => c.platform === "Facebook")?.text}
                    </p>
                    {image && (
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-blue-200 dark:border-slate-700">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt="Facebook post"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-blue-700 dark:text-blue-300">
                      <span>123 Likes</span>
                      <span>45 Comments</span>
                    </div>
                    <Separator className="bg-blue-200 dark:bg-slate-700" />
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        className="flex-1 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-800"
                        aria-label="Like"
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" aria-hidden="true" />
                        <span>Like</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-800"
                        aria-label="Comment"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                        <span>Comment</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-800"
                        aria-label="Share"
                      >
                        <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
                        <span>Share</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            )}

            {captions.some((c) => c.platform === "LinkedIn") && (
              <TabsContent value="linkedin">
                <Card className="w-full max-w-md mx-auto border-2 border-blue-200 dark:border-slate-700">
                  <div className="p-4 space-y-4 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-slate-900 dark:to-slate-800">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12 border-2 border-blue-200">
                        <AvatarImage src="/placeholder.svg" alt="User profile" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-sky-600 text-white">
                          UI
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900 dark:text-blue-100">Display Name</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Professional Title</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Just now • 🌐</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-700 dark:text-blue-300"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      {captions.find((c) => c.platform === "LinkedIn")?.text}
                    </p>
                    {image && (
                      <div className="relative aspect-video rounded-lg overflow-hidden border border-blue-200 dark:border-slate-700">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt="LinkedIn post"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-blue-700 dark:text-blue-300">
                      <span>123 reactions • 45 comments</span>
                    </div>
                    <Separator className="bg-blue-200 dark:bg-slate-700" />
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        className="flex-1 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-800"
                        aria-label="Like"
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" aria-hidden="true" />
                        <span>Like</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-800"
                        aria-label="Comment"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                        <span>Comment</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-800"
                        aria-label="Share"
                      >
                        <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
                        <span>Share</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            )}

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(captions.find((c) => c.platform.toLowerCase() === activeTab)?.text || "")
                }
                className="bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 border-purple-300 text-purple-800 dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-700 dark:border-slate-600 dark:text-purple-300 transition-all duration-300 hover:scale-105 transform"
                aria-label="Copy caption to clipboard"
              >
                <CopyIcon className="h-4 w-4 mr-2 animate-spin-slow" aria-hidden="true" />
                <span>Copy Caption</span>
              </Button>
            </div>
          </Tabs>
        </div>
      )}
    </div>
  )
}

