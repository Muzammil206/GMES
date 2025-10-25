"use client"

import { useState } from "react"
import { Download, X, Smartphone } from "lucide-react"
import { usePwaPrompt } from "./PwaPromptProvider"
import { toast } from "sonner"

export function PwaInstallBanner() {
  const { deferredPrompt, setDeferredPrompt } = usePwaPrompt()
  const [isDismissed, setIsDismissed] = useState(false)

  const isInstallable = deferredPrompt !== null

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the browser's install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      toast.success("App installed successfully!")
      console.log("[v0] User accepted the install prompt")
    } else {
      toast.info("Installation cancelled")
      console.log("[v0] User dismissed the install prompt")
    }

    // The prompt can only be called once, so clear the state
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  // Don't show if not installable or dismissed
  if (!isInstallable || isDismissed) {
    return null
  }

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted/50 transition-colors group"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Smartphone className="w-6 h-6 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            Install Flood Database App
            <span className="px-2 py-0.5 text-xs font-semibold bg-primary/20 text-primary rounded-full">
              Quick Access
            </span>
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Get instant access to flood reporting and monitoring. Install our app for a faster, native-like experience
            with offline support.
          </p>
        </div>

        {/* Install button */}
        <button
          onClick={handleInstallClick}
          className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
        >
          <Download className="w-4 h-4" />
          Install Now
        </button>
      </div>

      {/* Features list */}
      <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>Works offline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>Fast & lightweight</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>Home screen access</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>Push notifications</span>
        </div>
      </div>
    </div>
  )
}
