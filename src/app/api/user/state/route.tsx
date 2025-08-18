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
  password: 'Bmw740il#$',
  port: 5432,
});


export async function GET(req: Request) {
  try {
    // Parse URL parameters
    const { searchParams } = new URL(req.url);
    const userid = searchParams.get('userid'); // User ID to fetch a single record

    // Handle fetching a single record if `id` is provided
    if (userid) {
      console.log('Fetching user with ID:', userid);

      const query = `SELECT * FROM public.web_get_locationbyuserid($1)`;
      const values = [userid];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: `No user found with ID ${userid}` },
          { status: 404 }
        );
      }

      console.log('User fetched:', result.rows[0]);
      return NextResponse.json({ user: result.rows[0] });
    }else{
        console.log('The email is not existed')
    }
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

