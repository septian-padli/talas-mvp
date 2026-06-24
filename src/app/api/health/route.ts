import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Execute a simple query to verify database connection
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ success: true, status: "connected" });
  } catch (error: any) {
    console.error("Database connection health check failed:", error);
    return NextResponse.json(
      { success: false, status: "disconnected", error: error.message || "Database connection error" },
      { status: 500 }
    );
  }
}
