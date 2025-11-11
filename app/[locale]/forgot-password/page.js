"use client"

import { Link } from "@/i18n/routing"
import { useState, useEffect } from "react"
import { ArrowRight, Mail, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/routing"
import Navigation from "@/components/Navigation"
import { useSearchParams } from "next/navigation"

export default function ForgotPasswordPage() {
  const t = useTranslations("auth")
  const [step, setStep] = useState("request")
  const [isCheckingToken, setIsCheckingToken] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    // ... logic to handle request reset ...
    setIsLoading(false)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    // ... logic to handle reset password ...
    setIsLoading(false)
  }

  useEffect(() => {
    const token = searchParams.get("token")
    if (token) {
      setIsCheckingToken(true)
      // ... logic to check token ...
      setIsCheckingToken(false)
    }
  }, [searchParams])

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
                <p className="mt-4 text-muted-foreground">{t("verifyingToken")}</p>
              </div>
            ) : step === "request" ? (
              <>
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">{t("resetPassword")}</h1>
                  <p className="text-muted-foreground text-lg">{t("enterEmail")}</p>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 animate-in fade-in slide-in-from-top duration-300">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-800 font-semibold">{t("resetEmailSent")}</p>
                        <p className="text-green-700 text-sm mt-1">{t("resetEmailMessage")}</p>
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
                      {t("emailAddress")}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("placeholder.email")}
                      className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-lg bg-linear-to-r from-blue-900/70 via-blue-800/60 to-teal-700/50 text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? t("sendingEmail") : t("sendResetLink")}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>

                {/* Back to Login */}
                <p className="text-center text-muted-foreground mt-8">
                  {t("rememberPassword")}{" "}
                  <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                    {t("backToLogin")}
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
                  <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">{t("newPassword")}</h1>
                  <p className="text-muted-foreground text-lg">{t("createNewPassword")}</p>
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
                        <p className="text-green-800 font-semibold">{t("passwordUpdated")}</p>
                        <p className="text-green-700 text-sm mt-1">{t("passwordUpdatingMessage")}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleResetPassword} className="space-y-6">
                  {/* New Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                      {t("newPassword")}
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("placeholder.password")}
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
                      {t("confirmNewPassword")}
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t("placeholder.password")}
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

                  <p className="text-sm text-muted-foreground">{t("passwordTooShort")}</p>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-lg bg-linear-to-r from-blue-900/70 via-blue-800/60 to-teal-700/50 text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? t("resetting") : t("resetPassword")}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>

                {/* Back to Login */}
                <p className="text-center text-muted-foreground mt-8">
                  <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                    {t("backToLogin")}
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
