import { NextResponse } from "next/server";
import { Pool } from "pg";
export const dynamic = "force-dynamic";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw635csi#",
  port: 5432,
});

export async function POST(req: any) {
  const { pid, avatar, Questionable } = await req.json();
  try {
    const result = await pool.query(
      "SELECT * FROM public.web_new_avatar($1, $2, $3)",
      [pid, avatar, Questionable]
    );

    return NextResponse.json({
      message: "Avatar added successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Avatar addition failed",
      },
      { status: 400 }
    );
  }
}
