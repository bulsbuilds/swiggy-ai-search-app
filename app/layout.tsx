import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Swiggy AI Search — Find food in plain English",
  description:
    "Search for food using natural language like “something spicy under ₹300” or “healthy vegetarian dinner”. AI-powered food discovery across your favourite kitchens.",
  keywords: ["food search", "AI search", "Swiggy", "natural language", "food delivery"],
}

export const viewport: Viewport = {
  themeColor: "#f15700",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jakarta.variable} bg-background`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
