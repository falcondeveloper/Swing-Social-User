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

export async function GET() {
  try {
    // Step 1: Fetch all events
    const eventQuery = `SELECT * FROM get_all_events()`;
    const eventResult = await pool.query(eventQuery);

    const events = eventResult.rows;

    if (!events.length) {
      return NextResponse.json({ events: [] });
    }

    // Step 2: For each event, fetch RSVP list
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        try {
          const rsvpQuery = `SELECT * FROM event_rsvp_attendees($1, 'rsvp')`;
          const rsvpResult = await pool.query(rsvpQuery, [
            event.Id || event.Id,
          ]);
          const rsvpList = rsvpResult.rows || [];

          // Return event with its RSVP list
          return {
            ...event,
            rsvp_list: rsvpList,
            rsvp_count: rsvpList.length,
          };
        } catch (err) {
          console.error(
            `Error fetching RSVP for event ${event.event_id}:`,
            err
          );
          return { ...event, rsvp_list: [], rsvp_count: 0 };
        }
      })
    );

    // Step 3: Return enriched response
    return NextResponse.json({
      success: true,
      count: enrichedEvents.length,
      events: enrichedEvents,
    });
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
