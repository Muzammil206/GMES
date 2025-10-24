"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Custom marker icons based on severity
const createCustomIcon = (severity) => {
  const colors = {
    High: "#ef4444",
    Medium: "#eab308",
    Low: "#22c55e",
  }

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${colors[severity] || "#6b7280"};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

const calculateSeverity = (depth) => {
  const depthNum = Number.parseFloat(depth)
  if (depthNum >= 2) return "High"
  if (depthNum >= 1) return "Medium"
  return "Low"
}

// Component to handle map updates when selected event changes
function MapUpdater({ selectedEvent }) {
  const map = useMap()

  useEffect(() => {
    if (selectedEvent) {
      map.flyTo([selectedEvent.lat, selectedEvent.lng], 10, {
        duration: 1.5,
      })
    }
  }, [selectedEvent, map])

  return null
}

export default function FloodMapView({ events, selectedEvent, onEventSelect }) {
  const mapRef = useRef(null)

  // Center of West Africa
  const defaultCenter = [9.0, -2.0]
  const defaultZoom = 5

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: "100%", width: "100%" }}
      ref={mapRef}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {events.map((event) => {
        const lat = Number.parseFloat(event.latitude)
        const lng = Number.parseFloat(event.longitude)

        // Skip events without valid coordinates
        if (isNaN(lat) || isNaN(lng)) return null

        const severity = calculateSeverity(event.depth)
        const totalDeaths = Number.parseInt(event.male_deaths || 0) + Number.parseInt(event.female_deaths || 0)

        return (
          <Marker
            key={event.id}
            position={[lat, lng]}
            icon={createCustomIcon(severity)}
            eventHandlers={{
              click: () => onEventSelect(event),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[250px]">
                <h3 className="font-semibold text-sm mb-2">
                  {event.place_name || event.city_name || "Unknown Location"}
                </h3>
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="font-medium">ID:</span> {event.id}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span> {new Date(event.date_started).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span> {event.time_started}
                  </p>
                  <p>
                    <span className="font-medium">Severity:</span> {severity}
                  </p>
                  <p>
                    <span className="font-medium">Depth:</span> {event.depth}m
                  </p>
                  <p>
                    <span className="font-medium">Extent:</span> {event.extent}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span> {event.duration} hours
                  </p>
                  <p>
                    <span className="font-medium">Type:</span> {event.type_cause?.replace("-", " ")}
                  </p>
                  <p>
                    <span className="font-medium">People Affected:</span> {event.people_affected || 0}
                  </p>
                  {totalDeaths > 0 && (
                    <p className="text-red-600 font-medium">
                      <span className="font-medium">Deaths:</span> {totalDeaths}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Economic Loss:</span> ${event.economic_loss || 0}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> {event.status}
                  </p>
                  <p>
                    <span className="font-medium">Country:</span> {event.country || "N/A"}
                  </p>
                  {event.description && <p className="mt-2 text-muted-foreground border-t pt-2">{event.description}</p>}
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}

      <MapUpdater selectedEvent={selectedEvent} />
    </MapContainer>
  )
}
