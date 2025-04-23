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

export async function POST(req: Request) {
    try {
        const { profileId, payload } = await req.json();

        console.log(profileId);
        const updateAttendeeQuery = "SELECT * FROM public.event_insert_attendee($1, $2)";
        console.log(typeof payload, payload);
        const parsedPayload = typeof payload === "string" ? JSON.parse(payload) : payload;
        if (!Array.isArray(parsedPayload)) {
            console.error("Payload is not an array:", payload);
            return;
        }

        console.log(parsedPayload)

        parsedPayload.forEach(async (item) => {
            console.log(profileId, item.id)
            var response = await pool.query(updateAttendeeQuery, [profileId, item.id]); 
            if (!response?.rows[0]) {
                throw new Error(`Error`);
            }
        });

        return NextResponse.json(
            { error: 'Success.' },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Error' },
            { status: 200 }
        );
    }
}