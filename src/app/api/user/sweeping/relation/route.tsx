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
    const { pid, targetid, newcategory } = await req.json();
    console.log("******");
    console.log(pid)
    try {
        const result = await pool.query(

            'select * from public.insert_relationship_categoryfn($1,$2,$3)',
            [pid, targetid, newcategory]
        );

        console.log(result)

        return NextResponse.json({
            message: 'Relationship Category created successfully',
        });
    }
    catch (error: any) {
        return NextResponse.json({
            message: 'Relationship Category Update failed',
        }, { status: 400 });
    }
}