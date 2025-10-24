"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2, CheckCircle, Upload, X, Search, Eye } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import EventDetailsModal from "@/components/event-details-modal"

export default function ManageEventsPage() {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [eventToView, setEventToView] = useState(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("flood_events").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching events:", error)
        toast.error("Failed to fetch events. Please try again.")
        return
      }

      setEvents(data || [])
    } catch (error) {
      console.error("Fetch events error:", error)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesStatus = filterStatus === "all" || event.status === filterStatus
    const matchesSearch =
      searchQuery === "" ||
      event.id.toString().includes(searchQuery) ||
      event.place_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.submitted_by_email?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const statusCounts = {
    all: events.length,
    pending: events.filter((e) => e.status === "pending").length,
    approved: events.filter((e) => e.status === "approved").length,
    published: events.filter((e) => e.status === "published").length,
    rejected: events.filter((e) => e.status === "rejected").length,
  }

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      const { error } = await supabase.from("flood_events").update({ status: newStatus }).eq("id", eventId)

      if (error) {
        console.error("Error updating status:", error)
        toast.error("Failed to update event status.")
        return
      }

      setEvents(events.map((event) => (event.id === eventId ? { ...event, status: newStatus } : event)))
      toast.success(`Event ${newStatus} successfully!`)
    } catch (error) {
      console.error("Status change error:", error)
      toast.error("An unexpected error occurred.")
    }
  }

  const handleDelete = async (eventId) => {
    try {
      const { error } = await supabase.from("flood_events").delete().eq("id", eventId)

      if (error) {
        console.error("Error deleting event:", error)
        toast.error("Failed to delete event.")
        return
      }

      setEvents(events.filter((event) => event.id !== eventId))
      setShowDeleteConfirm(false)
      setEventToDelete(null)
      toast.success("Event deleted successfully!")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("An unexpected error occurred.")
    }
  }

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from("flood_events")
        .update({
          place_name: selectedEvent.place_name,
          city_name: selectedEvent.city_name,
          country: selectedEvent.country,
          date_started: selectedEvent.date_started,
          depth: selectedEvent.depth,
          people_affected: selectedEvent.people_affected,
          description: selectedEvent.description,
          status: selectedEvent.status,
        })
        .eq("id", selectedEvent.id)

      if (error) {
        console.error("Error updating event:", error)
        toast.error("Failed to update event.")
        return
      }

      setEvents(events.map((event) => (event.id === selectedEvent.id ? selectedEvent : event)))
      setShowEditModal(false)
      setSelectedEvent(null)
      toast.success("Event updated successfully!")
    } catch (error) {
      console.error("Update error:", error)
      toast.error("An unexpected error occurred.")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "published":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-xl backdrop-blur-sm border border-border/50">
        <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Manage Events</h1>
        <p className="text-muted-foreground">Review, approve, modify, and publish flood events submitted by users.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "All Events", count: statusCounts.all, status: "all" },
          { label: "Pending", count: statusCounts.pending, status: "pending" },
          { label: "Approved", count: statusCounts.approved, status: "approved" },
          { label: "Published", count: statusCounts.published, status: "published" },
          { label: "Rejected", count: statusCounts.rejected, status: "rejected" },
        ].map((stat) => (
          <button
            key={stat.status}
            onClick={() => setFilterStatus(stat.status)}
            className={`p-4 rounded-xl border transition-all duration-200 ${
              filterStatus === stat.status
                ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                : "bg-card border-border hover:border-primary/50 hover:shadow-md"
            }`}
          >
            <div className="text-2xl font-bold">{stat.count}</div>
            <div className="text-sm opacity-90">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ID, location, country, or submitter email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Country
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Type/Cause
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Depth (m)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  People Affected
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Deaths
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Economic Loss
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEvents.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => {
                    setEventToView(event)
                    setShowDetailsModal(true)
                  }}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">#{event.id}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                    {event.submitted_by_email || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{event.country || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-foreground max-w-[200px] truncate">
                    {event.place_name || event.city_name || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                    {event.date_started ? new Date(event.date_started).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                    {event.type_cause?.replace("-", " ") || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{event.depth || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{event.people_affected || 0}</td>
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                    {(event.male_deaths || 0) + (event.female_deaths || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">${event.economic_loss || "0"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setEventToView(event)
                          setShowDetailsModal(true)
                        }}
                        className="p-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedEvent(event)
                          setShowEditModal(true)
                        }}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {event.status === "pending" && (
                        <button
                          onClick={() => handleStatusChange(event.id, "approved")}
                          className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                          title="Approve Event"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      {event.status === "approved" && (
                        <button
                          onClick={() => handleStatusChange(event.id, "published")}
                          className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                          title="Publish Event"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEventToDelete(event.id)
                          setShowDeleteConfirm(true)
                        }}
                        className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Edit Event #{selectedEvent.id}</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedEvent(null)
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Location Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Place Name</label>
                    <input
                      type="text"
                      value={selectedEvent.place_name || ""}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, place_name: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">City/Town</label>
                    <input
                      type="text"
                      value={selectedEvent.city_name || ""}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, city_name: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Country</label>
                    <input
                      type="text"
                      value={selectedEvent.country || ""}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, country: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Date Started</label>
                    <input
                      type="date"
                      value={selectedEvent.date_started || ""}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, date_started: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Event Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Depth (meters)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedEvent.depth || ""}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, depth: Number.parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">People Affected</label>
                    <input
                      type="number"
                      value={selectedEvent.people_affected || ""}
                      onChange={(e) =>
                        setSelectedEvent({ ...selectedEvent, people_affected: Number.parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                    <select
                      value={selectedEvent.status}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, status: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="published">Published</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={selectedEvent.description || ""}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-card border-t border-border p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedEvent(null)
                }}
                className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Confirm Deletion</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setEventToDelete(null)
                }}
                className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(eventToDelete)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      <EventDetailsModal
        event={eventToView}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setEventToView(null)
        }}
      />
    </div>
  )
}
