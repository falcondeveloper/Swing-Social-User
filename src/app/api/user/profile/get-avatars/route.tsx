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
    const { searchParams } = new URL(req.url);
    const includeNulls = searchParams.get("includeNulls") === "true";

    const sql = `SELECT * FROM public.get_all_avatars()`;
    const result = await pool.query(sql);

    const rows = result?.rows ?? [];

    const filteredRows = includeNulls
      ? rows
      : rows.filter((r: any) => r.avatar !== null && r.avatar !== "");

    if (!filteredRows || filteredRows.length === 0) {
      return NextResponse.json(
        {
          images: [],
          message: "No images found",
        },
        { status: 200 }
      );
    }

    const images = filteredRows.map((r: any) => ({
      idx: r.idx ?? null,
      avatar: r.avatar ?? null,
      location: r.location ?? null,
      username: r.username ?? null,
      gender: r.gender ?? null,
      accountType: r.accounttype ?? null,
    }));

    return NextResponse.json(
      {
        images,
        total: images.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
