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
    console.log("Request received");

    // Parse the request body
    const {
        chatId,
    } = await req.json();

    console.log(chatId)

    try {
      
        // Insert the conversation
        const result = await pool.query(
            'SELECT * From mail_delete_message($1)',
            [chatId]
        );

        // console.log("Query Result:", result);

        // Return success response
        return NextResponse.json({
            message: 'Chat conversation inserted successfully',
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
