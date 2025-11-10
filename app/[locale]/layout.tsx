import type React from "react"
import type { Metadata, Viewport } from "next"
import { getMessages } from "next-intl/server"
import { NextIntlClientProvider } from "next-intl"
import { Geist, Geist_Mono } from "next/font/google"
import "../globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL 

  return {
    title:
      locale === "fr"
        ? "GMES - Surveillance Mondiale pour l'Environnement et la Sécurité"
        : "GMES - Global Monitoring for Environment and Security",
    description:
      locale === "fr"
        ? "Base de données publique pour la surveillance environnementale et de sécurité"
        : "Public Database for Environmental and Security Monitoring",
    generator: "v0.app",
    metadataBase: new URL(baseUrl),
    icons: {
      icon: "/appi.ico",
    },
    manifest: "/manifest.json",
  }
}

export const viewport: Viewport = {
  themeColor: "#3b82f6",
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }]
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  let messages
  try {
    messages = await getMessages({ locale })
  } catch (error) {
    console.error(`[next-intl] Failed to load messages for locale: ${locale}`, error)
    // Fallback to English messages
    messages = await getMessages({ locale: "en" })
  }

  return (
    <div>
      <NextIntlClientProvider messages={messages} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </div>
  )
}
