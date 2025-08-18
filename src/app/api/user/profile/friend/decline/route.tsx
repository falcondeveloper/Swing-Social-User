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

export async function POST(req: any) {
    const { fromId, toId, Id } = await req.json();

    try {
        const deleteResult = await pool.query(
            'select * From mail_delete_message($1)',
            [Id]
        );

        console.log(deleteResult)

        return NextResponse.json({
            message: 'Friend Added Successfully',
            data:deleteResult
        });
    }
    catch (error: any) {
        return NextResponse.json({
            message: 'Relationship Category Update failed',
        }, { status: 400 });
    }
}