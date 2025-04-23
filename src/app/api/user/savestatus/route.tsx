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
    const { id, status } = await req.json();

    console.log("==========>", id, status);

    try {
        const result = await pool.query(
            'SELECT * FROM public.web_update_emailstatus($1, $2)',
            [id, status]
        );

        console.log(result)

        return NextResponse.json({
            message: 'Profile-emai_verified updated successfully',
        });
    }
    catch (error: any) {
        return NextResponse.json({
            message: 'User Name Update failed',
        }, { status: 400 });
    }
}