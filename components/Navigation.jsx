"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/logo.png" width={200} height={250} alt="logo" className="h-full w-full" />
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Menu open: "hidden", Menu closed: "block" */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Menu open: "block", Menu closed: "hidden" */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:gap-3">
            <Link href="/login" className="px-6 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors">
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-teal-700/50 text-white font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden mt-4`}>
          <div className="flex flex-col gap-2 pt-2 pb-3">
            <Link
              href="/login"
              className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="block px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-teal-700/50 hover:bg-blue-700 rounded-md shadow-md"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
