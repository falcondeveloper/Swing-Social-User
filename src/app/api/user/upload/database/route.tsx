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

export async function POST(req: any) {
  const { pid, avatar, banner, Questionable } = await req.json();
  try {
    const result = await pool.query(
      "SELECT * FROM public.web_update_avatar($1, $2, $3, $4)",
      [pid, avatar, banner, Questionable]
    );

    return NextResponse.json({
      message: "Profile created successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "User Name Update failed",
      },
      { status: 400 }
    );
  }
}
