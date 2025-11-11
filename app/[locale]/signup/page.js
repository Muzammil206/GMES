"use client"
import Navigation from "@/components/Navigation"
import { Link } from "@/i18n/routing"
import { useState } from "react"
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useTranslations } from "next-intl"

export default function SignupPage() {
  const t = useTranslations("auth")
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    country: "",
    phoneNumber: "",
    organization: "",
    designation: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const titles = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Eng.", "Ir."]

  const countries = [
    "Benin",
    "Burkina Faso",
    "Côte d'Ivoire",
    "Ghana",
    "Guinea",
    "Guinea-Bissau",
    "Liberia",
    "Mali",
    "Niger",
    "Nigeria",
    "Senegal",
    "Sierra Leone",
    "Togo",
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (
      !formData.title ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.country ||
      !formData.phoneNumber ||
      !formData.organization ||
      !formData.designation ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError(t("fillAllFields"))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("passwordMismatch"))
      return
    }

    if (formData.password.length < 8) {
      setError(t("passwordTooShort"))
      return
    }

    setIsLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error("Failed to create user account")
      }

      // Insert user data into public.users table
      const { error: insertError } = await supabase.from("users").insert({
        user_id: authData.user.id,
        firstname: formData.firstName,
        lastname: formData.lastName,
        title: formData.title,
        contact_phone: formData.phoneNumber,
        email: formData.email,
        organization: formData.organization,
        designation: formData.designation,
        country: formData.country,
        status: "pending",
        role: "user",
      })

      if (insertError) {
        // If user data insert fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id)
        throw insertError
      }

      setSuccess(true)
      setFormData({
        title: "",
        firstName: "",
        lastName: "",
        country: "",
        phoneNumber: "",
        organization: "",
        designation: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
    } catch (err) {
      console.error("[v0] Signup error:", err)
      setError(err.message || t("fillAllFields"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-3xl">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">{t("createAccount")}</h1>
              <p className="text-muted-foreground text-lg">{t("createAccountMessage")}</p>
              <p className="text-muted-foreground text-sm mt-4">
                {t("requiredFields")} <span className="text-red-600">*</span> {t("areRequired")}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 animate-in fade-in slide-in-from-top duration-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-semibold">{t("signupSuccess")}</p>
                    <p className="text-green-700 text-sm mt-1">{t("signupMessage")}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top duration-300">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-semibold text-foreground">
                    {t("titleOfPerson")} <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  >
                    <option value="">{t("selectOption")}</option>
                    {titles.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="country" className="block text-sm font-semibold text-foreground">
                    {t("countryOfPerson")} <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  >
                    <option value="">{t("selectOption")}</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-semibold text-foreground">
                    {t("firstName")} <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder={t("placeholder.name")}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-semibold text-foreground">
                    {t("lastName")} <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder={t("placeholder.lastName")}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-foreground">
                    {t("phoneNumber")} <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder={t("placeholder.phone")}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="organization" className="block text-sm font-semibold text-foreground">
                    {t("organization")} <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder={t("placeholder.organization")}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="designation" className="block text-sm font-semibold text-foreground">
                    {t("designation")} <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="designation"
                    name="designation"
                    type="text"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder={t("placeholder.designation")}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                    {t("emailAddress")} <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("placeholder.email")}
                    className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                    {t("password")} <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground">
                    {t("confirmPassword")} <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{t("passwordMustBe8")}</p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-teal-700/50 text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t("registering") : t("register")}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-muted-foreground mt-8">
              {t("haveAccount")}{" "}
              <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                {t("logInHere")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
