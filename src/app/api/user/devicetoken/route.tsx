import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw635csi#",
  port: 5432,
});

export async function POST(req: any) {
  const { profile, token } = await req.json();

  try {
    const result = await pool.query(
      "SELECT * FROM public.web_insert_devicetoken($1, $2)",
      [profile?.profileId, token]
    );

    return NextResponse.json({
      message: "Device Token updated",
      data: result.rows,
    });
  } catch (error: any) {
    console.error("Error:", error);

    return NextResponse.json(
      {
        message: "Chat conversation insertion failed",
        error: error.message,
      },
      { status: 400 }
    );
  }
}
