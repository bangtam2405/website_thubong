import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, uploadVideo } from '@/lib/cloudinary';

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

    // Kiểm tra loại file và kích thước
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    const isVideo = file.type === 'video/mp4';
    if (!isImage && !isVideo) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'File must be jpg, png, or mp4' },
        { status: 400 }
      );
    }
    if (isImage && file.size > 5 * 1024 * 1024) {
      console.error('Image too large:', file.size);
      return NextResponse.json(
        { error: 'Image too large. Maximum 5MB allowed' },
        { status: 400 }
      );
    }
    if (isVideo && file.size > 20 * 1024 * 1024) {
      console.error('Video too large:', file.size);
      return NextResponse.json(
        { error: 'Video too large. Maximum 20MB allowed' },
        { status: 400 }
      );
    }

    console.log('Converting file to buffer...');
    // Chuyển đổi file thành buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Uploading to Cloudinary...');
    let fileUrl = '';
    if (isImage) {
      fileUrl = await uploadImage(buffer, folder);
    } else if (isVideo) {
      fileUrl = await uploadVideo(buffer, folder);
    }
    console.log('Upload successful:', fileUrl);
    return NextResponse.json({
      success: true,
      url: fileUrl,
      message: 'File uploaded successfully'
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