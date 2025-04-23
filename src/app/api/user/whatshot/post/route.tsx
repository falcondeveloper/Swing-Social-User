/**
 * ! We haven't used this file in our template. We've used the server actions in the
 * ! `src/app/server/actions.ts` file to fetch the static data from the fake-db.
 * ! This file has been created to help you understand how you can create your own API routes.
 * ! Only consider making API routes if you're planing to share your project data with other applications.
 * ! else you can use the server actions or third-party APIs to fetch the data from your database.
 */

// Next Imports
import { NextResponse } from 'next/server'
import { Pool } from 'pg';
export const dynamic = 'force-dynamic';

const pool = new Pool({
    user: 'clark',
    host: '199.244.49.83',
    database: 'swingsocialdb',
    password: 'Bmw635csi#',
    port: 5432,
});

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('id');
        const postId = searchParams.get('postId');

        // Fetch all posts for the user
        let query = 'SELECT * FROM get_allposts($1)';
        const values: any[] = [userId];

        const postResults = await pool.query(query, values);
        console.log(postId);
        // If postId is provided, filter posts in JavaScript
        let filteredPosts = postResults.rows;
        if (postId) {
            console.log("postId");
            filteredPosts = filteredPosts.filter(post => post.Id === postId);
        }

        return NextResponse.json({
            posts: filteredPosts,
        });
    } catch (error) {
        console.error('Database query failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
export async function POST(req: any) {
    try {
        // Parse the JSON body
        const { caption, imageUrl, profileId } = await req.json();

        if (!caption || !imageUrl || !profileId) {
            return NextResponse.json(
                { message: 'Invalid input data' },
                { status: 400 }
            );
        }

        console.log('Received Data:', { caption, imageUrl, profileId });

        // Execute the database query
        const result = await pool.query(
            'SELECT * FROM insert_post_table_image($1,$2,$3)',
            [profileId, imageUrl, caption]
        );

        console.log('Database Result:', result);

        return NextResponse.json({
            message: 'Post created successfully',
        });
    } catch (error: any) {
        console.error('Error in POST handler:', error);

        return NextResponse.json(
            {
                message: 'Post creation failed',
                error: error.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: any) {
    try {
        // Parse the JSON body
        const { postId } = await req.json();

        if (!postId) {
            return NextResponse.json(
                { message: 'Invalid input data' },
                { status: 400 }
            );
        }


        // Execute the database query
        const result = await pool.query(
            'SELECT * FROM delete_post($1)',
            [postId]
        );

        console.log('Database Result:', result);

        return NextResponse.json({
            message: 'Post deleted successfully',
        });
    } catch (error: any) {
        console.error('Error in POST handler:', error);

        return NextResponse.json(
            {
                message: 'Post Deletion failed',
                error: error.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}