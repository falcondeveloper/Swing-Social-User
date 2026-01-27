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
    const { userId } = await req.json();

    console.log("userId", userId);

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "UserId is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT * FROM public.update_selfie_verification_status($1)",
      [userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Selfie verification badge updated",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Update badge error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to update selfie verification badge",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
