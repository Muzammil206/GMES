"use client"

import { useState } from "react"
import { Upload, Download, FileText, CheckCircle, AlertCircle, X } from "lucide-react"

export default function ImportDataPage() {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewData, setPreviewData] = useState([])
  const [errors, setErrors] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)

  // CSV template structure
  const csvTemplate = `event_id,type_cause,date_started,time_started,duration_hours,depth_meters,extent_km2,structure_type,description,place_name,longitude,latitude,area_community,city_town,district,postcode,province,country,male_deaths,female_deaths,male_displaced,female_displaced,male_injured,female_injured,people_affected,economic_loss_usd,residential_buildings,commercial_buildings,other_infrastructure,farmland_acres,status
FL001,Heavy Rainfall,2024-01-15,08:30,48,2.5,15.3,Residential,"Severe flooding in residential area",Downtown,8.4799,-11.7799,Central District,Freetown,Western Area,12345,Western Area Urban,Sierra Leone,2,1,150,180,10,8,500,250000,45,12,Road damage,120,Published
FL002,River Overflow,2024-02-20,14:00,72,3.2,25.8,Mixed,"River overflow affecting multiple communities",Riverside,-13.2317,8.4657,Riverside,Conakry,Conakry,54321,Conakry Region,Guinea,0,1,200,250,5,7,800,500000,60,20,Bridge collapse,200,Approved`

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "text/csv") {
      processFile(droppedFile)
    } else {
      setErrors(["Please upload a valid CSV file"])
    }
  }

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  const processFile = (file) => {
    setFile(file)
    setErrors([])
    setImportSuccess(false)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        setErrors(["CSV file is empty or invalid"])
        return
      }

      const headers = lines[0].split(",").map((h) => h.trim())
      const requiredHeaders = ["type_cause", "date_started", "longitude", "latitude", "country"]

      const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))
      if (missingHeaders.length > 0) {
        setErrors([`Missing required columns: ${missingHeaders.join(", ")}`])
        return
      }

      const data = []
      const validationErrors = []

      for (let i = 1; i < Math.min(lines.length, 11); i++) {
        const values = lines[i].split(",").map((v) => v.trim())
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })

        // Validate required fields
        if (!row.longitude || !row.latitude) {
          validationErrors.push(`Row ${i}: Missing coordinates`)
        }
        if (!row.country) {
          validationErrors.push(`Row ${i}: Missing country`)
        }

        data.push(row)
      }

      setPreviewData(data)
      setErrors(validationErrors)
    }

    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "flood_events_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    if (errors.length > 0) {
      return
    }

    setIsProcessing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsProcessing(false)
    setImportSuccess(true)

    // Reset after 3 seconds
    setTimeout(() => {
      setFile(null)
      setPreviewData([])
      setImportSuccess(false)
    }, 3000)
  }

  const clearFile = () => {
    setFile(null)
    setPreviewData([])
    setErrors([])
    setImportSuccess(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Import Flood Events</h1>
        <p className="text-muted-foreground mt-2">Upload CSV files to bulk import flood event data into the system</p>
      </div>

      {/* Instructions Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">CSV Format Requirements</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>File must be in CSV format with comma-separated values</li>
              <li>
                Required columns:{" "}
                <span className="font-mono text-xs">type_cause, date_started, longitude, latitude, country</span>
              </li>
              <li>Date format: YYYY-MM-DD (e.g., 2024-01-15)</li>
              <li>Coordinates must be valid decimal degrees</li>
              <li>Country must be a West African country</li>
            </ul>
            <button
              onClick={downloadTemplate}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </button>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4">Upload CSV File</h3>

        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">Drag and drop your CSV file here</p>
            <p className="text-sm text-muted-foreground mb-4">or</p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer font-medium">
              <Upload className="w-4 h-4" />
              Browse Files
              <input type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button onClick={clearFile} className="p-2 hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-destructive mb-2">Validation Errors</h4>
                    <ul className="text-sm text-destructive/90 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {importSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400">Import Successful!</h4>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      {previewData.length} flood events have been imported successfully.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Table */}
            {previewData.length > 0 && !importSuccess && (
              <div>
                <h4 className="font-semibold text-foreground mb-3">Data Preview (First 10 rows)</h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-foreground">Type/Cause</th>
                          <th className="px-4 py-3 text-left font-medium text-foreground">Date</th>
                          <th className="px-4 py-3 text-left font-medium text-foreground">Location</th>
                          <th className="px-4 py-3 text-left font-medium text-foreground">Coordinates</th>
                          <th className="px-4 py-3 text-left font-medium text-foreground">Country</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {previewData.map((row, index) => (
                          <tr key={index} className="hover:bg-muted/50">
                            <td className="px-4 py-3 text-foreground">{row.type_cause || "-"}</td>
                            <td className="px-4 py-3 text-muted-foreground">{row.date_started || "-"}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {row.place_name || row.city_town || "-"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                              {row.latitude && row.longitude ? `${row.latitude}, ${row.longitude}` : "-"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{row.country || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Import Button */}
            {previewData.length > 0 && !importSuccess && (
              <div className="flex justify-end gap-3">
                <button
                  onClick={clearFile}
                  className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={errors.length > 0 || isProcessing}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Import {previewData.length} Events
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">1,247</p>
              <p className="text-sm text-muted-foreground">Total Imports</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">1,198</p>
              <p className="text-sm text-muted-foreground">Successful</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">49</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
