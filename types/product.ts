export type Product = {
  _id: string
  name: string
  description: string
  price: number
  image: string
  previewImage?: string
  type: "teddy" | "accessory" | "collection" | "new" | "custom"
  rating: number
  reviews: number
  sold: number
  stock: number
  featured: boolean
  customizeLink?: string // Link mẫu thiết kế
  specifications?: {
    body?: string
    ears?: string
    eyes?: string
    furColor?: string
    clothing?: string | null
    accessories?: string[]
    size?: string
    sizeName?: string
    color?: string
    material?: string
    materialName?: string
    giftBox?: {
      id: string
      name: string
      price: number
      image: string
    } | null
  }
  createdAt: string
  updatedAt: string
  categoryId?: string
  size?: string
  material?: string
} 