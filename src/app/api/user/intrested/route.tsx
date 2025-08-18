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

function calculateDate(age: number): string {
    // Get the current date
    const currentDate = new Date();

    // Subtract the age from the current year
    const year = currentDate.getFullYear() - age;

    // Get the current month and day (months are 0-indexed, so add 1 for proper display)
    const month = currentDate.getMonth() + 1; // Months are 0-indexed in JavaScript
    const day = currentDate.getDate();

    // Format the date as MM/DD/YYYY
    const formattedDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;

    return formattedDate;
}

export async function POST(req: any) {
    const { pid, accounttype, age } = await req.json();

    console.log("==========>");
    console.log(age)

    const birthdayFormat = calculateDate(age)

    try {
        const result = await pool.query(
            'SELECT * FROM public.web_update_accounttypetest($1, $2, $3, $4)',
            [pid, accounttype, birthdayFormat, age]
        );

        console.log(result)

        return NextResponse.json({
            message: 'Profile created successfully',
        });
    }
    catch (error: any) {
        return NextResponse.json({
            message: 'User Name Update failed',
        }, { status: 400 });
    }
}