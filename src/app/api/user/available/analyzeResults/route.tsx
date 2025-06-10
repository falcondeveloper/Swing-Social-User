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

    try {
        // Parse the request body
        const { results } = await req.json();
        console.log(results);

        const data = [
            {
                "Avatar": "https://api.swingsocial.club/LocalImages/swingsocial/avatars/cropped5145224357678172892.jpeg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1736997951819_1736997951502.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1738558829497_1738558829369.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1737983350181_1737983348842.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1737135444870_1737135444457.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1737722109967_1737722109464.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1737596949269_1737596948124.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/9ead11d4-43b3-4df6-aa8e-568dcb752081_IMG_9944.jpeg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/dee6e241-4756-4173-8709-dfb9494944bc_image.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1738887079827_1738887079153.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1737701206900_1737701206493.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1737229861570_1737229861431.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1738706653921_1738706653464.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/51f667ba-3acf-4121-8d15-d5dc0020a8a8_1000007623.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1735854610263_1735854736384.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/c7b4ca62-df65-46d8-858e-0edd87c64854_image.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/b6cbea71-8d2d-42cc-bb6b-7e695a539e68_IMG_1391.jpeg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1739113417569_1739113417395.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1739247845809_1739247845443.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1738216827581_1738216827225.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/61d1bf02-b2c3-43c7-afff-29e4009501b6_IMG_3825.png"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/bb8f4256-307e-46a2-a1c6-9ed926fb52fd_image.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1738006301676_1738006300660.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1736658878782_1736669618925.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1738340425272_1738340425427.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1739018053397_1739018053081.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1738546394321_1738546394176.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/8dbacecd-9c4f-4c17-8013-fbefc7ec65fd_1000006214.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1736829386499_1736829386275.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1738984183069_1738984182519.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1737074953083_1737074952631.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1735757234973_1735757240916.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/d2df69b4-500e-4fc2-b043-aa88ef56a532_anydesk00000.png"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1739299643752_1739299641896.jpg"
            },
            {
                "Avatar": "https://swingsocialphotos.blob.core.windows.net/images/1739090581464_1739090581310.jpg"
            }
        ]

        for (const result of data) {
            const {  Avatar } = result;
            const Questionable = 1;

            const query = `
                SELECT * FROM public.admin_update_questionable_by_avatar($1, $2)`;

            // Execute the SQL query
            const queryResult = await pool.query(
                query,
                [Avatar, Questionable]
            );

            console.log("Query Result:", queryResult);
        }

        // Return success response
        return NextResponse.json({
            message: 'Profile updated successfully',
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