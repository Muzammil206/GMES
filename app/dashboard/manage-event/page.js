"use client"

import { useState } from "react"
import { Edit, Trash2, CheckCircle, Upload, X, Search } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function ManageEventsPage() {
  const [events, setEvents] = useState([
    {
      id: "FL-2024-001",
      date: "2024-03-15",
      location: "Buea, Cameroon",
      community: "Molyko",
      magnitude: "Severe",
      status: "Pending",
      submittedBy: "John Doe",
      submittedDate: "2024-03-15",
      depth: "2.5m",
      affected: 150,
    },
    {
      id: "FL-2024-002",
      date: "2024-03-10",
      location: "Lagos, Nigeria",
      community: "Lekki",
      magnitude: "Moderate",
      status: "Approved",
      submittedBy: "Jane Smith",
      submittedDate: "2024-03-10",
      depth: "1.2m",
      affected: 80,
    },
    {
      id: "FL-2024-003",
      date: "2024-03-08",
      location: "Accra, Ghana",
      community: "Tema",
      magnitude: "Minor",
      status: "Published",
      submittedBy: "Mike Johnson",
      submittedDate: "2024-03-08",
      depth: "0.8m",
      affected: 45,
    },
    {
      id: "FL-2024-004",
      date: "2024-03-01",
      location: "Douala, Cameroon",
      community: "Bonaberi",
      magnitude: "Severe",
      status: "Pending",
      submittedBy: "Sarah Williams",
      submittedDate: "2024-03-01",
      depth: "3.1m",
      affected: 200,
    },
    {
      id: "FL-2024-005",
      date: "2024-02-28",
      location: "Ibadan, Nigeria",
      community: "Bodija",
      magnitude: "Moderate",
      status: "Rejected",
      submittedBy: "David Brown",
      submittedDate: "2024-02-28",
      depth: "1.5m",
      affected: 60,
    },
  ])

  const [filterStatus, setFilterStatus] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Approved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Published":
        return "bg-green-100 text-green-800 border-green-200"
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesStatus = filterStatus === "All" || event.status === filterStatus
    const matchesSearch =
      event.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleStatusChange = (eventId, newStatus) => {
    setEvents(events.map((event) => (event.id === eventId ? { ...event, status: newStatus } : event)))
  }

  const handleDelete = (eventId) => {
    setEvents(events.filter((event) => event.id !== eventId))
    setShowDeleteConfirm(false)
    setEventToDelete(null)
  }

  const handleEdit = (event) => {
    setSelectedEvent({ ...event })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    setEvents(events.map((event) => (event.id === selectedEvent.id ? selectedEvent : event)))
    setShowEditModal(false)
    setSelectedEvent(null)
  }

  const statusCounts = {
    All: events.length,
    Pending: events.filter((e) => e.status === "Pending").length,
    Approved: events.filter((e) => e.status === "Approved").length,
    Published: events.filter((e) => e.status === "Published").length,
    Rejected: events.filter((e) => e.status === "Rejected").length,
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-xl backdrop-blur-sm border border-border/50">
        <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Manage Events</h1>
        <p className="text-muted-foreground">Review, approve, modify, and publish flood events submitted by users.</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {["All", "Pending", "Approved", "Published", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterStatus === status
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ID, location, or submitter..."
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Event ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Magnitude
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium text-foreground">{event.id}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{event.date}</td>
                  <td className="px-4 py-4 text-sm text-foreground">
                    <div>{event.location}</div>
                    <div className="text-xs text-muted-foreground">{event.community}</div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.magnitude === "Severe"
                          ? "bg-red-100 text-red-800"
                          : event.magnitude === "Moderate"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {event.magnitude}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{event.submittedBy}</td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                      </button>

                      {event.status === "Pending" && (
                        <button
                          onClick={() => handleStatusChange(event.id, "Approved")}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                          title="Approve Event"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                        </button>
                      )}

                      {event.status === "Approved" && (
                        <button
                          onClick={() => handleStatusChange(event.id, "Published")}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                          title="Publish Event"
                        >
                          <Upload className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEventToDelete(event.id)
                          setShowDeleteConfirm(true)
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
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
          <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Edit Event: {selectedEvent.id}</h2>
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

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Event ID</label>
                  <input
                    type="text"
                    value={selectedEvent.id}
                    disabled
                    className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedEvent.date}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                <input
                  type="text"
                  value={selectedEvent.location}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Community</label>
                <input
                  type="text"
                  value={selectedEvent.community}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, community: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Magnitude</label>
                  <select
                    value={selectedEvent.magnitude}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, magnitude: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Minor">Minor</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <select
                    value={selectedEvent.status}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, status: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Published">Published</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Depth</label>
                  <input
                    type="text"
                    value={selectedEvent.depth}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, depth: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">People Affected</label>
                  <input
                    type="number"
                    value={selectedEvent.affected}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, affected: Number.parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
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
    </div>
  )
}
