"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowRight, Mail, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Navigation from "@/components/Navigation"
import { useSearchParams } from "next/navigation"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState("request") // "request" or "reset"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const checkToken = async () => {
      // Check query parameters
      const tokenHash = searchParams.get("token_hash")
      const type = searchParams.get("type")

      if (!tokenHash || type !== "recovery") {
        // If no token in query params, check hash fragment (for production)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const hashToken = hashParams.get("access_token")
          const hashType = hashParams.get("type")

          if (hashToken && hashType === "recovery") {
            setStep("reset")
            setIsValidToken(true)
            setIsCheckingToken(false)
            return
          }
        }
        
        // If we're on the reset step but no valid token, show error
        if (step === "reset") {
          setError("Invalid or missing reset token. Please request a new password reset.")
        }
        setIsCheckingToken(false)
        return
      }

      try {
        console.log("[v0] Verifying recovery token...")
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        })

        if (error) {
          console.error("[v0] Token verification error:", error)
          setError("Invalid or expired reset token. Please request a new password reset.")
          setStep("request")
        } else {
          console.log("[v0] Token verified successfully")
          setIsValidToken(true)
          setStep("reset")
        }
      } catch (error) {
        console.error("[v0] Token verification error:", error)
        setError("Error verifying reset token. Please try again.")
        setStep("request")
      } finally {
        setIsCheckingToken(false)
      }
    }

    checkToken()
  }, [searchParams])

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setMessage("")

    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password`,
      })

      if (resetError) {
        throw resetError
      }

      setSuccess(true)
      setMessage("Check your email for a password reset link. It may take a few minutes to arrive.")
      setEmail("")
    } catch (err) {
      console.error("[v0] Password reset request error:", err)
      setError(err.message || "Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setMessage("")

    if (!isValidToken) {
      setError("Invalid or expired reset token. Please request a new password reset.")
      return
    }

    if (!password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      // Update password using the validated session
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        throw updateError
      }

      console.log("[v0] Password updated successfully")

      setSuccess(true)
      setMessage("Password reset successfully!")
      setPassword("")
      setConfirmPassword("")

      // Redirect to login after 2 seconds
      setTimeout(() => {
        // Clear the hash to prevent re-triggering reset
        window.location.hash = ""
        router.push("/login")
      }, 2000)
    } catch (err) {
      console.error("[v0] Password reset error:", err)
      setError(err.message || "Failed to reset password. Please try again or request a new reset link.")
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
            {isCheckingToken ? (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Verifying reset token...</p>
              </div>
            ) : step === "request" ? (
              <>
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">Reset Password</h1>
                  <p className="text-muted-foreground text-lg">
                    Enter your email address and we'll send you a link to reset your password
                  </p>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 animate-in fade-in slide-in-from-top duration-300">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-800 font-semibold">Reset link sent!</p>
                        <p className="text-green-700 text-sm mt-1">{message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top duration-300">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-red-800 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleRequestReset} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                      Email Address
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-lg bg-linear-to-r from-blue-900/70 via-blue-800/60 to-teal-700/50 text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>

                {/* Back to Login */}
                <p className="text-center text-muted-foreground mt-8">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                    Back to login
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">Create New Password</h1>
                  <p className="text-muted-foreground text-lg">Enter your new password below to reset your account</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top duration-300">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-red-800 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 animate-in fade-in slide-in-from-top duration-300">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-800 font-semibold">Password reset successfully!</p>
                        <p className="text-green-700 text-sm mt-1">Redirecting you to login...</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleResetPassword} className="space-y-6">
                  {/* New Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                      New Password
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

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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

                  <p className="text-sm text-muted-foreground">Password must be at least 8 characters long.</p>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-lg bg-linear-to-r from-blue-900/70 via-blue-800/60 to-teal-700/50 text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>

                {/* Back to Login */}
                <p className="text-center text-muted-foreground mt-8">
                  <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                    Back to login
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
