"use client"

import Link from "next/link"
import { Clock, Mail, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "../../lib/supabase/client"
import { useRouter } from "next/navigation"
import Navigation from "@/components/Navigation"

export default function PendingApprovalPage() {
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkStatus = async () => {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserEmail(user.email)

        // Check if user has been approved
        const { data: userData } = await supabase.from("users").select("status").eq("user_id", user.id).single()

        if (userData?.status === "approved") {
          router.push("/dashboard")
        }
      }
    }

    checkStatus()
  }, [router])

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
     
        <Navigation />
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-2xl">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-6">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Account Pending Approval</h1>

            {/* Description */}
            <div className="space-y-4 text-muted-foreground text-lg mb-8">
              <p>Thank you for registering with MIFMASS Public Database!</p>
              <p>
                Your account <span className="font-semibold text-foreground">{userEmail}</span> has been created
                successfully and is currently pending approval by an administrator.
              </p>
              <p>
                You will receive an email notification once your account has been approved and you can access the
                dashboard.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">What happens next?</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>An administrator will review your registration</li>
                    <li>You'll receive an email once your account is approved</li>
                    <li>After approval, you can log in and access all features</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-border text-foreground font-medium hover:bg-accent/10 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <button
                onClick={handleSignOut}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-teal-700/50  text-primary-foreground font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
