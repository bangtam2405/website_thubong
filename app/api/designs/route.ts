import { NextRequest, NextResponse } from "next/server";
// import { getMongoClient } from "@/lib/mongodb"; // <-- Để user tự setup
// import { ObjectId } from "mongodb";

// POST: Lưu thiết kế mới
export async function POST(req: NextRequest) {
  // const body = await req.json();
  // const { userId, designName, parts, canvasJSON, isPublic = false } = body;
  // const client = await getMongoClient();
  // const db = client.db();
  // const designs = db.collection("designs");
  // const now = new Date();
  // const result = await designs.insertOne({ userId, designName, parts, canvasJSON, isPublic, createdAt: now, updatedAt: now });
  // return NextResponse.json({ success: true, id: result.insertedId });
  return NextResponse.json({ success: true, message: "POST /api/designs - implement backend logic" });
}

// GET: Lấy danh sách thiết kế theo userId
export async function GET(req: NextRequest) {
  // const userId = req.nextUrl.searchParams.get("userId");
  // const client = await getMongoClient();
  // const db = client.db();
  // const designs = db.collection("designs");
  // const list = await designs.find({ userId }).sort({ updatedAt: -1 }).toArray();
  // return NextResponse.json(list);
  return NextResponse.json([]);
}

// PUT: Update thiết kế (user chỉnh sửa)
export async function PUT(req: NextRequest) {
  // const body = await req.json();
  // const { id, ...update } = body;
  // const client = await getMongoClient();
  // const db = client.db();
  // const designs = db.collection("designs");
  // await designs.updateOne({ _id: new ObjectId(id) }, { $set: { ...update, updatedAt: new Date() } });
  // return NextResponse.json({ success: true });
  return NextResponse.json({ success: true, message: "PUT /api/designs - implement backend logic" });
}

// GET by id: Lấy 1 thiết kế (chia sẻ)
// (Bạn nên tạo file app/api/designs/[id]/route.ts riêng cho GET by id) 