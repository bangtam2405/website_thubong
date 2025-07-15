import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { CartProvider } from "@/contexts/CartContext"
import { GoogleOAuthProvider } from '@react-oauth/google'
import { SessionProvider } from "next-auth/react"
import Providers from "./providers"
import RouteChangeLoadingProvider from "@/components/RouteChangeLoadingProvider";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Thú Bông Tùy Chỉnh - Tạo Thú Bông Theo Ý Bạn",
  description: "Tạo thú bông tùy chỉnh theo ý thích của bạn. Chọn màu sắc, kích thước và phụ kiện để tạo ra thú bông độc đáo của riêng bạn.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={inter.className} suppressHydrationWarning>
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <RouteChangeLoadingProvider />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
