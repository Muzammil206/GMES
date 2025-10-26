"use client"

import Link from "next/link"
import { ArrowRight, Facebook, Twitter, Linkedin } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"

import Navigation from '../components/Navigation'

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="relative h-90 sm:h-[400px] md:h-[500px] overflow-hidden video-background">
        <Image
            src="/bg2.jpg"
            alt="Background"
            fill
            style={{ objectFit: 'cover',
              filter: 'brightness(0.5) contrast(1.4)'
             }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-teal-700/50" />
        

        <div className="relative h-full flex flex-col items-center justify-center px-4 text-center">
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white text-balance leading-tight mb-6 ${
              isLoaded ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            GMES & AFRICA
          </h1>
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl font-semibold text-teal-200 text-balance ${
              isLoaded ? "animate-fade-in-up animate-stagger-1" : "opacity-0"
            }`}
          >
            Flood Event Database
          </h2>
          <p
            className={`text-lg sm:text-xl text-gray-100 mt-6 max-w-2xl leading-relaxed ${
              isLoaded ? "animate-fade-in-up animate-stagger-2" : "opacity-0"
            }`}
          >
            Monitor, manage, and respond to flood events across Africa with real-time data and advanced analytics.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Register Column */}
            <div
              className={`text-center p-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                isLoaded ? "animate-fade-in-up animate-stagger-1" : "opacity-0"
              }`}
              style={{
                background: "linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(20, 184, 184, 0.05) 100%)",
              }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Register</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Join our platform to contribute data and access advanced features.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors"
              >
                Create an account <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Log In Column */}
            <div
              className={`text-center p-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                isLoaded ? "animate-fade-in-up animate-stagger-2" : "opacity-0"
              }`}
              style={{
                background: "linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(20, 184, 184, 0.05) 100%)",
              }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Log In</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Already have an account? Log in to manage your events and data.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors"
              >
                Register an event <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Search for Data Column */}
            <div
              className={`text-center p-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                isLoaded ? "animate-fade-in-up animate-stagger-3" : "opacity-0"
              }`}
              style={{
                background: "linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(20, 184, 184, 0.05) 100%)",
              }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Search for Data</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Explore the comprehensive MIFMASS Flood Event Database.
              </p>
              <Link
                href="/dashboard/map"
                className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors"
              >
                Access MIFMASS Flood Database <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-balance ${
              isLoaded ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            About MIFMASS Flood Database
          </h2>
          <p
            className={`text-lg text-gray-600 leading-relaxed mb-8 ${
              isLoaded ? "animate-fade-in-up animate-stagger-1" : "opacity-0"
            }`}
          >
            The MIFMASS Flood Event Database provides critical information and resources for flood monitoring and
            management in Africa. Our mission is to support informed decision-making and enhance resilience against
            flood impacts.
          </p>
          <Link
            href="#"
            className={`inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors ${
              isLoaded ? "animate-fade-in-up animate-stagger-2" : "opacity-0"
            }`}
          >
            More information on data, methodology, and legal aspects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-8">
              <Link href="#" className="text-gray-700 font-medium hover:text-gray-900 transition-colors">
                Resources
              </Link>
              <Link href="#" className="text-gray-700 font-medium hover:text-gray-900 transition-colors">
                Legal
              </Link>
              <Link href="#" className="text-gray-700 font-medium hover:text-gray-900 transition-colors">
                Contact
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>© Copyright Mifmass. All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
