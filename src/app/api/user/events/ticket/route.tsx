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
    const { ticketID, ticketQuantity } = await req.json();

    const updateQtyQuery = `SELECT * FROM public.event_ticket_updateqty($1, $2)`;

    const client = await pool.connect();

    try {
      const updateResult = await client.query(updateQtyQuery, [
        ticketID,
        ticketQuantity,
      ]);

      return NextResponse.json(
        { success: true, data: updateResult.rows },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
