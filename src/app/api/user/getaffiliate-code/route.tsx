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
        { success: false, error: "profileId is required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT get_affiliate_code($1) AS affiliate_code`,
        [profileId]
      );

      if (!result.rows || result.rows.length === 0 || !result.rows[0].affiliate_code) {
        return NextResponse.json(
          { success: false, message: "Affiliate code not found for this user" },
          { status: 404 }
        );
      }

      const code = result.rows[0].affiliate_code;

      return NextResponse.json({
        success: true,
        affiliate_code: code,
        affiliate_link: `https://swingsocial.co?aff=${code}`,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Get affiliate code error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + err.message },
      { status: 500 }
    );
  }
}
