import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const backendRes = await fetch(`http://127.0.0.1:5000/api/designs/${id}`, {
      headers: {
        "Content-Type": "application/json",
      }
    });
    let data;
    try {
      data = await backendRes.json();
    } catch (jsonErr) {
      console.error("Proxy error: Lỗi parse JSON từ backend", jsonErr);
      return NextResponse.json({ success: false, error: "Lỗi dữ liệu từ backend" }, { status: 500 });
    }
    console.log("Proxy GET /api/designs/[id]: status", backendRes.status, "data:", data);
    if (backendRes.status === 404 || data === null || data === undefined) {
      return NextResponse.json({ success: false, error: "Không tìm thấy thiết kế" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ success: false, error: "Proxy error", detail: String(err) }, { status: 500 });
  }
}