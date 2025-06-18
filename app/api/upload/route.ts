import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'website_thubong';

    console.log('File received:', file?.name, 'Size:', file?.size);
    console.log('Folder:', folder);

    if (!file) {
      console.error('No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Kiểm tra kích thước file (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', file.size);
      return NextResponse.json(
        { error: 'File too large. Maximum 5MB allowed' },
        { status: 400 }
      );
    }

    console.log('Converting file to buffer...');
    // Chuyển đổi file thành buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Uploading to Cloudinary...');
    // Upload lên Cloudinary
    const imageUrl = await uploadImage(buffer, folder);

    console.log('Upload successful:', imageUrl);
    return NextResponse.json({
      success: true,
      url: imageUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Cấu hình để chấp nhận file upload
export const config = {
  api: {
    bodyParser: false,
  },
}; 