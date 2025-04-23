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
    console.log("Request received");

    // Parse the request body
    const {
        pid,
        accounttype,
        gender1,
        age,
        orientation1,
        partnerbirthday,
        partnergender,
        partnerorientation
    } = await req.json();

    console.log("Parsed Request Data:", {
        pid,
        accounttype,
        gender1,
        age,
        orientation1,
        partnerbirthday,
        partnergender,
        partnerorientation
    });

    console.log(partnerbirthday)

    const partnerbirthdayreformat = calculateDate(partnerbirthday)
    const mybirthdayreformat = calculateDate(age)

    console.log(partnerbirthdayreformat)

    try {
        // Execute the SQL query
        const result = await pool.query(
            'SELECT * FROM public.web_update_gender_partnertest($1, $2, $3, $4, $5, $6, $7, $8)',
            [pid, accounttype, gender1, orientation1, mybirthdayreformat, partnerbirthdayreformat, partnergender, partnerorientation]
        );

        console.log("Query Result:", result);

        // Return success response
        return NextResponse.json({
            message: 'Profile updated successfully',
            data: result.rows, // Include rows if needed
        });
    } catch (error: any) {
        console.error("Error:", error);

        // Return failure response
        return NextResponse.json({
            message: 'Profile update failed',
            error: error.message, // Include error details for debugging
        }, { status: 400 });
    }
}