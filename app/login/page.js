"use client"
import Navigation from "../../components/Navigation"
import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        setSuccess(true)
        setEmail("")
        setPassword("")
      } else {
        setError("Please fill in all fields")
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
        <Navigation />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Welcome Back
              </h1>
              <p className="text-lg text-gray-600 max-w-sm mx-auto">
                Access the Mifmass public database to manage flood events and explore critical data
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 animate-in fade-in slide-in-from-top duration-300">
                <p className="text-green-800 font-medium">Login successful! Redirecting...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top duration-300">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
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
                  <span className="text-muted-foreground hover:text-foreground transition-colors">Remember me</span>
                </label>
                <Link href="#" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-teal-700/50 text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? "Logging in..." : "Log In"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link 
                  href="/signup" 
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                >
                  Sign up here
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
