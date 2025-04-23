/**
 * ! We haven't used this file in our template. We've used the server actions in the
 * ! `src/app/server/actions.ts` file to fetch the static data from the fake-db.
 * ! This file has been created to help you understand how you can create your own API routes.
 * ! Only consider making API routes if you're planing to share your project data with other applications.
 * ! else you can use the server actions or third-party APIs to fetch the data from your database.
 */

// Next Imports
import { Block } from '@mui/icons-material';
import { error } from 'console';
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

    const { loginId, payload } = await req.json();

    console.log(loginId,
        payload.swiping.couples,
        payload.swiping.singleMale,
        payload.swiping.singleFemale,
        false,
        payload.block.couples,
        payload.block.singleMale,
        payload.block.singleFemale,
        payload.city);

    const qCouples = payload.swiping.couples === true ? 1 : 0;
    const qSingleMales = payload.swiping.singleMale === true ? 1 : 0;
    const qSingleFemales = payload.swiping.singleFemale === true ? 1 : 0;
    const qblockCouples = payload.block.couples === true ? 1 : 0;
    const qblocksinglemales = payload.block.singleMale === true ? 1 : 0;
    const qblocksinglefemales = payload.block.singleFemale === true ? 1 : 0;
    const qdinstance = payload.block.maxDistance;
    const quseDistance = payload.distanceChecked === true ? 1 : 0;
    const qcityState = payload.city;

    try {
        const result = await pool.query(
            'SELECT * FROM public.insert_preference($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
            [
                loginId,
                qCouples,
                qSingleMales,
                qSingleFemales,
                0,
                qblockCouples,
                qblocksinglemales,
                qblocksinglefemales,
                qcityState,
                quseDistance,
                qdinstance
            ]
        );

        console.log(result);

        if (result.rows[0]) {
            return NextResponse.json({
                message: 'Your preference is updated successfully!',
                status: 200
            });
        } else {
            throw new Error("Sorry, your updating is failed!");
        }
    }
    catch (error: any) {
        return NextResponse.json({
            message: 'Sorry, your updating is failed!',
            status: 400
        });
    }
}