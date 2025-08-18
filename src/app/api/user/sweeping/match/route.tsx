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
    const { profileid, targetid } = await req.json();
    console.log("pid", profileid, "targetid", targetid)
    try {
        const result = await pool.query(
            'SELECT * FROM public.get_like_match($1, $2)',
            [profileid, targetid]
        );

        console.log(result.rows)

        return NextResponse.json({
            message: 'Like match result',
            isMatch:result?.rows[0]?.Match
        });
    }
    catch (error: any) {
        return NextResponse.json({
            message: 'Like match Update failed',
        }, { status: 400 });
    }
}