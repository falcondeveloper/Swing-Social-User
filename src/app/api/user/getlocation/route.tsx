import { NextResponse } from 'next/server';
import { Pool } from 'pg';


export const dynamic = 'force-dynamic';

// PostgreSQL pool connection setup
const pool = new Pool({
    user: 'clark',
    host: '199.244.49.83',
    database: 'swingsocialdb',
    password: 'Bmw740il#$',
    port: 5432,
});

export async function POST(req: any) {
    try {
        // Parse the JSON body to get profileId, locationName, latitude, and longitude
        const { id } = await req.json();

        // Execute the database query with the provided parameters
        const result = await pool.query(
            'SELECT * FROM admin_getoneprofile($1)',
            [id]
        );

        return NextResponse.json(
            { message: "Get the result successfully!", product: result.rows[0] }
        );
    } catch (error: any) {
        console.error('Error in POST handler:', error);

        return NextResponse.json(
            {
                message: 'Location update failed',
                error: error.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}
