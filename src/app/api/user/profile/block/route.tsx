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
  const { id, targetId } = await req.json();

  try {
    const result = await pool.query(
      "select * from public.block_block_profile($1,$2)",
      [id, targetId]
    );

    return NextResponse.json({
      message: "User Blocked Successfully",
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
