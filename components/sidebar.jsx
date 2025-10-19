"use client"
import Link from "next/link"
import { LayoutDashboard, Plus, Users, Upload, FileText, ChevronLeft, ChevronRight, Map } from "lucide-react"

export default function Sidebar({ isOpen, setIsOpen }) {
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: Plus,
      label: "Add an Event",
      href: "/dashboard/add-event",
    },
    {
      icon: Users,
      label: "Manage Users and roles",
      href: "/dashboard/manage-users",
    },
    {
      icon: Upload,
      label: "Import data",
      href: "/dashboard/import-data",
    },
    {
      icon: FileText,
      label: "Registrations",
      href: "/dashboard/registrations",
    },
     {
      icon: Map,
      label: "Flood Map",
      href: "/dashboard/map",
    },
  ]

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
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-foreground">MIFMASS</span>
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
              <span className="text-primary-foreground text-xs font-bold">DJ</span>
            </div>
            {isOpen && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Dr Valere</p>
                <p className="text-xs text-muted-foreground truncate">JOFACK</p>
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
