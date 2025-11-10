"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, LogOut, User } from "lucide-react"
import Image from "next/image"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import LanguageSwitcher from "@/components/language-switcher"

export default function Header({ sidebarOpen, setSidebarOpen, isMobile }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data: profile } = await supabase
            .from("users")
            .select("firstname, lastname, email")
            .eq("user_id", user.id)
            .single()

          setUserData(profile)
        }
      } catch (error) {
        console.error("Error checking user:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setUserData(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success("Logged out successfully")
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Failed to log out")
    }
  }

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-4 md:px-8 py-3 sm:py-4 sticky top-0 z-40 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-3 sm:gap-4">
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-primary/10 rounded-lg transition-all duration-200 active:scale-95"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        )}
        <div className="text-center">
          <div className="flex items-center">
            {/* <Image
              src="/logo.png"
              width={180}
              height={20}
              alt="logo"
              className="h-auto w-auto max-w-[100px] sm:max-w-[120px] md:max-w-[180px]"
            /> */}
          </div>
        </div>
      </div>
       <LanguageSwitcher />
      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
        <Link
          href="/"
          className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
        >
          Home
        </Link>

        {loading ? (
          <div className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-muted-foreground">Loading...</div>
        ) : user ? (
          <>
            <div className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-foreground bg-primary/5 rounded-lg border border-primary/20">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium">{userData?.firstname || user.email?.split("@")[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-foreground hover:text-destructive transition-all duration-200 hover:bg-destructive/10 rounded-lg active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-200 active:scale-95 font-medium"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
