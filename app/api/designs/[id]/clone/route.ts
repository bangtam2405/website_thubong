import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.text();
  const backendRes = await fetch(`http://127.0.0.1:5000/api/designs/${id}/clone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
} 