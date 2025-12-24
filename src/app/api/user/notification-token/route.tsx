import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

export async function POST(req: Request) {
  try {
    const { profileId, token } = await req.json();

    if (!profileId || !token) {
      return NextResponse.json(
        {
          success: false,
          status: 400,
          message: "profileId and token are required",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT * FROM public.upsert_fcm_token($1, $2)`,
      [profileId, token]
    );

    return NextResponse.json(
      {
        success: true,
        status: 200,
        message: "FCM token saved successfully",
        result: result.rows?.[0] ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database query failed:", error);

    return NextResponse.json(
      {
        success: false,
        status: 500,
        message: "Failed to save FCM token",
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}
