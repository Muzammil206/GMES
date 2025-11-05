import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import GoogleTranslate from "@/components/google-translate"; // 👈 new client component

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "MIFMASS Flood Database",
  description:
    "Regional flood database for West Africa - Monitor, record, and manage flood events",
  keywords: [
    "Flood Monitoring",
    "Event Management",
    "Disaster Response",
    "Geospatial Analysis",
    "West Africa Flood",
  ],
  authors: [{ name: "ismail muzammil" }],
  creator: "ismail muzammil",
  publisher: "ismail muzammil",
  themeColor: "#4ade80",
  manifest: "/manifest.json",
  icons: {
    icon: "/appsn2.ico",
    pyramid: "/appsn2.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {/* Google Translate Widget */}
        {/* <GoogleTranslate /> */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
