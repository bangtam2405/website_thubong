import { v2 as cloudinary } from 'cloudinary';

// Debug: Log tất cả biến môi trường liên quan đến Cloudinary
console.log('Environment variables check:');
console.log('CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? 'EXISTS' : 'NOT FOUND');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT FOUND');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'EXISTS' : 'NOT FOUND');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'EXISTS' : 'NOT FOUND');

// Cấu hình Cloudinary sử dụng URL connection string
if (process.env.CLOUDINARY_URL) {
  console.log('Using CLOUDINARY_URL configuration');
  cloudinary.config({
    url: process.env.CLOUDINARY_URL
  });
} else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  console.log('Using individual Cloudinary configuration');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.error('❌ ERROR: No Cloudinary configuration found!');
  console.error('Please set either CLOUDINARY_URL or all three: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  
  // Fallback với giá trị mặc định (sẽ gây lỗi nhưng để debug)
  cloudinary.config({
    cloud_name: 'dalfo6cjq',
    api_key: '791655776287295',
    api_secret: 'qgaCkC1d5k7HlUyGeA3Cirn6a3k',
  });
}

// Log cấu hình (ẩn secret)
console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'from URL or fallback',
  api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'from URL or fallback',
  has_secret: !!(process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_URL)
});

export default cloudinary;

// Hàm upload hình ảnh
export const uploadImage = async (file: Buffer, folder: string = 'website_thubong'): Promise<string> => {
  try {
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