import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })



export const metadata = {
  title: " MIFMASS Flood Database ",
  description: "egional flood database for West Africa - Monitor, record, and manage flood events ",
  keywords: ["FLood Monitoring", "Event Management", "Disaster Response", "Geospatial Analysis", "west africa flood"],
  authors: [{ name: "ismail muzammil" }],
  creator: "ismail muzammil",
  publisher: "ismail muzammil",
  themeColor: "#4ade80",
  manifest: '/manifest.json',
  icons: {
    icon: "/appi.ico",
    pyramid: "/appi.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />  
      </body>
    </html>
  )
}
