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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    let query = `SELECT * FROM public.get_swipescreenhome($1)`;
    const swipeResults = await pool.query(query, [userId]);

    if (swipeResults?.rows?.length === 0) {
      return NextResponse.json({
        swipes: [],
        message: "No profiles found",
      });
    }

    return NextResponse.json({
      swipes: swipeResults?.rows,
    });
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
