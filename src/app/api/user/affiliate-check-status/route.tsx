// app/api/referrals/check/route.ts
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
  let client;
  try {
    const { profileId } = await req.json();

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: "profileId is required" },
        { status: 400 }
      );
    }
    if (!/^[0-9a-fA-F-]{36}$/.test(profileId)) {
      return NextResponse.json(
        { success: false, error: "profileId must be a UUID" },
        { status: 400 }
      );
    }

    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM public.get_referral_by_profile($1::uuid)`,
      [profileId]
    );

    if (!result || result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: "No response from DB" },
        { status: 500 }
      );
    }

    const row = result.rows[0];
    return NextResponse.json({ success: true, referral: row }, { status: 200 });
  } catch (err: any) {
    console.error("check-referral error:", err);
    return NextResponse.json(
      { success: false, error: "Server error: " + (err?.message ?? err) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
