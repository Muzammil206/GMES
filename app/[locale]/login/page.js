"use client"

import { Link } from "@/i18n/routing"
import { useState } from "react"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "@/i18n/routing"
import Navigation from "@/components/Navigation"
import { useTranslations } from "next-intl"

export default function LoginPage() {
  const t = useTranslations("auth")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError(t("fillAllFields"))
      return
    }

    setIsLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()

      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error("Login failed")
      }

      // Check user approval status
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("status, role")
        .eq("user_id", authData.user.id)
        .single()

      if (userError) {
        throw userError
      }

      // Check if user is approved
      if (userData.status !== "approved") {
        // Sign out the user since they're not approved
        await supabase.auth.signOut()
        router.push("/pending-approval")
        return
      }

      // Redirect to dashboard if approved
      router.push("/dashboard")
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError(err.message || t("loginError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">{t("welcomeBack")}</h1>
              <p className="text-muted-foreground text-lg">{t("welcomeMessage")}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top duration-300">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                  {t("emailAddress")}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                  {t("password")}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border" />
                  <span className="text-muted-foreground hover:text-foreground transition-colors">{t("remember")}</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {t("forgotPassword")}
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-teal-700/50 text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? t("loggingIn") : t("logIn")}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-muted-foreground mt-8">
              {t("noAccount")}{" "}
              <Link href="/signup" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                {t("signUpHere")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
