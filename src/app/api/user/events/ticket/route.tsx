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

    // Define the queries
    const insertQuery = `SELECT * FROM public.ticket_insert($1, $2, $3, $4, $5)`;
    const updateQtyQuery = `SELECT * FROM public.event_ticket_updateqty($1, $2, $3)`;
    
    console.log('Received event details:', storedEventDetails);

    // Check if `storedEventDetails` is a valid array
    if (Array.isArray(storedEventDetails) && storedEventDetails.length > 0) {
      const results = []; // Store results from the DB insertions

      // Use transaction to ensure atomicity
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Use a for...of loop to handle async operations properly
        for (const [index, event] of storedEventDetails.entries()) {
          const { name, type, price, quantity, id: eventId, profileId } = event;

          console.log(`Processing ticket purchase ${index}:`, { name, type, price, quantity, eventId, profileId });

          // Validate input parameters
          if (!profileId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)) {
            throw new Error(`Invalid profileId: ${profileId}`);
          }
          
          if (!type || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(type)) {
            throw new Error(`Invalid ticketPackageId: ${type}`);
          }
          
          if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error(`Invalid quantity: ${quantity}`);
          }

          // Execute the query for each event to insert the ticket
          const result = await client.query(insertQuery, [name, type, price, quantity, eventId]);
          console.log(`Ticket ${index} inserted successfully:`, result.rows[0]);
          
          // Update the ticket quantity in the event using the stored procedure event_ticket_updateqty
          // Parameters: qprofileid (UUID), qticketpackageid (UUID), qty (integer)
          const updateResult = await client.query(updateQtyQuery, [profileId, type, quantity]);
          console.log(`Ticket ${index} quantity updated successfully:`, updateResult.rows);
          
          if (!updateResult.rows || updateResult.rows.length === 0) {
            throw new Error(`Failed to update ticket quantity for event ${index} - no rows returned`);
          }

          // Store the result in the results array
          results.push({
            ticket: result.rows[0],
            quantityUpdate: updateResult.rows[0]
          });
        }

        await client.query('COMMIT');
        console.log("All ticket purchases processed successfully:", results);
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Transaction failed, rolling back:', error);
        throw error;
      } finally {
        client.release();
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
