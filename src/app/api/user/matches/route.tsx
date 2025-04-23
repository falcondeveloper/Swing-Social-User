/**
 * ! We haven't used this file in our template. We've used the server actions in the
 * ! `src/app/server/actions.ts` file to fetch the static data from the fake-db.
 * ! This file has been created to help you understand how you can create your own API routes.
 * ! Only consider making API routes if you're planing to share your project data with other applications.
 * ! else you can use the server actions or third-party APIs to fetch the data from your database.
 */

// Next Imports
import { responsiveFontSizes } from '@mui/material';
import { profile } from 'console';
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


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id'); // User ID to fetch a single record
    const match = searchParams.get('match');

    console.log(userId);
    console.log(match);
    if (match === "Matches") {
      console.log("----------->");
      const query = `SELECT * FROM get_matches_list($1)`;

      const postResults = await pool.query(query, [userId]);

      console.log(postResults);
      return NextResponse.json({
        profiles: postResults.rows,
      })
    } else {
      console.log("************----------->");
      if(match === "Likes Me"){
        const query = `SELECT * FROM get_likesme($1)`;

        const conditions: string[] = [];
        const values: any[] = [userId, match];
        const postResults = await pool.query(query, [userId]);
        return NextResponse.json({
          profiles: postResults.rows,
        });
      }
      else if(match === "Blocked"){
        const query = `SELECT * FROM get_blocked_profiles($1)`;

        const conditions: string[] = [];
        const values: any[] = [userId, match];
        const postResults = await pool.query(query, [userId]);
        return NextResponse.json({
          profiles: postResults.rows,
        });
      }
      else if(match === "Friends"){
        const query = `SELECT * FROM get_friends_profiles($1)`;
        
        const conditions: string[] = [];
        const values: any[] = [userId, match];
        const postResults = await pool.query(query, [userId]);
        return NextResponse.json({
          profiles: postResults.rows,
        });
      }
      else{
        const query = `SELECT * FROM get_likes_and_categories($1, $2)`;

        const conditions: string[] = [];
        const values: any[] = [userId, match];
        const postResults = await pool.query(query, values);
        return NextResponse.json({
          profiles: postResults.rows,
        });
      }
      
    }

  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

