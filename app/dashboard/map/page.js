"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { Download, Filter, X, ChevronLeft, ChevronRight, Calendar, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

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

// Demo data for West African flood events
const DEMO_EVENTS = [
  {
    id: "FE001",
    location: "Lagos, Nigeria",
    country: "Nigeria",
    lat: 6.5244,
    lng: 3.3792,
    date: "2024-08-15",
    publishDate: "2024-08-16",
    status: "Published",
    severity: "High",
    depth: "2.5m",
    affected: 1500,
    description: "Severe flooding in Lagos metropolitan area affecting residential zones",
  },
  {
    id: "FE002",
    location: "Accra, Ghana",
    country: "Ghana",
    lat: 5.6037,
    lng: -0.187,
    date: "2024-07-22",
    publishDate: "2024-07-23",
    status: "Published",
    severity: "Medium",
    depth: "1.2m",
    affected: 800,
    description: "Flash flooding in Accra following heavy rainfall",
  },
  {
    id: "FE003",
    location: "Dakar, Senegal",
    country: "Senegal",
    lat: 14.7167,
    lng: -17.4677,
    date: "2024-09-05",
    publishDate: "2024-09-06",
    status: "Published",
    severity: "Low",
    depth: "0.8m",
    affected: 350,
    description: "Minor flooding in coastal areas of Dakar",
  },
  {
    id: "FE004",
    location: "Abidjan, Côte d'Ivoire",
    country: "Côte d'Ivoire",
    lat: 5.345,
    lng: -4.024,
    date: "2024-08-30",
    publishDate: "2024-08-31",
    status: "Published",
    severity: "High",
    depth: "3.1m",
    affected: 2200,
    description: "Major flooding affecting multiple districts in Abidjan",
  },
  {
    id: "FE005",
    location: "Bamako, Mali",
    country: "Mali",
    lat: 12.6392,
    lng: -8.0029,
    date: "2024-07-10",
    publishDate: "2024-07-11",
    status: "Approved",
    severity: "Medium",
    depth: "1.5m",
    affected: 600,
    description: "Flooding along Niger River affecting agricultural areas",
  },
  {
    id: "FE006",
    location: "Ouagadougou, Burkina Faso",
    country: "Burkina Faso",
    lat: 12.3714,
    lng: -1.5197,
    date: "2024-09-12",
    publishDate: "2024-09-13",
    status: "Published",
    severity: "Medium",
    depth: "1.8m",
    affected: 950,
    description: "Urban flooding in Ouagadougou city center",
  },
  {
    id: "FE007",
    location: "Freetown, Sierra Leone",
    country: "Sierra Leone",
    lat: 8.4657,
    lng: -13.2317,
    date: "2024-08-20",
    publishDate: "2024-08-21",
    status: "Published",
    severity: "High",
    depth: "2.8m",
    affected: 1800,
    description: "Severe flooding and mudslides in Freetown",
  },
  {
    id: "FE008",
    location: "Monrovia, Liberia",
    country: "Liberia",
    lat: 6.3156,
    lng: -10.8074,
    date: "2024-09-01",
    publishDate: "2024-09-02",
    status: "Pending",
    severity: "Medium",
    depth: "1.4m",
    affected: 700,
    description: "Flooding in low-lying areas of Monrovia",
  },
  {
    id: "FE009",
    location: "Niamey, Niger",
    country: "Niger",
    lat: 13.5127,
    lng: 2.1128,
    date: "2024-07-28",
    publishDate: "2024-07-29",
    status: "Published",
    severity: "High",
    depth: "2.2m",
    affected: 1300,
    description: "Flooding along Niger River affecting residential areas",
  },
  {
    id: "FE010",
    location: "Conakry, Guinea",
    country: "Guinea",
    lat: 9.6412,
    lng: -13.5784,
    date: "2024-08-18",
    publishDate: "2024-08-19",
    status: "Published",
    severity: "Medium",
    depth: "1.6m",
    affected: 850,
    description: "Urban flooding in Conakry following tropical storm",
  },
]

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

export default function FloodMapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState("All Countries")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return DEMO_EVENTS.filter((event) => {
      const matchesCountry = selectedCountry === "All Countries" || event.country === selectedCountry
      const matchesStatus = selectedStatus === "All" || event.status === selectedStatus
      const matchesSearch =
        searchQuery === "" ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.id.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesDate = true
      if (dateFrom && dateTo) {
        const eventDate = new Date(event.date)
        matchesDate = eventDate >= new Date(dateFrom) && eventDate <= new Date(dateTo)
      }

      return matchesCountry && matchesStatus && matchesSearch && matchesDate
    })
  }, [selectedCountry, selectedStatus, dateFrom, dateTo, searchQuery])

  // Download data as CSV
  const downloadCSV = () => {
    const headers = [
      "ID",
      "Location",
      "Country",
      "Date",
      "Status",
      "Severity",
      "Depth",
      "People Affected",
      "Description",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredEvents.map((event) =>
        [
          event.id,
          `"${event.location}"`,
          event.country,
          event.date,
          event.status,
          event.severity,
          event.depth,
          event.affected,
          `"${event.description}"`,
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
      case "Published":
        return "bg-green-500 text-white"
      case "Approved":
        return "bg-blue-500 text-white"
      case "Pending":
        return "bg-yellow-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
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
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
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
              filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedEvent?.id === event.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm mb-1">{event.location}</h3>
                      <p className="text-xs text-muted-foreground">{event.id}</p>
                    </div>
                    <Badge className={getSeverityColor(event.severity)} variant="secondary">
                      {event.severity}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Droplets className="w-3 h-3" />
                      <span>Depth: {event.depth}</span>
                      <span className="ml-auto">{event.affected} affected</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <Badge className={getStatusColor(event.status)} variant="secondary">
                      {event.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{event.country}</span>
                  </div>
                </Card>
              ))
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
              <span className="text-xs text-foreground">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-xs text-foreground">Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
