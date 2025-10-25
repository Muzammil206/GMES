"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { LayoutDashboard, Plus, Users, Upload, ChevronLeft, ChevronRight, Map, ClipboardCheck } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

export default function Sidebar({ isOpen, setIsOpen }) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      const supabase = createBrowserClient()

      // Get current auth user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Get user details from public.users table
        const { data, error } = await supabase.from("users").select("*").eq("user_id", user.id).single()

        if (data && !error) {
          setUserData(data)
        }
      }

      setLoading(false)
    }

    fetchUserData()
  }, [])

  const allMenuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
      roles: ["user", "country_admin", "admin"], // All roles can access
    },
    {
      icon: Plus,
      label: "Add an Event",
      href: "/dashboard/add-event",
      roles: ["user", "country_admin", "admin"], // All roles can access
    },
    {
      icon: Map,
      label: "Flood Map",
      href: "/dashboard/map",
      roles: ["user", "country_admin", "admin"], // All roles can access
    },
    {
      icon: ClipboardCheck,
      label: "Manage Events",
      href: "/dashboard/manage-event",
      roles: ["country_admin", "admin"], // Only admins
    },
    {
      icon: Upload,
      label: "Import Data",
      href: "/dashboard/import-data",
      roles: ["country_admin", "admin"], // Only admins
    },
    {
      icon: Users,
      label: "User Registrations",
      href: "/dashboard/registrations",
      roles: ["admin"], // Only general admin
    },
  ]

  const menuItems = userData ? allMenuItems.filter((item) => item.roles.includes(userData.role)) : []

  return (
    <>
      {/* Sidebar */}
      <div
        className={`bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center gap-2 animate-slideInLeft">
              <Image src="/appi.png" width={40} height={40} alt="logo" className="h-auto w-auto" />
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isOpen ? "hover:bg-primary-light text-foreground" : "justify-center hover:bg-primary-light"
                }`}
                style={{
                  animation: `slideInLeft 0.4s ease-out ${index * 50}ms both`,
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0 group-hover:text-primary transition-colors" />
                {isOpen && (
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className={`flex items-center gap-3 ${isOpen ? "" : "justify-center"}`}>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              {userData && (
                <span className="text-xs font-semibold text-primary-foreground">
                  {userData.firstname?.[0]}
                  {userData.lastname?.[0]}
                </span>
              )}
            </div>
            {isOpen && (
              <div className="min-w-0">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : userData ? (
                  <>
                    <p className="text-sm font-medium text-foreground truncate">
                      {userData.title} {userData.firstname}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{userData.lastname}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Guest</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-64 md:left-20 bottom-8 bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 hover:scale-110"
        style={{
          left: isOpen ? "256px" : "80px",
        }}
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
    </>
  )
}
