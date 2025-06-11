"use client"
import { useEffect, useRef } from "react"
import { fabric } from "fabric"

export default function TestFabric() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 500,
        height: 650,
        backgroundColor: "#fdf2f8"
      })
      fabric.Image.fromURL("/cute.png", (img: any) => {
        if (!img) return
        img.set({ left: 0, top: 0, scaleX: 1, scaleY: 1 })
        canvas.add(img)
      })
    }
  }, [])

  return (
    <div>
      <h2>Test Fabric.js</h2>
      <canvas ref={canvasRef} width={500} height={650} style={{ border: "2px solid red" }} />
    </div>
  )
}