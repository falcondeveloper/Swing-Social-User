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
        const { profileId, locationName, latitude, longitude } = await req.json();

        // Validate that the required data is present
        if (!profileId || !locationName || latitude === undefined || longitude === undefined) {
            return NextResponse.json(
                { message: 'Invalid input data' },
                { status: 400 }
            );
        }

        console.log('Received Data:', { profileId, locationName, latitude, longitude });

        // Execute the database query with the provided parameters
        const result = await pool.query(
            'SELECT * FROM edit_profile_location($1,$2,$3)',
            [profileId, latitude, longitude]
        );


        // Check the result of the query (you can modify this part based on how your function returns data)
        if (result.rows.length > 0) {
            return NextResponse.json({
                message: 'Location updated successfully',
            });
        } else {
            return NextResponse.json({
                message: 'Failed to update location',
            }, { status: 400 });
        }

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
