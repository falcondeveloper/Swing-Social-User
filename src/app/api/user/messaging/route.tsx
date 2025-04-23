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
        chatid,
        ProfileIdfrom,
        ProfileIDto,
        Conversation
    } = await req.json();

    try {
        let finalChatId = chatid;

        // If chatid is 0, create a new chat and get the chat_id
        if (chatid === 0) {
            console.log("chatid is 0, creating a new chat...");
            const chatResult = await pool.query(
                'SELECT * FROM public.chat_create_user_chat($1, $2)',
                [ProfileIdfrom, ProfileIDto]
            );

            if (chatResult.rows.length > 0) {
                finalChatId = chatResult.rows[0].ChatId;
                console.log("New chat_id created:", chatResult.rows);
            } else {
                throw new Error("Failed to create a new chat. No chat_id returned.");
            }
        }

        // Insert the conversation
        const result = await pool.query(
            'SELECT * FROM public.insert_chat_conversation($1, $2, $3, $4)',
            [finalChatId, ProfileIdfrom, ProfileIDto, Conversation]
        );

        console.log("Query Result:", result);

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


// GET function to fetch all chats for a specific profile
export async function GET(req: any) {
    console.log("Fetching all chats");

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const profileid = searchParams.get('profileid');

    if (!profileid) {
        return NextResponse.json({
            message: 'Profile ID is required',
        }, { status: 400 });
    }

    try {
        // Execute the SQL query to get all chats
        const result = await pool.query(
            'SELECT * FROM public.get_all_chats($1)',
            [profileid]
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