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

export async function GET(req: any) {
    

    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('query');
        const result = await pool.query(
            'SELECT * FROM public.market_search_products($1)',
            [search]
        );

        console.log(result)
        return NextResponse.json({
            message: 'Profile created successfully',
            products: result
        });
    }
    catch (error: any) {
        console.log(error);
        return NextResponse.json({
            message: 'User Name Update failed',
        }, { status: 400 });
    }
}