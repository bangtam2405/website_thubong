export interface Design {
  _id: string;
  designName: string;
  description?: string;
  previewImage?: string;
  canvasJSON?: any;
  parts?: any;
  isPublic?: boolean;
  price?: number;
  specifications?: any;
  createdAt?: string;
  updatedAt?: string;
  categoryId?: string;
  rating?: number;
  reviews?: number;
  sold?: number;
  stock?: number;
  featured?: boolean;
  // Add other fields as needed
} 