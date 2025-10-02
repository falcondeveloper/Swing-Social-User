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
    const { affiliateId } = await req.json();

    if (!affiliateId) {
      return NextResponse.json(
        { success: false, error: "affiliateId is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(`SELECT * FROM get_affiliate_stats($1)`, [
      affiliateId,
    ]);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { success: true, message: "No data available for this affiliate." },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: result.rows[0],
    });
  } catch (err: any) {
    console.error("Affiliate stats error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + err.message },
      { status: 500 }
    );
  }
}
