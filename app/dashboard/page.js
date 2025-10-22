"use client"

import { useState } from "react"
import StatCard from "@/components/stat-card"
import EventsTable from "@/components/events-table"
import { Users, Plus, CheckCircle, Clock } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function DashboardPage() {
  const [selectedCountry, setSelectedCountry] = useState("")
  const [searchCity, setSearchCity] = useState("")
  const [searchCommunity, setSearchCommunity] = useState("")
  const isMobile = useMediaQuery("(max-width: 768px)")

  const stats = [
    {
      title: "New Event",
      value: "12",
      description: "Add an Event",
      icon: Plus,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Events Registered",
      value: "125",
      description: "Total events registered",
      icon: Users,
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600",
      borderColor: "border-cyan-200",
    },
    {
      title: "Events Updated",
      value: "38",
      description: "Recently updated events",
      icon: Clock,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-200",
    },
    {
      title: "Events Published",
      value: "87",
      description: "Events live on database",
      icon: CheckCircle,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-200",
    },
  ]

  const events = [
    {
      id: "FL-2024-001",
      date: "2024-03-15",
      location: "Buea, Cameroon",
      magnitude: "Severe",
      status: "Published",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: "FL-2024-002",
      date: "2024-03-10",
      location: "Lagos, Nigeria",
      magnitude: "Moderate",
      status: "Registered",
      statusColor: "bg-blue-100 text-blue-800",
    },
    {
      id: "FL-2024-003",
      date: "2024-03-08",
      location: "Accra, Ghana",
      magnitude: "Minor",
      status: "Updated",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: "FL-2024-004",
      date: "2024-03-01",
      location: "Douala, Cameroon",
      magnitude: "Severe",
      status: "Published",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: "FL-2024-005",
      date: "2024-02-28",
      location: "Ibadan, Nigeria",
      magnitude: "Moderate",
      status: "Registered",
      statusColor: "bg-blue-100 text-blue-800",
    },
  ]

  return (
    <div className={`space-y-6 sm:space-y-8 animate-fadeInUp ${isMobile ? "max-w-full" : "max-w-[1600px] mx-auto"}`}>
      {/* Page Title */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 sm:p-6 rounded-xl backdrop-blur-sm border border-border/50">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3 tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Welcome back! Here's your flood event overview.</p>
      </div>

      {/* Stat Cards - Responsive Grid */}
      <div className={`grid gap-3 sm:gap-4 ${isMobile ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className="transform hover:scale-105 transition-transform duration-200"
            style={{
              animation: `fadeInUp 0.6s ease-out ${index * 100}ms both`,
            }}
          >
            <StatCard {...stat} isMobile={isMobile} />
          </div>
        ))}
      </div>

      {/* Events Section */}
      <div className="space-y-4 sm:space-y-6 animate-fadeInUp" style={{ animationDelay: "400ms" }}>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">List of Events</h2>

          {/* Filters */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3 sm:p-6 mb-4 sm:mb-6 shadow-lg">
            <h3 className="text-sm font-semibold mb-3 sm:mb-4 text-foreground/90">Filter Events</h3>
            <div
              className={`grid gap-2 sm:gap-4 mb-4 ${isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}
            >
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                >
                  <option value="">Select Country</option>
                  <option value="cameroon">Cameroon</option>
                  <option value="nigeria">Nigeria</option>
                  <option value="ghana">Ghana</option>
                  <option value="senegal">Senegal</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase">City</label>
                <input
                  type="text"
                  placeholder="Enter city name"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                />
              </div>

              {!isMobile && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                      Community
                    </label>
                    <input
                      type="text"
                      placeholder="Enter community name"
                      value={searchCommunity}
                      onChange={(e) => setSearchCommunity(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Sort By</label>
                    <select className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200">
                      <option value="">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="severity">By Severity</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button className="flex-1 bg-[#4B6EA0FF] sm:flex-none px-4 py-2 text-sm  text-primary-foreground rounded-md font-medium hover:opacity-90 transition-all duration-200 hover:shadow-md hover:scale-102 active:scale-98">
                Search
              </button>
              <button className="flex-1 sm:flex-none px-4 py-2 text-sm bg-[#7EBE96FF] text-white rounded-md font-medium hover:opacity-90 transition-all duration-200 hover:shadow-md hover:scale-102 active:scale-98">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <EventsTable events={events} isMobile={isMobile} />
      </div>
    </div>
  )
}
