/**
 * ! We haven't used this file in our template. We've used the server actions in the
 * ! `src/app/server/actions.ts` file to fetch the static data from the fake-db.
 * ! This file has been created to help you understand how you can create your own API routes.
 * ! Only consider making API routes if you're planing to share your project data with other applications.
 * ! else you can use the server actions or third-party APIs to fetch the data from your database.
 */

// Next Imports
import { NextResponse } from 'next/server'
import { Pool } from 'pg';
export const dynamic = 'force-dynamic';

const pool = new Pool({
  user: 'clark',
  host: '199.244.49.83',
  database: 'swingsocialdb',
  password: 'Bmw635csi#',
  port: 5432,
});


export async function POST(req: Request) {
  try {
    // Extract `storedEventDetails` from the request body
    var { storedEventDetails } = await req.json();
    console.log(typeof storedEventDetails, storedEventDetails);

    // Parse `storedEventDetails` if it's a string
    if (typeof storedEventDetails === "string") {
      storedEventDetails = JSON.parse(storedEventDetails);
    }

    // Define the query
    const insertQuery = `SELECT * FROM public.ticket_insert($1, $2, $3, $4, $5)`;

    // Check if `storedEventDetails` is a valid array
    if (Array.isArray(storedEventDetails) && storedEventDetails.length > 0) {
      const results = []; // Store results from the DB insertions

      // Use a for...of loop to handle async operations properly
      for (const [index, event] of storedEventDetails.entries()) {
        const { name, type, price, quantity, id: eventId } = event;

        try {
          // Execute the query for each event
          const result = await pool.query(insertQuery, [name, type, price, quantity, eventId]);
          console.log(`Event ${index} inserted successfully:`, result);

          // Store the result in the results array
          results.push(result.rows[0]);
        } catch (error) {
          console.error(`Error inserting event ${index}:`, error);
          return NextResponse.json(
            { error: `Failed to insert event ${index}`, details: error },
            { status: 500 }
          );
        }
      }

      // Return a success response with all inserted tickets
      console.log("All events inserted successfully:", results);
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
