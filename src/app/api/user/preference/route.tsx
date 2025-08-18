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
  const { id } = await req.json();

  try {
    const result = await pool.query(
      "select * from public.get_preferences($1)",
      [id]
    );

    return NextResponse.json({
      message: "Prefrences found Successfully",
      data: result?.rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Relationship Category Update failed",
      },
      { status: 400 }
    );
  }
}
