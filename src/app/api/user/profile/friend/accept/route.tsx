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
  const { fromId, toId, Id } = await req.json();

  try {
    const friendResult = await pool.query(
      "SELECT * FROM public.insert_friend($1, $2)",
      [fromId, toId]
    );

    if (!friendResult.rows.length) {
      throw new Error("Failed to add friend");
    }

    const messageResult = await pool.query(
      "SELECT * FROM public.mail_delete_message($1)",
      [Id]
    );

    if (!messageResult.rows.length) {
      throw new Error("Failed to delete message");
    }

    return NextResponse.json({
      message: "Friend Request Accepted Successfully",
      data: friendResult.rows,
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
