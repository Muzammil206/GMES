"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { ArrowRight, Facebook, Twitter, Linkedin } from "lucide-react"
import Image from "next/image"

import Navigation from "@/components/Navigation"

export default function LandingPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="relative h-90 sm:h-[400px] md:h-[500px] overflow-hidden video-background">
        <Image
          src="/bg2.jpg"
          alt="Background"
          fill
          style={{ objectFit: "cover", filter: "brightness(0.5) contrast(1.4)" }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-teal-700/50" />

        <div className="relative h-full flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white text-balance leading-tight mb-6 animate-fade-in-up">
            {t("home.title")}
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-teal-200 text-balance animate-fade-in-up animate-stagger-1">
            {t("home.subtitle")}
          </h2>
          <p className="text-lg sm:text-xl text-gray-100 mt-6 max-w-2xl leading-relaxed animate-fade-in-up animate-stagger-2">
            {t("home.description")}
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Register Column */}
            <div
              className="text-center p-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fade-in-up animate-stagger-1"
              style={{
                background: "linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(20, 184, 184, 0.05) 100%)",
              }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t("home.register.title")}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{t("home.register.description")}</p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors"
              >
                {t("home.register.button")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Log In Column */}
            <div
              className="text-center p-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fade-in-up animate-stagger-2"
              style={{
                background: "linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(20, 184, 184, 0.05) 100%)",
              }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t("home.login.title")}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{t("home.login.description")}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors"
              >
                {t("home.login.button")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Search for Data Column */}
            <div
              className="text-center p-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fade-in-up animate-stagger-3"
              style={{
                background: "linear-gradient(135deg, rgba(30, 58, 138, 0.05) 0%, rgba(20, 184, 184, 0.05) 100%)",
              }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t("home.search.title")}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{t("home.search.description")}</p>
              <Link
                href="/dashboard/map"
                className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors"
              >
                {t("home.search.button")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-balance animate-fade-in-up">
            {t("home.about.title")}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8 animate-fade-in-up animate-stagger-1">
            {t("home.about.description")}
          </p>
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors animate-fade-in-up animate-stagger-2"
          >
            {t("home.about.link")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-8">
              <Link href="#" className="text-gray-700 font-medium hover:text-gray-900 transition-colors">
                {t("footer.resources")}
              </Link>
              <Link href="#" className="text-gray-700 font-medium hover:text-gray-900 transition-colors">
                {t("footer.legal")}
              </Link>
              <Link href="#" className="text-gray-700 font-medium hover:text-gray-900 transition-colors">
                {t("footer.contact")}
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
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
