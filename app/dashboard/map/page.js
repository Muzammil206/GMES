"use client"

import { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import { Download, Filter, X, ChevronLeft, ChevronRight, Calendar, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// Dynamically import map component to avoid SSR issues
const FloodMapView = dynamic(() => import("@/components/flood-map-view"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
})

const WEST_AFRICAN_COUNTRIES = [
  "All Countries",
  "Nigeria",
  "Ghana",
  "Senegal",
  "Côte d'Ivoire",
  "Mali",
  "Burkina Faso",
  "Sierra Leone",
  "Liberia",
  "Niger",
  "Guinea",
  "Benin",
  "Togo",
  "Gambia",
  "Guinea-Bissau",
  "Cape Verde",
]

const calculateSeverity = (depth) => {
  const depthNum = Number.parseFloat(depth)
  if (depthNum >= 2) return "High"
  if (depthNum >= 1) return "Medium"
  return "Low"
}

export default function FloodMapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState("All Countries")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const supabase = createBrowserClient()
        const { data, error } = await supabase
          .from("flood_events")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error

        setEvents(data || [])
      } catch (error) {
        console.error("Error fetching events:", error)
        toast.error("Failed to load flood events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCountry = selectedCountry === "All Countries" || event.country === selectedCountry
      const matchesStatus = selectedStatus === "All" || event.status === selectedStatus
      const matchesSearch =
        searchQuery === "" ||
        event.place_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.city_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.id?.toString().includes(searchQuery)

      let matchesDate = true
      if (dateFrom && dateTo) {
        const eventDate = new Date(event.date_started)
        matchesDate = eventDate >= new Date(dateFrom) && eventDate <= new Date(dateTo)
      }

      return matchesCountry && matchesStatus && matchesSearch && matchesDate
    })
  }, [events, selectedCountry, selectedStatus, dateFrom, dateTo, searchQuery])

  // Download data as CSV
  const downloadCSV = () => {
    const headers = [
      "ID",
      "Location",
      "Country",
      "Date",
      "Status",
      "Depth",
      "People Affected",
      "Deaths",
      "Economic Loss",
      "Submitted By",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredEvents.map((event) =>
        [
          event.id,
          `"${event.place_name || event.city_name || ""}"`,
          event.country || "",
          event.date_started,
          event.status,
          event.depth,
          event.people_affected || 0,
          Number.parseInt(event.male_deaths || 0) + Number.parseInt(event.female_deaths || 0),
          event.economic_loss || 0,
          event.submitted_by_email,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `flood-events-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Download data as JSON
  const downloadJSON = () => {
    const jsonContent = JSON.stringify(filteredEvents, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `flood-events-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setSelectedCountry("All Countries")
    setSelectedStatus("All")
    setDateFrom("")
    setDateTo("")
    setSearchQuery("")
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "High":
        return "bg-destructive text-destructive-foreground"
      case "Medium":
        return "bg-yellow-500 text-white"
      case "Low":
        return "bg-green-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-500 text-white"
      case "approved":
        return "bg-blue-500 text-white"
      case "pending":
        return "bg-yellow-500 text-white"
      case "rejected":
        return "bg-red-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading flood events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex relative">
      {/* Sidebar */}
      <div
        className={`bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${
          sidebarOpen ? "w-96" : "w-0"
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-border sticky top-0 bg-card z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Flood Events</h2>
              <Badge variant="secondary" className="text-sm">
                {filteredEvents.length} events
              </Badge>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search by location or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEST_AFRICAN_COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">From Date</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">To Date</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters} className="flex-1 bg-transparent">
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
                <Button variant="outline" size="sm" onClick={downloadCSV} className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-1" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={downloadJSON} className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-1" />
                  JSON
                </Button>
              </div>
            </div>
          </div>

          {/* Event List */}
          <div className="p-4 space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No events match your filters</p>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const severity = calculateSeverity(event.depth)
                const totalDeaths = Number.parseInt(event.male_deaths || 0) + Number.parseInt(event.female_deaths || 0)

                return (
                  <Card
                    key={event.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedEvent?.id === event.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm mb-1">
                          {event.place_name || event.city_name || "Unknown Location"}
                        </h3>
                        <p className="text-xs text-muted-foreground">ID: {event.id}</p>
                      </div>
                      <Badge className={getSeverityColor(severity)} variant="secondary">
                        {severity}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(event.date_started).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Droplets className="w-3 h-3" />
                        <span>Depth: {event.depth}m</span>
                        <span className="ml-auto">{event.people_affected || 0} affected</span>
                      </div>
                      {totalDeaths > 0 && <div className="text-red-600 font-medium">Deaths: {totalDeaths}</div>}
                    </div>

                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      <Badge className={getStatusColor(event.status)} variant="secondary">
                        {event.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{event.country || "N/A"}</span>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <FloodMapView events={filteredEvents} selectedEvent={selectedEvent} onEventSelect={setSelectedEvent} />

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-4 top-4 bg-card border border-border p-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 z-[1000] hover:scale-105"
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Legend */}
        <div className="absolute right-4 top-4 bg-card border border-border rounded-lg shadow-lg p-4 z-[1000]">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Severity Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-xs text-foreground">High (&gt;2m)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-foreground">Medium (1-2m)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-xs text-foreground">Low (&lt;1m)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
