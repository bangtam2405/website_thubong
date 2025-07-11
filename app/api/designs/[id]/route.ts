import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`http://localhost:5000/api/designs/${id}`);
  if (!res.ok) {
    return NextResponse.json({ success: false, error: "Không tìm thấy thiết kế" }, { status: 404 });
  }
  const data = await res.json();
  return NextResponse.json(data);
} 