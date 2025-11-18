"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import "leaflet.markercluster"
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

  const color = colors[severity] || "#6b7280"
  
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="absolute inset-0 animate-ping opacity-75" style="
          background-color: ${color};
          width: 16px;
          height: 16px;
          border-radius: 50%;
          animation-duration: 2s;
          animation-iteration-count: infinite;
        "></div>
        <div style="
          background-color: ${color};
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        "></div>
      </div>
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

const getSeverityColor = (severity) => {
  const colors = {
    High: "#ef4444",
    Medium: "#eab308",
    Low: "#22c55e",
  }
  return colors[severity] || "#6b7280"
}

const calculateRadius = (event) => {
  const baseRadius = 500 // meters
  const depth = Number.parseFloat(event.depth) || 0
  const peopleAffected = Number.parseInt(event.people_affected) || 0
  
  let radius = baseRadius
  radius += depth * 200
  radius += Math.min(peopleAffected / 100, 2000)
  
  return Math.min(radius, 5000) // Max 5km radius
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

// Component for marker clustering
function MarkerClusters({ events, onEventSelect, activeLayers }) {
  const map = useMap()
  
  useEffect(() => {
    if (!activeLayers.clusters) return

    // Create marker cluster group
    const markerClusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount()
        let size = 'medium'
        let color = '#22c55e' // Default green for low severity
        
        // Calculate average severity in cluster
        const markers = cluster.getAllChildMarkers()
        let highCount = 0
        let mediumCount = 0
        
        markers.forEach(marker => {
          const severity = calculateSeverity(marker.options.eventData?.depth)
          if (severity === 'High') highCount++
          else if (severity === 'Medium') mediumCount++
        })
        
        if (highCount > 0) color = '#ef4444' // Red for high severity
        else if (mediumCount > 0) color = '#eab308' // Yellow for medium severity
        
        if (count > 50) size = 'large'
        else if (count > 10) size = 'medium'
        else size = 'small'
        
        const sizes = {
          large: 50,
          medium: 40,
          small: 30
        }
        
        return L.divIcon({
          html: `<div style="
            background-color: ${color};
            width: ${sizes[size]}px;
            height: ${sizes[size]}px;
            border-radius: 50%;
            border: 3px solid white;
            color: white;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            font-size: ${size === 'large' ? '14px' : size === 'medium' ? '12px' : '10px'};
          ">${count}</div>`,
          className: 'marker-cluster-custom',
          iconSize: L.point(sizes[size], sizes[size]),
        })
      }
    })

    // Add markers to cluster group
    events.forEach((event) => {
      const lat = Number.parseFloat(event.latitude)
      const lng = Number.parseFloat(event.longitude)

      if (isNaN(lat) || isNaN(lng)) return

      const severity = calculateSeverity(event.depth)
      
      const marker = L.marker([lat, lng], { 
        icon: createCustomIcon(severity),
        eventData: event 
      })
      
      marker.bindPopup(`
        <div class="p-3 min-w-[280px]">
          <h3 class="font-semibold text-base mb-3 text-foreground border-b pb-2">
            ${event.place_name || event.city_name || "Unknown Location"}
          </h3>
          <div class="space-y-2 text-sm">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-muted-foreground text-xs">ID</span>
                <p class="font-medium">${event.id}</p>
              </div>
              <div>
                <span class="text-muted-foreground text-xs">Severity</span>
                <p class="font-medium">${severity}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-muted-foreground text-xs">Date</span>
                <p class="font-medium">${new Date(event.date_started).toLocaleDateString()}</p>
              </div>
              <div>
                <span class="text-muted-foreground text-xs">Time</span>
                <p class="font-medium">${event.time_started}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-muted-foreground text-xs">Depth</span>
                <p class="font-medium">${event.depth}m</p>
              </div>
              <div>
                <span class="text-muted-foreground text-xs">Duration</span>
                <p class="font-medium">${event.duration}h</p>
              </div>
            </div>
            <div>
              <span class="text-muted-foreground text-xs">Type</span>
              <p class="font-medium capitalize">${(event.type_cause || '').replace("-", " ")}</p>
            </div>
            <div class="grid grid-cols-2 gap-2 pt-2 border-t">
              <div>
                <span class="text-muted-foreground text-xs">People Affected</span>
                <p class="font-medium text-blue-600">${event.people_affected || 0}</p>
              </div>
              ${(Number.parseInt(event.male_deaths || 0) + Number.parseInt(event.female_deaths || 0)) > 0 ? `
                <div>
                  <span class="text-muted-foreground text-xs">Deaths</span>
                  <p class="font-medium text-red-600">${Number.parseInt(event.male_deaths || 0) + Number.parseInt(event.female_deaths || 0)}</p>
                </div>
              ` : ''}
            </div>
            ${event.economic_loss ? `
              <div>
                <span class="text-muted-foreground text-xs">Economic Loss</span>
                <p class="font-medium">$${Number(event.economic_loss / 1500).toLocaleString()}</p>
              </div>
            ` : ''}
            <div class="grid grid-cols-2 gap-2 pt-2 border-t">
              <div>
                <span class="text-muted-foreground text-xs">Status</span>
                <p class="font-medium capitalize">${event.status || 'N/A'}</p>
              </div>
              <div>
                <span class="text-muted-foreground text-xs">Country</span>
                <p class="font-medium">${event.country || "N/A"}</p>
              </div>
            </div>
            <div class="pt-2 border-t">
              <span class="text-muted-foreground text-xs">Severity Indicator</span>
              <div class="flex items-center space-x-1 mt-1">
                ${[1, 2, 3].map((level) => `
                  <div
                    key="${level}"
                    class="h-2 flex-1 rounded-full ${level <= (severity === 'High' ? 3 : severity === 'Medium' ? 2 : 1) ? `bg-${severity === 'High' ? 'red' : severity === 'Medium' ? 'yellow' : 'green'}-500` : 'bg-gray-200'}"
                  ></div>
                `).join('')}
              </div>
            </div>
            ${event.description ? `
              <div class="pt-2 border-t">
                <span class="text-muted-foreground text-xs">Description</span>
                <p class="text-xs mt-1 text-muted-foreground">${event.description}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `)
      
      marker.on('click', () => {
        onEventSelect(event)
      })
      
      markerClusterGroup.addLayer(marker)
    })

    map.addLayer(markerClusterGroup)

    // Cleanup function
    return () => {
      map.removeLayer(markerClusterGroup)
    }
  }, [map, events, onEventSelect, activeLayers.clusters])

  return null
}

export default function FloodMapView({ events, selectedEvent, onEventSelect }) {
  const mapRef = useRef(null)
  const [selectedTileLayer, setSelectedTileLayer] = useState("street")
  const [showLayerSelector, setShowLayerSelector] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeLayers, setActiveLayers] = useState({
    clusters: true,
    circles: true,
  })

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

        {/* Flood Impact Areas */}
        {activeLayers.circles && events.map((event) => {
          const lat = Number.parseFloat(event.latitude)
          const lng = Number.parseFloat(event.longitude)
          
          if (isNaN(lat) || isNaN(lng)) return null

          const severity = calculateSeverity(event.depth)
          const radius = calculateRadius(event)
          
          return (
            <Circle
              key={`circle-${event.id}`}
              center={[lat, lng]}
              radius={radius}
              pathOptions={{
                fillColor: getSeverityColor(severity),
                color: getSeverityColor(severity),
                weight: 1,
                opacity: 0.3,
                fillOpacity: 0.1,
              }}
              eventHandlers={{
                click: () => onEventSelect(event),
              }}
            />
          )
        })}

        {/* Marker Clusters */}
        <MarkerClusters 
          events={events} 
          onEventSelect={onEventSelect}
          activeLayers={activeLayers}
        />

        <MapUpdater selectedEvent={selectedEvent} />
      </MapContainer>

      {/* Layer Controls */}
      <div className="absolute left-4 top-20 z-[1000] bg-card border border-border rounded-lg shadow-lg overflow-hidden">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Map Layers</h4>
        </div>
        <div className="p-2 space-y-1">
          {[
            { key: 'clusters', label: 'Cluster Markers' },
            { key: 'circles', label: 'Impact Areas' },
          ].map((layer) => (
            <label key={layer.key} className="flex items-center space-x-2 text-sm cursor-pointer px-2 py-1">
              <input
                type="checkbox"
                checked={activeLayers[layer.key]}
                onChange={(e) => setActiveLayers(prev => ({
                  ...prev,
                  [layer.key]: e.target.checked
                }))}
                className="rounded border-border"
              />
              <span>{layer.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tile Layer Selector */}
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

      {/* Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute right-4 bottom-4 z-[1000] bg-card border border-border p-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>

      {/* Zoom Controls */}
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