"use client"

import { createContext, useContext, useState, useEffect } from "react"

const PwaPromptContext = createContext({
  deferredPrompt: null,
  setDeferredPrompt: () => {},
})

export function usePwaPrompt() {
  return useContext(PwaPromptContext)
}

export function PwaPromptProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      console.log("[v0] PWA install prompt available")
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  return <PwaPromptContext.Provider value={{ deferredPrompt, setDeferredPrompt }}>{children}</PwaPromptContext.Provider>
}
