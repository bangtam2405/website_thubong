export interface Design {
  _id: string;
  designName: string;
  description?: string;
  previewImage?: string;
  canvasJSON?: any;
  parts?: any;
  isPublic?: boolean;
  // Add other fields as needed
} 