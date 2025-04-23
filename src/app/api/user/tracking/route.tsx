import { NextResponse } from "next/server";
import { Pool } from "pg";
export const dynamic = "force-dynamic";
// PostgreSQL pool connection setup
const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw635csi#",
  port: 5432,
});
export async function POST(req: any) {
  try {
    const { affiliate, referral, OS, page, url, userid } = await req.json();
    const result = await pool.query(
      "SELECT * FROM public.hit_insert_1($1, $2, $3, $4, $5, $6)",
      [affiliate, referral, OS, page, url, userid]
    );
    console.log(result.rows)
    return NextResponse.json({
      message: "Tracking data stored successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { message: "Failed to store tracking data" },
      { status: 400 }
    );
  }
}
