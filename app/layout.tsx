import type React from "react"
import type { Viewport } from "next"
import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "MIFMASS Flood Database",
  description: "Regional flood database for West Africa - Monitor, record, and manage flood events",
  keywords: ["Flood Monitoring", "Event Management", "Disaster Response", "Geospatial Analysis", "West Africa Flood"],
  authors: [{ name: "Ismail Muzammil" }],
  creator: "Ismail Muzammil",
  publisher: "Ismail Muzammil",
  manifest: "/manifest.json",
  icons: {
    icon: "/appi.ico",
    pyramid: "/appi.ico",
  },
  openGraph: {
    title: "MIFMASS Flood Database",
    description: "Regional flood database for West Africa - Monitor, record, and manage flood events",
    url: "https://gmes-mifmas.com/",
    siteName: "MIFMASS Flood Database",
    images: [
      {
        url: "/bg.png",
        width: 1200,
        height: 630,
        alt: "MIFMASS Flood Database Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MIFMASS Flood Database",
    description: "Regional flood database for West Africa - Monitor, record, and manage flood events",
    images: ["/bg.png"],
  },
}

export const viewport: Viewport = {
  themeColor: "#4ade80",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  )
}
