// Test Connection route to check if my database connection working or not
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await connectDB();
    // simple query

    return NextResponse.json({
      status: 200,
      database: db.connection.db?.databaseName,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "❌ Connection failed", error: error.message },
      { status: 500 }
    );
  }
}
