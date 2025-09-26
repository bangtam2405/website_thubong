import { NextRequest, NextResponse } from 'next/server';

// GET - Lấy danh sách wishlist của user
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch('http://localhost:5000/api/wishlist', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch wishlist');
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Thêm/xóa item khỏi wishlist
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, type, action } = body;

    if (!productId || !type) {
      return NextResponse.json({ error: 'Missing productId or type' }, { status: 400 });
    }

    const res = await fetch('http://localhost:5000/api/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, type, action })
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(errorData, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
