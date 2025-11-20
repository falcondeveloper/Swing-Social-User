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
  const { profileid, targetid } = await req.json();
  try {
    const result = await pool.query(
      "select * from public.block_unblock_profile($1,$2)",
      [profileid, targetid]
    );

    return NextResponse.json({
      message: "User Access Granted successfully",
      data: result?.rows,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      {
        message: "User Access Grant failed",
      },
      { status: 400 }
    );
  }
}
