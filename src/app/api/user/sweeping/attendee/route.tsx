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
    const data = await req.json();
    console.log("-----------------------------", data)
    let query = `SELECT * FROM public.get_swipescreen_attendees($1, $2, $3)`;
    // const values: any[] = [userId];
    const swipeResults = await pool.query(query, [data.loginid, data.targetid, data.eventid]);
    console.log(swipeResults.rows)
    return NextResponse.json({
      swipes: swipeResults.rows,
    });
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

