import { Geist, Geist_Mono } from "next/font/google"
import { PwaPromptProvider } from "@/components/PwaPromptProvider"


const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "MIFMASS Flood Database",
  description: "Regional flood event database for Africa",
  
}

export default function RootLayout({ children }) {
  return (
        <PwaPromptProvider>
          {children}
         
        </PwaPromptProvider>
  
  )
}
