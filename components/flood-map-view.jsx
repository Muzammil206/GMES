"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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

      {events.map((event) => (
        <Marker
          key={event.id}
          position={[event.lat, event.lng]}
          icon={createCustomIcon(event.severity)}
          eventHandlers={{
            click: () => onEventSelect(event),
          }}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-sm mb-2">{event.location}</h3>
              <div className="space-y-1 text-xs">
                <p>
                  <span className="font-medium">ID:</span> {event.id}
                </p>
                <p>
                  <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Severity:</span> {event.severity}
                </p>
                <p>
                  <span className="font-medium">Depth:</span> {event.depth}
                </p>
                <p>
                  <span className="font-medium">Affected:</span> {event.affected} people
                </p>
                <p>
                  <span className="font-medium">Status:</span> {event.status}
                </p>
                <p className="mt-2 text-muted-foreground">{event.description}</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      <MapUpdater selectedEvent={selectedEvent} />
    </MapContainer>
  )
}
