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
    const { profileid, targetid } = await req.json();
    try {
        const result = await pool.query(
            
            'select * from public.block_unblock_profile($1,$2)',
            [profileid, targetid]
        );

        console.log(result?.rows)

        return NextResponse.json({
            message: 'User Access Granted successfully',
            data:result?.rows
        });
    }
    catch (error: any) {
        console.log(error);
        return NextResponse.json({
            message: 'User Access Grant failed',
        }, { status: 400 });
    }
}