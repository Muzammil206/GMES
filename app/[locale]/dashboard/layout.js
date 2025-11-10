"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import BottomNav from "@/components/bottom-nav"
import { useMediaQuery } from "@/hooks/use-media-query"
import { PwaProvider } from '@/components/PwaPromptProvider';
import DownloadAppPage from "@/components/download"






export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <div className="flex h-screen bg-background">
      
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          
          <div className="p-4 sm:p-6 md:p-8">{children}</div>
          
        </main>
      </div>

      {/* Bottom Navigation - Mobile only */}
      {isMobile && <BottomNav />}
    </div>
  )
}
