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
    const searchTerm = searchParams.get("city");

    const rawQuery = `
      SELECT "City" || ', ' || "State" AS "City"
      FROM "UsCities" 
      WHERE 
        "City" ILIKE $1
        OR "State" ILIKE $1
        OR ("City" || ', ' || "State") ILIKE $1
      ORDER BY "City", "State"
      LIMIT 100
    `;

    const searchPattern = searchTerm ? `%${searchTerm}%` : "%";

    const result = await pool.query(rawQuery, [searchPattern]);

    return NextResponse.json({
      cities: result.rows.map((row, index) => ({
        id: index,
        City: row.City,
      })),
    });
  } catch (error) {
    console.error("Error en la búsqueda de ciudades:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
