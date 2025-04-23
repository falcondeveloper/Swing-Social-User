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

    const { postId, profileId } = await req.json();

    console.log(postId, profileId);
    var result;
    try {
        const isLikeResult = await pool.query(
            'SELECT * FROM whatshot_profile_like_dupecheck($1, $2)',
            [postId, profileId]
        );

        const isPostedResult = await pool.query(
            'SELECT * FROM whatshot_postowner_check($1, $2)',
            [postId, profileId]
        );

        const isLiked = isLikeResult.rows[0].LikeExists;
        const isPosted = isPostedResult.rows[0].PostedByProfile;

        console.log(isLiked);
        console.log(isPosted);

        if (isLiked == 0) {
            if (isPosted == 0) {
                result = await pool.query(
                    'SELECT * FROM insert_likes_postfn($1, $2)',
                    [postId, profileId]
                );
            }
        }

        return NextResponse.json({
            message: 'Post Liked successfully',
            likeExist: isLiked,
            PostedByProfile: isPosted
        });
    }
    catch (error: any) {
        console.log(error);
        return NextResponse.json({
            message: 'Post Like failed',
        }, { status: 400 });
    }
}