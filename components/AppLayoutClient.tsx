"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import RouteChangeLoadingProvider from "@/components/RouteChangeLoadingProvider";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  return isLoginPage ? (
    <main className="min-h-screen">{children}</main>
  ) : (
    <div className="flex flex-col min-h-screen">
      <Header />
      <RouteChangeLoadingProvider />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
} 