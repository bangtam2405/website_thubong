export type Product = {
  _id: string
  name: string
  description: string
  price: number
  image: string
  type: "teddy" | "accessory" | "collection" | "new" | "custom"
  rating: number
  reviews: number
  sold: number
  stock: number
  featured: boolean
  specifications?: {
    body?: string
    ears?: string
    eyes?: string
    furColor?: string
    clothing?: string | null
    accessories?: string[]
    size?: string
    color?: string
  }
  createdAt: string
  updatedAt: string
  categoryId?: string
  size?: string
  material?: string
} 