import { NextRequest, NextResponse } from "next/server";
// import { getMongoClient } from "@/lib/mongodb"; // <-- Để user tự setup
// import { ObjectId } from "mongodb";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // const { id } = params;
  // const client = await getMongoClient();
  // const db = client.db();
  // const designs = db.collection("designs");
  // const design = await designs.findOne({ _id: new ObjectId(id) });
  // return NextResponse.json(design);
  return NextResponse.json({ success: true, message: "GET /api/designs/[id] - implement backend logic" });
} 