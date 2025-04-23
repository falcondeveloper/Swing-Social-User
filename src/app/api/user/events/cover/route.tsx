
/**
 * ! We haven't used this file in our template. We've used the server actions in the
 * ! `src/app/server/actions.ts` file to fetch the static data from the fake-db.
 * ! This file has been created to help you understand how you can create your own API routes.
 * ! Only consider making API routes if you're planing to share your project data with other applications.
 * ! else you can use the server actions or third-party APIs to fetch the data from your database.
 */

// Next Imports
import { responsiveFontSizes } from '@mui/material';
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

// Add a user to RSVP for an event
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { qeventid, qcoverimage } = body;

    if (!qeventid || !qcoverimage) {
      return NextResponse.json(
        { error: 'Event ID and Cover Image are required to add RSVP.' },
        { status: 400 }
      );
    }


    // Call the SQL function to insert RSVP
    const insertQuery = `SELECT * FROM event_edit_cover($1,$2)`;
    const result = await pool.query(insertQuery, [qeventid, qcoverimage]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: `Failed to Update Event` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: `Event successfully Updated.` },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to add RSVP:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
