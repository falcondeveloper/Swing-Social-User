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
    const body = await req.json();

    const affiliateCode: string | undefined = body.affiliateCode;
    const referredUserId: string | null = body.referredUserId ?? null;
    const referredUserName: string | null = body.referredUserName ?? null;
    const referredEmail: string | null = body.referredEmail ?? null;
    const memberShipCheck: string | null = body.memberShipCheck ?? null;
    const subscriptionId: string | null = body.subscriptionId ?? null;

    if (!affiliateCode) {
      return NextResponse.json(
        { success: false, error: "affiliateCode is required" },
        { status: 400 }
      );
    }

    if (referredUserId && !/^[0-9a-fA-F-]{36}$/.test(referredUserId)) {
      return NextResponse.json(
        { success: false, error: "referredUserId must be a UUID" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const refQuery = `SELECT * FROM public.get_referrer_by_code($1::text)`;
      const refResult = await client.query(refQuery, [affiliateCode]);
      const { email, username } = refResult.rows[0];

      console.log("Referral found:", { email, username });

      const sql = `SELECT * FROM public.create_referral_user($1::text, $2::uuid, $3::text, $4::text, $5::text, $6::text)`;
      const params = [
        affiliateCode,
        referredUserId,
        referredUserName,
        referredEmail,
        memberShipCheck,
        subscriptionId,
      ];
      const res = await client.query(sql, params);

      if (!res || res.rowCount === 0) {
        return NextResponse.json(
          { success: false, error: "No response from DB" },
          { status: 500 }
        );
      }

      const row = res.rows[0];
      if (row.message !== "created") {
        return NextResponse.json(
          { success: false, error: row.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, referralId: row.referral_id });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("create-referral error:", err);
    return NextResponse.json(
      { success: false, error: "Server error: " + (err.message ?? err) },
      { status: 500 }
    );
  }
}
