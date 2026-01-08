import { NextResponse } from 'next/server'
import { Pool } from 'pg';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    user: 'clark',
    host: '199.244.49.83',
    database: 'swingsocialdb',
    password: 'Bmw740il#$',
    port: 5432,
});

export async function POST(req: any) {
    try {
        const { commentId, content } = await req.json();

        const result = await pool.query(
            'SELECT * FROM update_comments_post_fn($1, $2)',
            [commentId, content]
        );

        console.log('Database Result', result);

        return NextResponse.json({
            message: 'Post updated successfully',
        });

    } catch (error: any) {
        console.error('Error in POST handler:', error);

        return NextResponse.json(
            {
                message: 'Post update failed',
                error: error.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}