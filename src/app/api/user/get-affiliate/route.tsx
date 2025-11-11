import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

type Body = {
  affiliateCode?: string;
  limit?: number;
};

export async function POST(req: Request) {
  let client;
  try {
    const body: Body = await req.json();

    const affiliateCode = body.affiliateCode?.toString().trim();
    const limit =
      body.limit && Number.isFinite(body.limit) && body.limit > 0
        ? Math.floor(body.limit)
        : 50;

    if (!affiliateCode) {
      return NextResponse.json(
        { success: false, error: "affiliateCode is required" },
        { status: 400 }
      );
    }

    client = await pool.connect();
    const sql = `SELECT * FROM public.get_affiliate_stats($1::text, $2::integer)`;
    const res = await client.query(sql, [affiliateCode, limit]);

    if (!res || res.rowCount === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No data available for this affiliate.",
          stats: null,
        },
        { status: 200 }
      );
    }

    const stats = res.rows[0];

    return NextResponse.json({ success: true, stats }, { status: 200 });
  } catch (err: any) {
    console.error("Affiliate stats error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error: " + (err?.message ?? err),
      },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
