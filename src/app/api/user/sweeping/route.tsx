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
    const userId = searchParams.get('id'); // User ID to fetch a single record
    const search = searchParams.get('search') || ''; // Search query
    const type = searchParams.get('type') || 'Email'; // Type filter (Email or Username)
    const category = searchParams.get('category') || 'Liked'; // Category filter

    let page = parseInt(searchParams.get('page') || '1', 10); // Page number
    const size = parseInt(searchParams.get('size') || '10', 10); // Page size

    // Validate pagination parameters
    if (page === 0) {
      page = 1;
    }
    if (page < 1 || size < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page and size must be greater than 0.' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * size;

    // Fetch user by ID if provided
    if (userId) {
      const query = `SELECT * FROM get_likes_and_categories($1,$2)`;
      const values = [userId, category];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: `No user found with ID ${userId}` },
          { status: 404 }
        );
      }

      return NextResponse.json({ user: result.rows[0] });
    }

    // Construct query with filters
    let query = `SELECT * FROM public.admin_getalldata_filtered()`;
    let countQuery = `SELECT COUNT(*) FROM public.admin_getalldata_filtered()`;
    const conditions: string[] = [];
    const values: any[] = [];

    if (search) {
      conditions.push(`"Username" ILIKE $${values.length + 1}`);
      values.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
      countQuery += ` WHERE ` + conditions.join(' AND ');
    }

    // Add pagination
    query += ` OFFSET $${values.length + 1} LIMIT $${values.length + 2}`;
    values.push(offset, size);

    // Execute queries
    const [profilesResult, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, values.slice(0, -2)), // Exclude OFFSET and LIMIT values for the count query
    ]);

    const totalRows = parseInt(countResult.rows[0].count, 10);

    return NextResponse.json({
      currentPage: page,
      totalRows,
      profiles: profilesResult.rows,
    });
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}