import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw635csi#",
  port: 5432,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawTerm = searchParams.get("city") || "";

    const normalized = rawTerm.replace(/\s*,\s*/, ",");
    const searchPattern = normalized ? `%${normalized}%` : "%";

    const rawQuery = `
      SELECT "City" || ', ' || "State" AS "City"
      FROM "UsCities"
      WHERE
        "City"   ILIKE $1
        OR "State" ILIKE $1
        -- coincidencia con coma y espacio
        OR ("City" || ', ' || "State") ILIKE $1
        -- coincidencia con coma pegada
        OR ("City" || ','  || "State") ILIKE $1
      ORDER BY "City", "State"
      LIMIT 100
    `;

    const result = await pool.query(rawQuery, [searchPattern]);

    return NextResponse.json({
      cities: result.rows.map((row, i) => ({ id: i, City: row.City })),
    });
  } catch (error) {
    console.error("Error en la búsqueda de ciudades:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
