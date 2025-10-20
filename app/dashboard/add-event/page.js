"use client"

import { useState } from "react"
import { MapPin, Upload, X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import dynamic from "next/dynamic"

// Dynamically import map component to avoid SSR issues
const LocationMap = dynamic(() => import("@/components/location-map"), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />,
})

export default function AddEventPage() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  // Flood Event Information
  const [typeCause, setTypeCause] = useState("")
  const [otherCause, setOtherCause] = useState("")
  const [dateStarted, setDateStarted] = useState("")
  const [timeStarted, setTimeStarted] = useState("")
  const [duration, setDuration] = useState("")
  const [depth, setDepth] = useState("")
  const [extent, setExtent] = useState("")
  const [structureType, setStructureType] = useState("")
  const [description, setDescription] = useState("")
  const [floodImages, setFloodImages] = useState([null, null, null])

  // Flood Location Information
  const [placeName, setPlaceName] = useState("")
  const [longitude, setLongitude] = useState("")
  const [latitude, setLatitude] = useState("")
  const [areaName, setAreaName] = useState("")
  const [cityName, setCityName] = useState("")
  const [districtName, setDistrictName] = useState("")
  const [postcode, setPostcode] = useState("")
  const [province, setProvince] = useState("")

  // Flood Effect Information
  const [maleDeaths, setMaleDeaths] = useState("")
  const [femaleDeaths, setFemaleDeaths] = useState("")
  const [maleDisplaced, setMaleDisplaced] = useState("")
  const [femaleDisplaced, setFemaleDisplaced] = useState("")
  const [maleInjured, setMaleInjured] = useState("")
  const [femaleInjured, setFemaleInjured] = useState("")
  const [peopleAffected, setPeopleAffected] = useState("")
  const [economicLoss, setEconomicLoss] = useState("")
  const [residentialBuildings, setResidentialBuildings] = useState("")
  const [commercialBuildings, setCommercialBuildings] = useState("")
  const [otherInfrastructure, setOtherInfrastructure] = useState("")
  const [farmlandArea, setFarmlandArea] = useState("")

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setIsLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6))
        setLongitude(position.coords.longitude.toFixed(6))
        setUseCurrentLocation(true)
        setIsLoadingLocation(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Unable to retrieve your location")
        setIsLoadingLocation(false)
      },
    )
  }

  const handleImageUpload = (index, event) => {
    const file = event.target.files?.[0]
    if (file) {
      const newImages = [...floodImages]
      newImages[index] = file
      setFloodImages(newImages)
    }
  }

  const handleRemoveImage = (index) => {
    const newImages = [...floodImages]
    newImages[index] = null
    setFloodImages(newImages)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted")
  }

  return (
    <div className={`space-y-6 sm:space-y-8 animate-fadeInUp ${isMobile ? "max-w-full" : "max-w-[1600px] mx-auto"}`}>
      {/* Page Title */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 sm:p-6 rounded-xl backdrop-blur-sm border border-border/50">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-3 tracking-tight">Add Flood Event</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Record a new flood event with detailed information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Flood Event Information */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-6 shadow-lg">
          <h2 className="text-xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              1
            </span>
            Flood Event Information
          </h2>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Type Cause */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Type Cause</label>
              <select
                value={typeCause}
                onChange={(e) => setTypeCause(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="">Select cause</option>
                <option value="heavy-rain">Heavy Rain</option>
                <option value="river-overflow">River Overflow</option>
                <option value="dam-failure">Dam Failure</option>
                <option value="storm-surge">Storm Surge</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Others (specify) */}
            {typeCause === "other" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Others (specify)</label>
                <input
                  type="text"
                  value={otherCause}
                  onChange={(e) => setOtherCause(e.target.value)}
                  placeholder="Specify other cause"
                  className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            )}

            {/* Date Started */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Date Flood Started <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={dateStarted}
                onChange={(e) => setDateStarted(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Time Started */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Time Started</label>
              <input
                type="time"
                value={timeStarted}
                onChange={(e) => setTimeStarted(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Duration (hours) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 24"
                required
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Depth */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Depth (meters) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                placeholder="e.g., 2.5"
                required
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Extent */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Extent (km²) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={extent}
                onChange={(e) => setExtent(e.target.value)}
                placeholder="e.g., 15.5"
                required
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Type de structure */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Type of Structure <span className="text-destructive">*</span>
              </label>
              <select
                value={structureType}
                onChange={(e) => setStructureType(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="">Select structure type</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="agricultural">Agricultural</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          {/* Flood Scene Images */}
          <div className="mt-6 space-y-4">
            <label className="text-sm font-medium text-foreground">Flood Scene Images</label>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <label className="text-xs text-muted-foreground">Flood Scene {index + 1}</label>
                  {floodImages[index] ? (
                    <div className="relative border-2 border-dashed border-border/50 rounded-lg p-4 bg-background/50">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-sm text-foreground truncate">{floodImages[index].name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(floodImages[index].size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-lg p-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Choose a file</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of the flood event..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
          </div>
        </div>

        {/* Flood Location Information */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-6 shadow-lg">
          <h2 className="text-xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              2
            </span>
            Flood Location Information
          </h2>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Place Name */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <label className="text-sm font-medium text-foreground">
                Place Name of the Flood Plain <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="Enter the name of the flood plain"
                required
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Location Input Method */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-4 mb-4">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLoadingLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MapPin className="w-4 h-4" />
                  {isLoadingLocation ? "Getting Location..." : "Use Current Location"}
                </button>
                <span className="text-sm text-muted-foreground">or enter coordinates manually</span>
              </div>
            </div>

            {/* Longitude */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Longitude <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g., -1.234567"
                required
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Latitude */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Latitude <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g., 6.123456"
                required
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Map Display */}
            {latitude && longitude && (
              <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                <label className="text-sm font-medium text-foreground">Location Preview</label>
                <div className="h-64 rounded-lg overflow-hidden border border-border/50">
                  <LocationMap lat={Number.parseFloat(latitude)} lng={Number.parseFloat(longitude)} />
                </div>
              </div>
            )}

            {/* Area/Community */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Name of the Area/Community <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="Enter area or community name"
                required
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* City/Town */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Name of the City/Town <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Enter city or town name"
                required
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* District */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Name of the District <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={districtName}
                onChange={(e) => setDistrictName(e.target.value)}
                placeholder="Enter district name"
                required
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Postcode */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Postcode / Zipcode <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Enter postcode"
                required
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Province */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Province <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Enter province"
                required
                className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Flood Effect Information */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 sm:p-6 shadow-lg">
          <h2 className="text-xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              3
            </span>
            Flood Effect Information
          </h2>

          <div className="space-y-6">
            {/* Deaths */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Deaths</h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Number of Male Deaths</label>
                  <input
                    type="number"
                    min="0"
                    value={maleDeaths}
                    onChange={(e) => setMaleDeaths(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Number of Female Deaths <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={femaleDeaths}
                    onChange={(e) => setFemaleDeaths(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Displaced */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Displaced</h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Number of Males Displaced <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maleDisplaced}
                    onChange={(e) => setMaleDisplaced(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Number of Females Displaced <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={femaleDisplaced}
                    onChange={(e) => setFemaleDisplaced(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Injured */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Injured</h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Number of Males Injured <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maleInjured}
                    onChange={(e) => setMaleInjured(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Number of Females Injured <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={femaleInjured}
                    onChange={(e) => setFemaleInjured(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Other Impact Metrics */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Number of People Affected <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={peopleAffected}
                  onChange={(e) => setPeopleAffected(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Total Estimated Economic Loss (USD) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={economicLoss}
                  onChange={(e) => setEconomicLoss(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Number of Residential Buildings Affected <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={residentialBuildings}
                  onChange={(e) => setResidentialBuildings(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Number of Commercial Buildings Affected <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={commercialBuildings}
                  onChange={(e) => setCommercialBuildings(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Other Infrastructures Affected</label>
                <input
                  type="text"
                  value={otherInfrastructure}
                  onChange={(e) => setOtherInfrastructure(e.target.value)}
                  placeholder="e.g., Roads, Bridges"
                  className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Estimated Area of Farmland Inundated (acres) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={farmlandArea}
                  onChange={(e) => setFarmlandArea(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-3 py-2 text-sm border border-border/50 rounded-md bg-background/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
          <button
            type="button"
            className="px-6 py-3 border border-border/50 text-foreground rounded-md font-medium hover:bg-muted/50 transition-all"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            Submit Event
          </button>
        </div>
      </form>
    </div>
  )
}
