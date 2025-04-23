import { Pool } from 'pg';
import { NextResponse } from 'next/server';

export  async function GET(req: any) {
  const pool = new Pool({
      user: 'clark',
      host: '199.244.49.83',
      database: 'swingsocialdb',
      password: 'Bmw635csi#',
      port: 5432,
  });

  try {


    // Query to fetch only the avatar column
    const query = `
      SELECT "Avatar"
      FROM "UserProfiles"
      WHERE "CreatedAt" BETWEEN $1 AND $2
        AND "Avatar" IS NOT NULL;
    `;

    // Parameters for the query
    const values = [
      '2025-01-01', // Start date
      new Date().toISOString(), // Current date in ISO string format
    ];

    // Execute the query
    const result = await pool.query(query, values);

    console.log('Avatars:', result.rows);

    // Return only the avatar data
    return NextResponse.json({
                message: result.rows,
            })
  } catch (error) {
    console.error('Error fetching avatars:', error);
    return NextResponse.json({
        message: 'Profile created successfully',
    })
  }
}