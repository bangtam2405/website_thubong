import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Pacifico } from 'next/font/google';
import "./globals.css";
import Providers from "./providers";
import AppLayoutClient from "@/components/AppLayoutClient";

const inter = Inter({ subsets: ["latin"] });
const pacifico = Pacifico({ subsets: ['latin'], weight: '400', display: 'swap' });

export const metadata: Metadata = {
  title: "Thú Bông Tùy Chỉnh - Tạo Thú Bông Theo Ý Bạn",
  description: "Tạo thú bông tùy chỉnh theo ý thích của bạn. Chọn màu sắc, kích thước và phụ kiện để tạo ra thú bông độc đáo của riêng bạn.",
  generator: "v0.dev",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.className} suppressHydrationWarning>
      <body>
        <Providers>
          <AppLayoutClient>{children}</AppLayoutClient>
        </Providers>
      </body>
    </html>
  );
}
