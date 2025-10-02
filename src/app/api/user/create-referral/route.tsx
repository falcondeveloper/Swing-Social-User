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
    const { affiliateCode, referredProfileId, source } = await req.json();

    if (!affiliateCode || !referredProfileId) {
      return NextResponse.json(
        {
          success: false,
          error: "affiliateCode and referredProfileId are required",
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT * FROM create_referral($1, $2, $3)`,
        [affiliateCode, referredProfileId, source || null]
      );

      return NextResponse.json({
        success: true,
        referral: result.rows[0],
      });
    } catch (dbErr: any) {
      // ✅ Handle custom Postgres errors
      if (dbErr.message.includes("Self-referral is not allowed")) {
        return NextResponse.json(
          { success: false, error: "You cannot refer yourself." },
          { status: 400 }
        );
      }

      if (dbErr.message.includes("Affiliate code not found")) {
        return NextResponse.json(
          { success: false, error: "Affiliate code is invalid or expired." },
          { status: 404 }
        );
      }

      throw dbErr; // let the catch below handle unexpected errors
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Create referral error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
