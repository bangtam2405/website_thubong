import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('http://localhost:5000/api/designs/public');
  const data = await res.json();
  return NextResponse.json(data);
} 