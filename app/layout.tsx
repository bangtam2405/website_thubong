import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { CartProvider } from "@/contexts/CartContext"

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
        <CartProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
          <Toaster richColors position="top-right" />
        </CartProvider>
      </body>
    </html>
  )
}
