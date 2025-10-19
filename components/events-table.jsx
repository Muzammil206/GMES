"use client"

import { MoreVertical } from "lucide-react"

export default function EventsTable({ events, isMobile }) {
  if (isMobile) {
    // Mobile card view
    return (
      <div className="space-y-3">
        {events.map((event, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200"
            style={{
              animation: `fadeInUp 0.4s ease-out ${index * 50}ms both`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{event.id}</p>
                <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
              </div>
              <button className="p-1 hover:bg-primary-light rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-2 mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm text-foreground">{event.location}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Magnitude</p>
                  <p className="text-sm text-foreground">{event.magnitude}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${event.statusColor}`}>
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Desktop table view
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary-light border-b border-border">
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Event ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Location</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Magnitude</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr
                key={index}
                className="border-b border-border hover:bg-primary-lighter transition-colors duration-200"
                style={{
                  animation: `fadeInUp 0.4s ease-out ${index * 50}ms both`,
                }}
              >
                <td className="px-6 py-4 text-sm font-medium text-foreground">{event.id}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{event.date}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{event.location}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{event.magnitude}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.statusColor}`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="p-2 hover:bg-primary-light rounded-lg transition-colors inline-flex">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
