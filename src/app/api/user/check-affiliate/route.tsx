import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

export async function POST(req: Request) {
  try {
    const { profileId } = await req.json();

    if (!profileId) {
      return NextResponse.json(
        { success: false, message: "Missing profileId." },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    const result = await client.query(
      `SELECT * FROM check_affiliate_exists($1)`,
      [profileId]
    );

    client.release();

    const row = result.rows[0];

    return NextResponse.json({
      success: true,
      hasAffiliate: row?.has_affiliate || false,
      affiliateCode: row?.affiliate_code || null,
    });
  } catch (err: any) {
    console.error("check_affiliate API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
