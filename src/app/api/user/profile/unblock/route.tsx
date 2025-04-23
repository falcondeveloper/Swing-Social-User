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

export async function POST(req: any) {
    const { id, targetId } = await req.json();

    try {
        const result = await pool.query(

            'select * from public.block_unblock_profile($1,$2)',
            [id, targetId,]
        );


        return NextResponse.json({
            message: 'User Blocked Successfully',
        });
    }
    catch (error: any) {
        return NextResponse.json({
            message: 'Relationship Category Update failed',
        }, { status: 400 });
    }
}