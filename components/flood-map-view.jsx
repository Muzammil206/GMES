"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Layers, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

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

const TILE_LAYERS = {
  street: {
    name: "Street Map",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
  terrain: {
    name: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  dark: {
    name: "Dark Mode",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  light: {
    name: "Light Mode",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
}

// Component to handle map updates when selected event changes
function MapUpdater({ selectedEvent }) {
  const map = useMap()

  useEffect(() => {
    if (selectedEvent) {
      const lat = Number.parseFloat(selectedEvent.latitude)
      const lng = Number.parseFloat(selectedEvent.longitude)

      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 12, {
          duration: 1.5,
        })
      }
    }
  }, [selectedEvent, map])

  return null
}

export default function FloodMapView({ events, selectedEvent, onEventSelect }) {
  const mapRef = useRef(null)
  const [selectedTileLayer, setSelectedTileLayer] = useState("street")
  const [showLayerSelector, setShowLayerSelector] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Center of West Africa
  const defaultCenter = [9.0, -2.0]
  const defaultZoom = 5

  const toggleFullscreen = () => {
    const mapElement = mapRef.current?.getContainer()
    if (!document.fullscreenElement) {
      mapElement?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
        className="z-0"
        zoomControl={false}
      >
        <TileLayer attribution={TILE_LAYERS[selectedTileLayer].attribution} url={TILE_LAYERS[selectedTileLayer].url} />

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
              <Popup className="custom-popup">
                <div className="p-3 min-w-[280px]">
                  <h3 className="font-semibold text-base mb-3 text-foreground border-b pb-2">
                    {event.place_name || event.city_name || "Unknown Location"}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground text-xs">ID</span>
                        <p className="font-medium">{event.id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Severity</span>
                        <p className="font-medium">{severity}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground text-xs">Date</span>
                        <p className="font-medium">{new Date(event.date_started).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Time</span>
                        <p className="font-medium">{event.time_started}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground text-xs">Depth</span>
                        <p className="font-medium">{event.depth}m</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Duration</span>
                        <p className="font-medium">{event.duration}h</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Type</span>
                      <p className="font-medium capitalize">{event.type_cause?.replace("-", " ")}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <div>
                        <span className="text-muted-foreground text-xs">People Affected</span>
                        <p className="font-medium text-blue-600">{event.people_affected || 0}</p>
                      </div>
                      {totalDeaths > 0 && (
                        <div>
                          <span className="text-muted-foreground text-xs">Deaths</span>
                          <p className="font-medium text-red-600">{totalDeaths}</p>
                        </div>
                      )}
                    </div>
                    {event.economic_loss && (
                      <div>
                        <span className="text-muted-foreground text-xs">Economic Loss</span>
                        <p className="font-medium">${Number(event.economic_loss / 1500).toLocaleString()}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <div>
                        <span className="text-muted-foreground text-xs">Status</span>
                        <p className="font-medium capitalize">{event.status}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Country</span>
                        <p className="font-medium">{event.country || "N/A"}</p>
                      </div>
                    </div>
                    {event.description && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground text-xs">Description</span>
                        <p className="text-xs mt-1 text-muted-foreground">{event.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        <MapUpdater selectedEvent={selectedEvent} />
      </MapContainer>

      <div className="absolute left-4 bottom-4 z-[1000]">
        <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLayerSelector(!showLayerSelector)}
            className="w-full justify-start gap-2 rounded-none hover:bg-accent"
          >
            <Layers className="w-4 h-4" />
            <span className="text-sm">{TILE_LAYERS[selectedTileLayer].name}</span>
          </Button>

          {showLayerSelector && (
            <div className="border-t border-border">
              {Object.entries(TILE_LAYERS).map(([key, layer]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedTileLayer(key)
                    setShowLayerSelector(false)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors ${
                    selectedTileLayer === key ? "bg-accent font-medium" : ""
                  }`}
                >
                  {layer.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={toggleFullscreen}
        className="absolute right-4 bottom-4 z-[1000] bg-card border border-border p-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>

      <div className="absolute right-4 top-20 z-[1000] bg-card border border-border rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() + 1)}
          className="block w-10 h-10 hover:bg-accent transition-colors border-b border-border"
          title="Zoom In"
        >
          <span className="text-xl font-bold">+</span>
        </button>
        <button
          onClick={() => mapRef.current?.setZoom(mapRef.current.getZoom() - 1)}
          className="block w-10 h-10 hover:bg-accent transition-colors"
          title="Zoom Out"
        >
          <span className="text-xl font-bold">−</span>
        </button>
      </div>
    </div>
  )
}
