"use client";
import Loader from "@/components/ui/Loader";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <Loader />
    </div>
  );
} 