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
        var { eventId, profileId } = await req.json();

        console.log(eventId, profileId);

        const insertRsvpQuery = `SELECT * FROM public.event_insert_rsvp($1, $2)`;

        try {
            const result = await pool.query(insertRsvpQuery, [eventId, profileId]);

            if (result.rows[0]) {
                return NextResponse.json(
                    { success: `RSVP is inserted successfully!`, status: 200 },
                    { status: 200 }
                );
            }
            else {
                return NextResponse.json(
                    { success: `Failed to insert RSVP` },
                    { status: 400 }
                );
            }

        } catch (err) {
            return NextResponse.json(
                { error: `Failed to insert RSVP`, details: err },
                { status: 500 }
            );
        }


    } catch (error) {
        return NextResponse.json(
            { error: `Failed to insert RSVP`, details: error },
            { status: 500 }
        );
    }
}