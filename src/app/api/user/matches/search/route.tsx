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
      const { searchParams } = new URL(req.url);
  
      // Extract query parameters from the request
      const userId = searchParams.get("loginprofileid");
      const q_username = searchParams.get("q_username") || null;
      const q_coupletype = searchParams.get("q_coupletype") || null;
      const q_citystate = searchParams.get("q_citystate") || null;
      const q_onlywithphotos = searchParams.get("q_onlywithphotos") === "true" ? true : null;
      const q_hisagemin = searchParams.get("q_hisagemin") || null;
      const q_hisagemax = searchParams.get("q_hisagemax") || null;
      const q_heragemin = searchParams.get("q_heragemin") || null;
      const q_heragemax = searchParams.get("q_heragemax") || null;
      const q_herorientation = searchParams.get("q_herorientation") || null;
      const q_hisorientation = searchParams.get("q_hisorientation") || null;
  
      // SQL query to call the `search_profiles_all` function
      const query = `
        SELECT * 
        FROM public.search_profiles_all(
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
      `;
  
      // Query values
      const values = [
        userId,
        q_username,
        q_coupletype,
        q_citystate,
        q_onlywithphotos,
        q_hisagemin,
        q_hisagemax,
        q_heragemin,
        q_heragemax,
        q_herorientation,
        q_hisorientation,
      ];
  
      // Execute the query
      const postResults = await pool.query(query, values);
  
      // Respond with the query results
      return NextResponse.json({
        profiles: postResults.rows,
      });
    } catch (error) {
      console.error("Database query failed:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  