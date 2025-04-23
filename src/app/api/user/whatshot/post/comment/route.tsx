import { NextResponse } from 'next/server';
import { Pool } from 'pg';


export const dynamic = 'force-dynamic';

// PostgreSQL pool connection setup
const pool = new Pool({
    user: 'clark',
    host: '199.244.49.83',
    database: 'swingsocialdb',
    password: 'Bmw635csi#',
    port: 5432,
});

export async function POST(req: any) {
    try {
        // Parse the JSON body
        const { postId, comment, profileId } = await req.json();

        if (!postId || !comment || !profileId) {
            return NextResponse.json(
                { message: 'Invalid input data' },
                { status: 400 }
            );
        }

        console.log('Received Data:', { postId, comment, profileId });

        // Execute the database query
        const result = await pool.query(
            'SELECT * FROM insert_comments_post_fn($1,$2,$3)',
            [postId, comment, profileId]
        );

        console.log('Database Result:', result);

        return NextResponse.json({
            message: 'Comment created successfully',
        });
    } catch (error: any) {
        console.error('Error in POST handler:', error);

        return NextResponse.json(
            {
                message: 'Comment creation failed',
                error: error.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function GET(req: any) {
    try {
        // Parse the JSON body
        const { searchParams } = new URL(req.url);
        const postId = searchParams.get('postId');

        console.log("post id:");
        console.log(postId);
        if (!postId) {
            return NextResponse.json(
                { message: 'Invalid input data' },
                { status: 400 }
            );
        }

        // Execute the database query
        const result = await pool.query(
            'SELECT * FROM get_comments_whatshot_post($1)',
            [postId]
        );

        return NextResponse.json({
            message: 'Comment Found successfully',
            comments: result?.rows
        });
    } catch (error: any) {
        console.error('Error in POST handler:', error);

        return NextResponse.json(
            {
                message: 'Comment creation failed',
                error: error.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}