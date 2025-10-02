import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

export async function POST() {
  try {
    await pool.query(`SELECT public.backfill_affiliate_codes();`);

    return NextResponse.json({
      message: "Affiliate codes backfilled successfully for old users",
    });
  } catch (error: any) {
    console.error("Error backfilling affiliate codes:", error);
    return NextResponse.json(
      { message: "Error backfilling affiliate codes", error: error.message },
      { status: 500 }
    );
  }
}
