"use client"

import { useState, useEffect } from "react"
import StatCard from "@/components/stat-card"
import EventsTable from "@/components/events-table"
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


export default function DashboardPage() {
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [searchCity, setSearchCity] = useState("")
  const [searchCommunity, setSearchCommunity] = useState("")
  const isMobile = useMediaQuery("(max-width: 768px)")
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch events and users in parallel
      const [eventsResult, usersResult] = await Promise.all([
        supabase.from("flood_events").select("*").order("created_at", { ascending: false }),
        supabase.from("users").select("*"),
      ])

      if (eventsResult.error) {
        console.error("Error fetching events:", eventsResult.error)
        toast.error("Failed to fetch events")
      } else {
        setEvents(eventsResult.data || [])
      }

      if (usersResult.error) {
        console.error("Error fetching users:", usersResult.error)
      } else {
        setUsers(usersResult.data || [])
      }
    } catch (error) {
      console.error("Fetch data error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const stats = [
    {
      title: "Total Events",
      value: events.length.toString(),
      description: "All flood events",
      icon: AlertTriangle,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Pending Approval",
      value: events.filter((e) => e.status === "pending").length.toString(),
      description: "Awaiting validation",
      icon: Clock,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-200",
    },
    {
      title: "Approved Events",
      value: events.filter((e) => e.status === "approved").length.toString(),
      description: "Validated events",
      icon: CheckCircle,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      title: "Published Events",
      value: events.filter((e) => e.status === "published").length.toString(),
      description: "Live on database",
      icon: TrendingUp,
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600",
      borderColor: "border-cyan-200",
    },
  ]

  // Events by country
  const eventsByCountry = events.reduce((acc, event) => {
    const country = event.country || "Unknown"
    acc[country] = (acc[country] || 0) + 1
    return acc
  }, {})
  const countryChartData = Object.entries(eventsByCountry).map(([name, value]) => ({ name, value }))

  // Events by status
  const eventsByStatus = events.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1
    return acc
  }, {})
  const statusChartData = Object.entries(eventsByStatus).map(([name, value]) => ({ name, value }))

  // Events over time (last 6 months)
  const eventsOverTime = events.reduce((acc, event) => {
    const month = new Date(event.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})
  const timeChartData = Object.entries(eventsOverTime)
    .map(([month, count]) => ({ month, count }))
    .slice(-6)

  // People affected and deaths
  const impactData = events.slice(0, 10).map((event) => ({
    id: event.id,
    affected: event.people_affected || 0,
    deaths: (event.male_deaths || 0) + (event.female_deaths || 0),
    location: event.city_name || event.area_name || "Unknown",
  }))

  const COLORS = ["#4B6EA0", "#7EBE96", "#F59E0B", "#EF4444", "#8B5CF6"]

  const filteredEvents = events.filter((event) => {
    const matchesCountry = !selectedCountry || event.country?.toLowerCase() === selectedCountry.toLowerCase()
    const matchesCity = !searchCity || event.city_name?.toLowerCase().includes(searchCity.toLowerCase())
    const matchesCommunity = !searchCommunity || event.area_name?.toLowerCase().includes(searchCommunity.toLowerCase())
    return matchesCountry && matchesCity && matchesCommunity
  })

  const formattedEvents = filteredEvents.slice(0, 10).map((event) => ({
    id: `FL-${event.id}`,
    date: new Date(event.date_started).toLocaleDateString(),
    location: `${event.city_name || event.area_name || "Unknown"}, ${event.country || "Unknown"}`,
    magnitude: event.depth > 2 ? "Severe" : event.depth > 1 ? "Moderate" : "Minor",
    status: event.status.charAt(0).toUpperCase() + event.status.slice(1),
    statusColor:
      event.status === "published"
        ? "bg-green-100 text-green-800"
        : event.status === "approved"
          ? "bg-blue-100 text-blue-800"
          : event.status === "pending"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800",
  }))

  const handleReset = () => {
    setSelectedCountry("")
    setSearchCity("")
    setSearchCommunity("")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

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

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Events Over Time Chart */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Events Over Time</CardTitle>
            <CardDescription>Flood events registered in the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="#4B6EA0" strokeWidth={2} dot={{ fill: "#4B6EA0" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Events by Status Chart */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Events by Status</CardTitle>
            <CardDescription>Distribution of event approval status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Events by Country Chart */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Events by Country</CardTitle>
            <CardDescription>Geographic distribution of flood events</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={countryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#7EBE96" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Impact Analysis Chart */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Impact Analysis</CardTitle>
            <CardDescription>People affected vs deaths (Top 10 events)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={impactData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="location"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="affected" fill="#4B6EA0" name="People Affected" radius={[8, 8, 0, 0]} />
                <Bar dataKey="deaths" fill="#EF4444" name="Deaths" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Events Section */}
      <div className="space-y-4 sm:space-y-6 animate-fadeInUp" style={{ animationDelay: "400ms" }}>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Recent Events</h2>

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
                  <option value="">All Countries</option>
                  {[...new Set(events.map((e) => e.country).filter(Boolean))].map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
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
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Community</label>
                  <input
                    type="text"
                    placeholder="Enter community name"
                    value={searchCommunity}
                    onChange={(e) => setSearchCommunity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={handleReset}
                className="flex-1 sm:flex-none px-4 py-2 text-sm bg-[#7EBE96FF] text-white rounded-md font-medium hover:opacity-90 transition-all duration-200 hover:shadow-md hover:scale-102 active:scale-98"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <EventsTable events={formattedEvents} isMobile={isMobile} />
      </div>
    </div>
  )
}
