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
    const data = await req.json();
    const {
      profileId,
      organizationType,
      companyName,
      firstName,
      lastName,
      email,
      mobilePhone,
      businessPhone,
      address,
      city,
      state,
      zip,
      country,
      website,
      whatsapp,
      paymentMethod,
      paypalEmail,
    } = data;

    if (!profileId || !email) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    const result = await client.query(
      `SELECT * FROM apply_affiliate(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17
      )`,
      [
        profileId,
        organizationType,
        companyName,
        firstName,
        lastName,
        email,
        mobilePhone,
        businessPhone,
        address,
        city,
        state,
        zip,
        country,
        website,
        whatsapp,
        paymentMethod,
        paypalEmail,
      ]
    );

    client.release();

    const row = result.rows[0];

    return NextResponse.json({
      success: true,
      message: "Affiliate application submitted successfully.",
      affiliateCode: row?.affiliate_code,
    });
  } catch (err: any) {
    console.error("Affiliate Apply API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
