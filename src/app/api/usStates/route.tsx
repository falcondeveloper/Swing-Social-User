import { NextResponse } from "next/server";
import { Pool } from "pg";

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
    const rawTerm = searchParams.get("state") || "";

    const searchPattern = rawTerm ? `%${rawTerm}%` : "%";

    const query = `
      SELECT "StateFull", "State"
      FROM "UsStates"
      WHERE "StateFull" ILIKE $1
         OR "State" ILIKE $1
      ORDER BY "StateFull"
      LIMIT 100
    `;

    const result = await pool.query(query, [searchPattern]);

    return NextResponse.json({
      states: result.rows.map((row, i) => ({
        id: i,
        StateFull: row.StateFull,
        State: row.State, 
      })),
    });
  } catch (error) {
    console.error("State search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
