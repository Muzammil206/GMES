"use client"

import { useState } from "react"
import { MapPin, Upload, X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import dynamic from "next/dynamic"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { PwaInstallBanner } from "@/components/download"

// Dynamically import map component to avoid SSR issues
const LocationMap = dynamic(() => import("@/components/location-map"), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />,
})

export default function AddEventPage() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()
  const t = useTranslations("events")

  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  const [country, setCountry] = useState("")

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

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      )
      const data = await response.json()

      console.log("[v0] Reverse geocoding result:", data)

      if (data.address) {
        const addr = data.address

        // Populate location fields from geocoding result
        setPlaceName(data.display_name || "")
        setAreaName(addr.suburb || addr.neighbourhood || addr.hamlet || "")
        setCityName(addr.city || addr.town || addr.village || "")
        setDistrictName(addr.county || addr.state_district || "")
        setPostcode(addr.postcode || "")
        setProvince(addr.state || addr.region || "")
        setCountry(addr.country || "")

        toast.success(t("locationPopulated"))
      }
    } catch (error) {
      console.error("[v0] Reverse geocoding error:", error)
      toast.error(t("locationError"))
    }
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t("geolocationNotSupported"))
      return
    }

    setIsLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6)
        const lng = position.coords.longitude.toFixed(6)

        setLatitude(lat)
        setLongitude(lng)
        setUseCurrentLocation(true)

        // Call reverse geocoding to populate location fields
        await reverseGeocode(lat, lng)

        setIsLoadingLocation(false)
      },
      (error) => {
        console.error("[v0] Error getting location:", error)
        toast.error(t("geolocationError"))
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

  const uploadImageToBlob = async (file) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("[v0] Image upload error:", error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createBrowserClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error(t("mustBeLoggedIn"))
        router.push("/login")
        return
      }

      // Upload images to Vercel Blob
      const imageUrls = await Promise.all(
        floodImages.map(async (image) => {
          if (image) {
            return await uploadImageToBlob(image)
          }
          return null
        }),
      )

      // Prepare event data
      const eventData = {
        user_id: user.id,
        submitted_by_email: user.email,
        status: "pending",

        // Flood Event Information
        type_cause: typeCause,
        other_cause: otherCause,
        date_started: dateStarted,
        time_started: timeStarted,
        duration: Number.parseFloat(duration) || 0,
        depth: Number.parseFloat(depth) || 0,
        extent: Number.parseFloat(extent) || 0,
        structure_type: structureType,
        description: description,
        flood_image_1: imageUrls[0],
        flood_image_2: imageUrls[1],
        flood_image_3: imageUrls[2],

        // Flood Location Information
        place_name: placeName,
        longitude: Number.parseFloat(longitude),
        latitude: Number.parseFloat(latitude),
        area_name: areaName,
        city_name: cityName,
        district_name: districtName,
        postcode: postcode,
        province: province,
        country: country,

        // Flood Effect Information
        male_deaths: Number.parseInt(maleDeaths) || 0,
        female_deaths: Number.parseInt(femaleDeaths) || 0,
        male_displaced: Number.parseInt(maleDisplaced) || 0,
        female_displaced: Number.parseInt(femaleDisplaced) || 0,
        male_injured: Number.parseInt(maleInjured) || 0,
        female_injured: Number.parseInt(femaleInjured) || 0,
        people_affected: Number.parseInt(peopleAffected) || 0,
        economic_loss: Number.parseFloat(economicLoss) || 0,
        residential_buildings: Number.parseInt(residentialBuildings) || 0,
        commercial_buildings: Number.parseInt(commercialBuildings) || 0,
        other_infrastructure: otherInfrastructure,
        farmland_area: Number.parseFloat(farmlandArea) || 0,
      }

      console.log("[v0] Submitting event data:", eventData)

      // Insert into Supabase
      const { data, error } = await supabase.from("flood_events").insert([eventData]).select()

      if (error) {
        console.error("[v0] Supabase insert error:", error)
        throw error
      }

      console.log("[v0] Event created successfully:", data)

      toast.success(t("eventSubmitted"))

      // Reset form or redirect
      router.push("/dashboard")
    } catch (error) {
      console.error("[v0] Submit error:", error)
      toast.error(t("eventSubmitError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={`space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isMobile ? "max-w-full" : "max-w-[1600px] mx-auto"}`}
    >
      <PwaInstallBanner />

      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl border border-border/50 shadow-sm">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">{t("addFloodEvent")}</h1>
        <p className="text-muted-foreground">{t("recordFloodEvent")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-space-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              1
            </span>
            {t("floodEventInfo")}
          </h2>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Type Cause */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t("typeCause")}</label>
              <select
                value={typeCause}
                onChange={(e) => setTypeCause(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">{t("selectCause")}</option>
                <option value="heavy-rain">{t("heavyRain")}</option>
                <option value="river-overflow">{t("riverOverflow")}</option>
                <option value="dam-failure">{t("damFailure")}</option>
                <option value="storm-surge">{t("stormSurge")}</option>
                <option value="other">{t("other")}</option>
              </select>
            </div>

            {/* Others (specify) */}
            {typeCause === "other" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">{t("othersSpecify")}</label>
                <input
                  type="text"
                  value={otherCause}
                  onChange={(e) => setOtherCause(e.target.value)}
                  placeholder={t("specifyOtherCause")}
                  className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            )}

            {/* Date Started */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {t("dateFloodStarted")} <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={dateStarted}
                onChange={(e) => setDateStarted(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Time Started */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">{t("timeStarted")}</label>
              <input
                type="time"
                value={timeStarted}
                onChange={(e) => setTimeStarted(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {t("duration")} <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder={t("durationPlaceholder")}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Depth */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {t("depth")} <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                placeholder={t("depthPlaceholder")}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Extent */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {t("extent")} <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={extent}
                onChange={(e) => setExtent(e.target.value)}
                placeholder={t("extentPlaceholder")}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Type de structure */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {t("typeOfStructure")} <span className="text-destructive">*</span>
              </label>
              <select
                value={structureType}
                onChange={(e) => setStructureType(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">{t("selectStructureType")}</option>
                <option value="residential">{t("residential")}</option>
                <option value="commercial">{t("commercial")}</option>
                <option value="industrial">{t("industrial")}</option>
                <option value="agricultural">{t("agricultural")}</option>
                <option value="mixed">{t("mixed")}</option>
              </select>
            </div>
          </div>

          {/* Flood Scene Images */}
          <div className="mt-6 space-y-4">
            <label className="text-sm font-semibold text-foreground">{t("floodSceneImages")}</label>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <label className="text-xs text-muted-foreground font-medium">
                    {t("floodScene")} {index + 1}
                  </label>
                  {floodImages[index] ? (
                    <div className="relative border-2 border-border rounded-lg p-4 bg-muted/30">
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
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">{t("chooseFile")}</span>
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
            <label className="text-sm font-semibold text-foreground">{t("description")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("provideDescription")}
              rows={4}
              className="w-full px-4 py-3 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
        </div>

        {/* Flood Location Information */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              2
            </span>
            {t("floodLocationInfo")}
          </h2>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Place Name */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <label className="text-sm font-semibold text-foreground">
                {t("placeNameFloodPlain")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder={t("enterFloodPlainName")}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-4 mb-4">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLoadingLocation}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  <MapPin className="w-4 h-4" />
                  {isLoadingLocation ? t("gettingLocation") : t("useCurrentLocation")}
                </button>
                <span className="text-sm text-muted-foreground">{t("enterCoordinatesManually")}</span>
              </div>
            </div>

            {/* Longitude */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {t("longitude")} <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder={t("longitudePlaceholder")}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Latitude */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {t("latitude")} <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder={t("latitudePlaceholder")}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Map Display */}
            {latitude && longitude && (
              <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                <label className="text-sm font-semibold text-foreground">{t("locationPreview")}</label>
                <div className="h-64 rounded-lg overflow-hidden border-2 border-border shadow-sm">
                  <LocationMap lat={Number.parseFloat(latitude)} lng={Number.parseFloat(longitude)} />
                </div>
              </div>
            )}

            {/* Area/Community */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {t("areaName")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder={t("enterAreaName")}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* City/Town */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {t("cityName")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder={t("enterCityName")}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* District */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {t("districtName")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={districtName}
                onChange={(e) => setDistrictName(e.target.value)}
                placeholder={t("enterDistrictName")}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Postcode */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {t("postcode")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder={t("enterPostcode")}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Province */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {t("province")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder={t("enterProvince")}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                {t("country")} <span className="text-destructive">*</span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">{t("selectCountry")}</option>
                <option value="Benin">Benin</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Cape Verde">Cape Verde</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="Gambia">Gambia</option>
                <option value="Ghana">Ghana</option>
                <option value="Guinea">Guinea</option>
                <option value="Guinea-Bissau">Guinea-Bissau</option>
                <option value="Liberia">Liberia</option>
                <option value="Mali">Mali</option>
                <option value="Mauritania">Mauritania</option>
                <option value="Niger">Niger</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Senegal">Senegal</option>
                <option value="Sierra Leone">Sierra Leone</option>
                <option value="Togo">Togo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Flood Effect Information */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              3
            </span>
            {t("floodEffectInfo")}
          </h2>

          <div className="space-y-6">
            {/* Deaths */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{t("deaths")}</h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">{t("maleDeaths")}</label>
                  <input
                    type="number"
                    min="0"
                    value={maleDeaths}
                    onChange={(e) => setMaleDeaths(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    {t("femaleDeaths")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={femaleDeaths}
                    onChange={(e) => setFemaleDeaths(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Displaced */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{t("displaced")}</h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    {t("malesDisplaced")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maleDisplaced}
                    onChange={(e) => setMaleDisplaced(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    {t("femalesDisplaced")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={femaleDisplaced}
                    onChange={(e) => setFemaleDisplaced(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Injured */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{t("injured")}</h3>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    {t("malesInjured")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maleInjured}
                    onChange={(e) => setMaleInjured(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    {t("femalesInjured")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={femaleInjured}
                    onChange={(e) => setFemaleInjured(e.target.value)}
                    placeholder="0"
                    required
                    className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Other Impact Metrics */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  {t("peopleAffected")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={peopleAffected}
                  onChange={(e) => setPeopleAffected(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  {t("economicLoss")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={economicLoss}
                  onChange={(e) => setEconomicLoss(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  {t("residentialBuildings")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={residentialBuildings}
                  onChange={(e) => setResidentialBuildings(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  {t("commercialBuildings")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={commercialBuildings}
                  onChange={(e) => setCommercialBuildings(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">{t("otherInfrastructures")}</label>
                <input
                  type="text"
                  value={otherInfrastructure}
                  onChange={(e) => setOtherInfrastructure(e.target.value)}
                  placeholder={t("otherInfrastructuresPlaceholder")}
                  className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  {t("farmlandArea")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={farmlandArea}
                  onChange={(e) => setFarmlandArea(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-2.5 text-sm border-2 border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
          <button
            type="button"
            disabled={isSubmitting}
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {t("saveAsDraft")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t("submitting") : t("submitEvent")}
          </button>
        </div>
      </form>
    </div>
  )
}
