"use client"

// Wrapper component - CHỈ được import ở client-side
// File này KHÔNG import fabric trực tiếp, nên không bị bundle vào server-side

import dynamic from "next/dynamic"

// Dynamic import với ssr: false để đảm bảo chỉ load ở client
const CustomFabricCanvas = dynamic(
  () => import("./CustomFabricCanvas"),
  { 
    ssr: false, // QUAN TRỌNG: Không render ở server
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-pink-50 rounded-lg min-h-[650px]">
        <p className="text-gray-500">Đang tải canvas...</p>
      </div>
    )
  }
)

export default function CustomFabricCanvasWrapper(props: any) {
  // Component này chỉ render CustomFabricCanvas khi đã ở client-side
  return <CustomFabricCanvas {...props} />
}

