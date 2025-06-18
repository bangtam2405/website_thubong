export interface SnapPoint {
  x: number;
  y: number;
  type: 'eyes' | 'ears' | 'nose' | 'mouth' | 'clothing' | 'accessory';
  side?: 'left' | 'right' | 'center';
}

export const TEDDY_SNAP_POINTS: SnapPoint[] = [
  { x: 200, y: 180, type: 'eyes', side: 'left' },
  { x: 280, y: 180, type: 'eyes', side: 'right' },
  { x: 150, y: 120, type: 'ears', side: 'left' },
  { x: 330, y: 120, type: 'ears', side: 'right' },
  { x: 240, y: 250, type: 'nose', side: 'center' },
  { x: 240, y: 320, type: 'mouth', side: 'center' },
  { x: 240, y: 400, type: 'clothing', side: 'center' },
  { x: 120, y: 480, type: 'accessory', side: 'left' },
  { x: 180, y: 500, type: 'accessory', side: 'left' },
  { x: 240, y: 520, type: 'accessory', side: 'center' },
  { x: 300, y: 500, type: 'accessory', side: 'right' },
  { x: 360, y: 480, type: 'accessory', side: 'right' },
]

// Giả sử plush toy bodyId === 'teddy' thì trả về snap points này
export function getSnapPointsForCurrentToy(bodyId: string): SnapPoint[] {
  // Có thể mở rộng cho nhiều loại plush toy khác
  if (bodyId === 'teddy' || !bodyId) return TEDDY_SNAP_POINTS
  // ... thêm các loại khác
  return TEDDY_SNAP_POINTS
} 