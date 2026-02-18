import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    commit: "3160ea6-debug",
    developer_routes: true,
  });
}
