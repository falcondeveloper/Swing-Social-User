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

export async function POST(req: Request) {
  try {
    const {
      reportedById,
      reportedByName,
      reportedUserId,
      reportedUserName,
      image,
    } = await req.json();

    const result = await pool.query(
      "SELECT * FROM public.user_reports_image($1, $2, $3, $4, $5)",
      [reportedById, reportedByName, reportedUserId, reportedUserName, image]
    );

    return NextResponse.json({
      message: "Image report stored successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { message: "Failed to store report data" },
      { status: 400 }
    );
  }
}
