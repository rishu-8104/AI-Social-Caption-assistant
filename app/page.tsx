import { ImageUploader } from "@/components/image-uploader"
import dynamic from "next/dynamic"
import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react"

// Dynamically import less frequently used icons to reduce initial bundle size
const Youtube = dynamic(() => import("lucide-react").then((mod) => mod.Youtube), { ssr: false })
const TikTok = dynamic(() => import("lucide-react").then((mod) => mod.TwitterIcon), { ssr: false })
const Snapchat = dynamic(() => import("lucide-react").then((mod) => mod.SnailIcon), { ssr: false })
const Pinterest = dynamic(() => import("lucide-react").then((mod) => mod.PinIcon), { ssr: false })
const Reddit = dynamic(() => import("lucide-react").then((mod) => mod.RssIcon), { ssr: false })
const Twitch = dynamic(() => import("lucide-react").then((mod) => mod.Twitch), { ssr: false })

export default function Home() {
  // Array of social media icons with their respective colors for WCAG compliance
  const socialIcons = [
    { icon: Instagram, color: "text-pink-500", label: "Instagram icon" },
    { icon: Twitter, color: "text-blue-500", label: "Twitter icon" },
    { icon: Facebook, color: "text-blue-600", label: "Facebook icon" },
    { icon: Linkedin, color: "text-blue-700", label: "LinkedIn icon" },
    { icon: Youtube, color: "text-red-600", label: "YouTube icon" },
    { icon: TikTok, color: "text-slate-200", label: "TikTok icon" },
    { icon: Pinterest, color: "text-red-500", label: "Pinterest icon" },
    { icon: Reddit, color: "text-orange-500", label: "Reddit icon" },
    { icon: Snapchat, color: "text-yellow-400", label: "Snapchat icon" },
    { icon: Twitch, color: "text-purple-500", label: "Twitch icon" },
  ]

  return (
    <main
      className="min-h-screen p-4 md:p-8 lg:p-12 bg-slate-900 relative overflow-hidden"
      role="main"
      aria-labelledby="main-heading"
    >
      {/* Animated floating social media icons - reduced quantity for better performance */}
      <div
        className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none"
        aria-hidden="true" // Hide from screen readers as this is decorative
      >
        {Array.from({ length: 40 }).map((_, i) => {
          const randomIcon = socialIcons[Math.floor(Math.random() * socialIcons.length)]
          const Icon = randomIcon.icon
          const size = 24 + Math.random() * 36
          const left = `${Math.random() * 100}%`
          const top = `${Math.random() * 100}%`
          const animationDuration = 15 + Math.random() * 45
          const animationDelay = Math.random() * 15
          const animationType = Math.random() > 0.5 ? "float" : "float-alt"
          const opacity = 0.5 + Math.random() * 0.5

          return (
            <div
              key={i}
              className={`absolute ${animationType === "float" ? "animate-float" : "animate-float-alt"}`}
              style={{
                left,
                top,
                animationDuration: `${8 + Math.random() * 15}s`,
                animationDelay: `${Math.random() * 8}s`,
                opacity,
              }}
              aria-hidden="true"
            >
              <Icon className={randomIcon.color} size={size} />
            </div>
          )
        })}
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="space-y-2 text-center relative overflow-hidden p-6 rounded-xl">
          <div
            className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-blue-900/50 opacity-70 animate-pulse"
            aria-hidden="true"
          ></div>
          <h1
            id="main-heading"
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl relative animate-bounce-slow bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 bg-clip-text text-transparent"
          >
            Social Media Caption Generator
          </h1>
          <p className="text-slate-300 relative animate-fade-in">
            Upload an image and get AI-generated captions for different social media platforms
          </p>
        </div>
        <ImageUploader />
      </div>

      {/* Accessibility skip link - hidden visually but available for keyboard users */}
      <a
        href="#main-heading"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        Skip to main content
      </a>
    </main>
  )
}

