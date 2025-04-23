import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

const pool = new Pool({
    user: 'clark',
    host: '199.244.49.83',
    database: 'swingsocialdb',
    password: 'Bmw635csi#',
    port: 5432,
});

export async function GET(req: Request) {
    try {

        console.log("GET request received");

        const getQuery = `SELECT * FROM market_get_products()`;

        const result = await pool.query(getQuery);
        console.log("result=====>", result.rows);

        if (result.rows[0] == null) {
            throw new Error(`We faced some error while getting the data`);
        }

        // Return the response here
        return NextResponse.json(
            { message: "Get the result successfully!", products: result.rows }
        );

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}