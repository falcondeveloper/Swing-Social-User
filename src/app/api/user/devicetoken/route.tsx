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

// export async function POST(req: any) {
//     // Parse the request body
//     const {
//         profileId,
//         token
//     } = await req.json();

//     try {
//         // Insert the conversation
//         const result = await pool.query(
//             'SELECT * from web_update_device_token($1,$2)',
//             [profileId,token]
//         );
//         // Return success response
//         return NextResponse.json({
//             message: 'Device Token updated',
//             data: result.rows, // Include rows if needed
//         });
//     } catch (error: any) {
//         console.error("Error:", error);

//         // Return failure response
//         return NextResponse.json({
//             message: 'Chat conversation insertion failed',
//             error: error.message, // Include error details for debugging
//         }, { status: 400 });
//     }
// }

export async function POST(req: any) {
    // Parse the request body
    const {
        profile,
        token
    } = await req.json();
    console.log("-------------------------", profile, token)

    try {
        
        const result = await pool.query(
            'SELECT * FROM public.web_insert_devicetoken($1, $2)',
            [profile?.profileId, token]
        );
        
        // Insert the conversation
        // const result = await pool.query(
        //     'SELECT * from web_update_device_token($1,$2)',
        //     [profileId,token]
        // );
        // Return success response
        return NextResponse.json({
            message: 'Device Token updated',
            data: result.rows, // Include rows if needed
        });
    } catch (error: any) {
        console.error("Error:", error);

        // Return failure response
        return NextResponse.json({
            message: 'Chat conversation insertion failed',
            error: error.message, // Include error details for debugging
        }, { status: 400 });
    }
}
