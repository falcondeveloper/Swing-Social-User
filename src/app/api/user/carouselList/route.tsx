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

export async function GET(req: Request) {
  try {
    const getQuery = `SELECT * FROM registration_get_carousel()`;

    const result = await pool.query(getQuery);

    if (result.rows[0] == null) {
      throw new Error(`We faced some error while getting the data`);
    }

    return NextResponse.json({
      message: "Get the result successfully!",
      products: result.rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
