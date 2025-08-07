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
    const { pid, interests } = await req.json();
    console.log(interests)

    // const swingStyleFormatted = Object.keys(interests)
    //     .filter((key) => interests[key]) // Filter only the keys with `true` values
    //     .map((key) => `'${key}'`) // Wrap each key in single quotes
    //     .join(','); // Join them with commas

    // let qinterests: string[] = ['Females', 'Couples', 'Males'];
    // // Convert the interests array to a single string with elements enclosed in double quotes
    // let formattedInterests = interests.map((interest: string) => `"${interest}"`).join(',');
    // formattedInterests = "'" + formattedInterests + "'";
    let formattedInterests = interests
        .map((interest: string) => `"${interest.toLowerCase()}"`) // Wrap each interest with double quotes
        .join(', '); // Join them with a comma and a space

    // Wrap the entire string with single quotes
    formattedInterests = `'${formattedInterests}'`;

    console.log(formattedInterests); // Example output: '"couples", "males", "females"'

    console.log(formattedInterests);
    try {
        const result = await pool.query(
            'SELECT * FROM public.edit_profile_lookingfor($1, $2)',
            [pid, formattedInterests]
        );

        console.log(result)

        return NextResponse.json({
            message: 'Profile created successfully',
        });
    }
    catch (error: any) {
        console.log(error);
        return NextResponse.json({
            message: 'User Name Update failed',
        }, { status: 400 });
    }
}