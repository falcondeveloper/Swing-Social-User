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

        console.log('Processing attendee request for profileId:', profileId);
        const updateAttendeeQuery = "SELECT * FROM public.event_insert_attendee($1, $2)";
        console.log('Payload type and value:', typeof payload, payload);
        
        const parsedPayload = typeof payload === "string" ? JSON.parse(payload) : payload;
        if (!Array.isArray(parsedPayload)) {
            console.error("Payload is not an array:", payload);
            return NextResponse.json(
                { error: 'Payload must be an array of items' },
                { status: 400 }
            );
        }

        console.log('Parsed payload:', parsedPayload);

        // Use Promise.all to properly handle async operations
        const results = await Promise.all(
            parsedPayload.map(async (item) => {
                console.log('Adding attendee - profileId:', profileId, 'itemId:', item.id);
                const response = await pool.query(updateAttendeeQuery, [profileId, item.id]); 
                if (!response?.rows[0]) {
                    throw new Error(`Failed to add attendee for item ${item.id}`);
                }
                return response.rows[0];
            })
        );

        return NextResponse.json(
            { 
                message: 'Successfully added attendees',
                results: results,
                count: results.length 
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error adding attendees:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to add attendees' },
            { status: 500 }
        );
    }
}