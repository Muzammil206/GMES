"use client"

import Link from "next/link"
import { Menu, LogOut } from "lucide-react"
import Image from "next/image"

export default function Header({ sidebarOpen, setSidebarOpen, isMobile }) {
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
            <Image
              src="/logo.png"
              width={180}
              height={20}
              alt="logo"
              className="h-auto w-auto max-w-[100px] sm:max-w-[120px] md:max-w-[180px]"
            />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
        <Link
          href="/"
          className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
        >
          Home
        </Link>
        <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-foreground hover:text-primary transition-all duration-200 hover:bg-primary/10 rounded-lg active:scale-95">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
