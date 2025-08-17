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
  const { pid, image } = await req.json();
  try {
    const result = await pool.query(
      "SELECT * FROM public.images_insert_private_image($1,$2)",
      [pid, image]
    );

    return NextResponse.json({
      message: "Image uploaded successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Image upload failed",
      },
      { status: 400 }
    );
  }
}
