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
    const data = await req.json();
    let query = `SELECT * FROM public.get_swipescreen_attendees($1, $2, $3)`;
    const swipeResults = await pool.query(query, [
      data.loginid,
      data.targetid,
      data.eventid,
    ]);
    return NextResponse.json({
      swipes: swipeResults.rows,
    });
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
