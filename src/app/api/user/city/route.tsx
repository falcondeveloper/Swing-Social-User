import { NextResponse } from "next/server";
import { Pool } from 'pg';

const pool = new Pool({
    user: 'clark',
    host: '199.244.49.83',
    database: 'swingsocialdb',
    password: 'Bmw635csi#',
    port: 5432,
});


export async function GET(req: Request) {
    try {

        const { searchParams } = new URL(req.url);
        const city = searchParams.get('city');

        const query = `SELECT * FROM public.admin_citylookup($1)`;
        const values = [city];
        const result = await pool.query(query, values);

        return NextResponse.json({
            cities: result.rows.map((row, index) => ({
                id: index,
                City: row.City,
            })
            )
        })
    } catch (error) {
        console.error('Failed to get the history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}