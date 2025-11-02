import { v2 as cloudinary } from 'cloudinary';

// Lazy initialization - chỉ config khi cần (tránh chạy trong build time)
let isConfigured = false;

function configureCloudinary() {
  if (isConfigured) return;

  // Chỉ config khi có environment variables (runtime, không phải build time)
  if (typeof window === 'undefined') { // Server-side only
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config({
        url: process.env.CLOUDINARY_URL
      });
      isConfigured = true;
    } else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      isConfigured = true;
    } else {
      // Chỉ log error khi thực sự cần dùng (runtime), không phải build time
      // Sẽ được log khi hàm upload được gọi
    }
  }
}

// Auto-configure on import (chỉ chạy ở server-side runtime)
if (typeof window === 'undefined') {
  configureCloudinary();
}

export default cloudinary;

// Hàm upload hình ảnh
export const uploadImage = async (file: Buffer, folder: string = 'website_thubong'): Promise<string> => {
  try {
    // Đảm bảo Cloudinary đã được config trước khi sử dụng
    configureCloudinary();
    
    // Kiểm tra config
    if (!isConfigured && typeof window === 'undefined') {
      const hasConfig = process.env.CLOUDINARY_URL || 
        (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
      
      if (!hasConfig) {
        throw new Error('Cloudinary configuration not found. Please set CLOUDINARY_URL or all three: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
      }
    }
    
    console.log('Starting Cloudinary upload...');
    console.log('Folder:', folder);
    console.log('Buffer size:', file.length);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result?.secure_url);
            resolve(result);
          }
        }
      );

      uploadStream.end(file);
    });

    const imageUrl = (result as any).secure_url;
    if (!imageUrl) {
      throw new Error('No URL returned from Cloudinary');
    }

    return imageUrl;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Hàm xóa hình ảnh
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    configureCloudinary();
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
};

// Hàm lấy public ID từ URL
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split('.')[0];
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}; 

// Hàm upload video mp4
export const uploadVideo = async (file: Buffer, folder: string = 'website_thubong'): Promise<string> => {
  try {
    configureCloudinary();
    
    // Kiểm tra config
    if (!isConfigured && typeof window === 'undefined') {
      const hasConfig = process.env.CLOUDINARY_URL || 
        (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
      
      if (!hasConfig) {
        throw new Error('Cloudinary configuration not found. Please set CLOUDINARY_URL or all three: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
      }
    }
    
    console.log('Starting Cloudinary video upload...');
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'video',
          format: 'mp4',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary video upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary video upload success:', result?.secure_url);
            resolve(result);
          }
        }
      );
      uploadStream.end(file);
    });
    const videoUrl = (result as any).secure_url;
    if (!videoUrl) {
      throw new Error('No URL returned from Cloudinary');
    }
    return videoUrl;
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 