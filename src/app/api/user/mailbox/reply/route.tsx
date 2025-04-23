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
        fromId,
        toId,
        htmlBody,
        subject,
        image1,
        image2,
        image3,
        image4,
        image5,
        parentId
    } = await req.json();

    try {
        const chatResult = await pool.query(
            'SELECT * FROM public.insert_mailmessage_push_reply($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [fromId, toId, subject, htmlBody, image1, image2, image3, image4, image5, parentId]
        );

        console.log("Query Result:", chatResult);

        // Return success response
        return NextResponse.json({
            message: 'Chat conversation inserted successfully',
            data: chatResult.rows, // Include rows if needed
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


// GET function to fetch all chats for a specific profile
export async function GET(req: any) {
    console.log("Fetching all chats");

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const chatid = searchParams.get('chatid');

    if (!chatid) {
        return NextResponse.json({
            message: 'Chat ID is required',
        }, { status: 400 });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM public.get_mail_with_replies($1)',
            [chatid]
        );
        console.log("Chats fetched:", result.rows);

        // Return success response
        return NextResponse.json({
            message: 'Chats fetched successfully',
            data: result.rows,
        });

    } catch (error: any) {
        console.error("Error fetching chats:", error);

        // Return failure response
        return NextResponse.json({
            message: 'Failed to fetch chats',
            error: error.message, // Include error details for debugging
        }, { status: 400 });
    }
}