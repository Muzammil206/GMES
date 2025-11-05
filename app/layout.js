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
  authors: [{ name: "Ismail Muzammil" }],
  creator: "Ismail Muzammil",
  publisher: "Ismail Muzammil",
  themeColor: "#4ade80",
  manifest: "/manifest.json",
   icons: {
    icon: "/appi.ico",
    pyramid: "/appi.ico",
  },

  // 👇 Add these
  openGraph: {
    title: "MIFMASS Flood Database",
    description:
      "Regional flood database for West Africa - Monitor, record, and manage flood events",
    url: "https://gmes-mifmas.com/", // <-- replace with your real URL
    siteName: "MIFMASS Flood Database",
    images: [
      {
        url: "/bg.png", // <-- use your own image in /public folder
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
    description:
      "Regional flood database for West Africa - Monitor, record, and manage flood events",
    images: ["/bg.png"], // same as above
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
