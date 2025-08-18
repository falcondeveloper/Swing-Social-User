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
    const { state } = await req.json();
    console.log(state)
    try {
        if (state != null) {
            const result = await pool.query(
                'SELECT * FROM public.admin_state_lookup($1)',
                [state]
            );

            console.log(result.rows[0].FreeMonth, result.rows);

            if (result.rows[0].FreeMonth == 0) {
                return NextResponse.json({
                    message: 'Profile created successfully',
                    result: 0
                });
            } else {
                return NextResponse.json({
                    message: 'Fetch the data successfully!',
                    result: result.rows[0].FreeMonth
                });
            }
        } else {
            console.log("------------------------")
            return NextResponse.json({
                message: 'Fetch the data successfully!',
                result: 0
            });
        }
    }
    catch (error: any) {
        return NextResponse.json({
            message: 'User Name Update failed',
        }, { status: 400 });
    }
}