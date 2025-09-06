import { NextResponse } from "next/server";
import { fileCache } from "@/lib/fileCache";

export async function GET() {
  return NextResponse.json(fileCache.getStats());
}

export async function DELETE() {
  fileCache.clear();
  return NextResponse.json({ message: "Cache cleared" });
}