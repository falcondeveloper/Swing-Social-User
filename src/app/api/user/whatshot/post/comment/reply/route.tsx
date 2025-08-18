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
    const { postId, comment,profileId,parentId } = await req.json();
    try {
        const result = await pool.query(
            'SELECT * FROM insert_comments_reply($1,$2,$3,$4)',
            [postId, comment,profileId,parentId]
        );

        console.log(result)

        return NextResponse.json({
            message: 'Comment created successfully',
        });
    }
    catch (error: any) {
        return NextResponse.json({
            message: 'Comment Update failed',
        }, { status: 400 });
    }
}