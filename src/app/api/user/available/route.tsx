import { NextResponse } from "next/server";
import { Pool } from 'pg';

const pool = new Pool({
    user: 'clark',
    host: '199.244.49.83',
    database: 'swingsocialdb',
    password: 'Bmw635csi#',
    port: 5432,
});

export async function POST(req: Request) {
    try {
        const { profileId } = await req.json();

        const query = `SELECT * FROM edit_profile_available($1)`;

        const result = await pool.query(query, [profileId]);

        console.log(result);

        if (result.rows.length != 0) {
            return NextResponse.json({ message: 'Success', status: 200 });
        } else {
            throw new Error("Failed");
        }


    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}