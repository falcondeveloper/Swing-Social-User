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
        const updateAttendeeQuery = "SELECT * FROM public.event_rsvp_attendees_one_profile($1, $2)";
        console.log(typeof payload, payload);
        const parsedPayload = typeof payload === "string" ? JSON.parse(payload) : payload;
        if (!Array.isArray(parsedPayload)) {
            console.error("Payload is not an array:", payload);
            return;
        }

        let hasResults = false;
        for (const item of parsedPayload) {
            const response = await pool.query(updateAttendeeQuery, [item.id, profileId]);
            console.log(response);
            hasResults = response.rowCount !== null && response.rowCount > 0;
        }
        
        return NextResponse.json({
            message: hasResults ? "1" : "0",
            status: 200,
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Error' },
            { status: 200 }
        );
    }
}
