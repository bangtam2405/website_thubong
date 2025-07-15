"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function RouteChangeLoadingProvider() {
  const pathname = usePathname();
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) {
      setIsRouteChanging(true);
      const timeout = setTimeout(() => {
        setIsRouteChanging(false);
        setPrevPath(pathname);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [pathname, prevPath]);

  return isRouteChanging ? <LoadingOverlay /> : null;
} 