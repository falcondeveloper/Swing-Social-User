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
    try {
        const { postId } = await req.json();

        console.log('Received Data:', { postId });
        const result = await pool.query(
            'SELECT * FROM delete_comments_post_fn($1)',
            [postId]
        );

        console.log('Database Result', result);

        return NextResponse.json({
            message: 'Post deleted successfully',
        });

    } catch (error: any) {
        console.error('Error in POST handler:', error);

        return NextResponse.json(
            {
                message: 'Post delete failed',
                error: error.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}