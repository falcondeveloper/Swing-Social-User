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
        const requestBody = await req.json();
        console.log('RSVP request body:', requestBody);

        // Support both single and batch operations
        if (requestBody.eventId && requestBody.profileId) {
            // Single RSVP insertion
            const { eventId, profileId } = requestBody;
            console.log('Single RSVP insert - eventId:', eventId, 'profileId:', profileId);

            const insertRsvpQuery = `SELECT * FROM public.event_insert_rsvp($1, $2)`;
            const result = await pool.query(insertRsvpQuery, [eventId, profileId]);

            if (result.rows[0]) {
                return NextResponse.json(
                    { message: `RSVP inserted successfully!`, status: 200 },
                    { status: 200 }
                );
            } else {
                return NextResponse.json(
                    { error: `Failed to insert RSVP` },
                    { status: 400 }
                );
            }
        } else if (requestBody.eventId && requestBody.payload) {
            // Batch RSVP insertion for admin functionality
            const { eventId, payload } = requestBody;
            console.log('Batch RSVP insert - eventId:', eventId, 'payload:', payload);

            const parsedPayload = typeof payload === "string" ? JSON.parse(payload) : payload;
            if (!Array.isArray(parsedPayload)) {
                return NextResponse.json(
                    { error: 'Payload must be an array of items for batch operation' },
                    { status: 400 }
                );
            }

            const insertRsvpQuery = `SELECT * FROM public.event_insert_rsvp($1, $2)`;
            const results = await Promise.all(
                parsedPayload.map(async (item) => {
                    console.log('Adding RSVP - eventId:', eventId, 'profileId:', item.id);
                    const result = await pool.query(insertRsvpQuery, [eventId, item.id]);
                    if (!result?.rows[0]) {
                        throw new Error(`Failed to add RSVP for user ${item.id}`);
                    }
                    return result.rows[0];
                })
            );

            return NextResponse.json(
                { 
                    message: 'Successfully added RSVPs',
                    results: results,
                    count: results.length 
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { error: 'Invalid request format. Expected eventId with profileId (single) or payload (batch)' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Error processing RSVP:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to process RSVP' },
            { status: 500 }
        );
    }
}