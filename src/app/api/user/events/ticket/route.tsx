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
    var { storedEventDetails } = await req.json();

    if (typeof storedEventDetails === "string") {
      storedEventDetails = JSON.parse(storedEventDetails);
    }

    const insertQuery = `SELECT * FROM public.ticket_insert($1, $2, $3, $4, $5)`;
    const updateQtyQuery = `SELECT * FROM public.event_ticket_updateqty($1, $2)`;

    if (Array.isArray(storedEventDetails) && storedEventDetails.length > 0) {
      const results = [];

      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        for (const [index, event] of storedEventDetails.entries()) {
          const { name, type, price, quantity, id: eventId, profileId } = event;

          if (
            !profileId ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              profileId
            )
          ) {
            throw new Error(`Invalid profileId: ${profileId}`);
          }

          if (
            !type ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              type
            )
          ) {
            throw new Error(`Invalid ticketPackageId: ${type}`);
          }

          if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error(`Invalid quantity: ${quantity}`);
          }

          const result = await client.query(insertQuery, [
            name,
            type,
            price,
            quantity,
            eventId,
          ]);
          const updateResult = await client.query(updateQtyQuery, [
            eventId,
            quantity,
          ]);

          if (!updateResult.rows || updateResult.rows.length === 0) {
            throw new Error(
              `Failed to update ticket quantity for event ${index} - no rows returned`
            );
          }

          results.push({
            ticket: result.rows[0],
            quantityUpdate: updateResult.rows[0],
          });
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        console.error("Transaction failed, rolling back:", error);
        throw error;
      } finally {
        client.release();
      }

      return NextResponse.json(
        { message: "All tickets created successfully", tickets: results },
        { status: 201 }
      );
    } else {
      console.error("storedEventDetails is either not an array or is empty.");
      return NextResponse.json(
        { error: "storedEventDetails is either not an array or is empty" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
