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
    const { profileId, imageId } = await req.json();

    try {
        const result = await pool.query(
            'select * from  public.images_delete_public_image($1)',
            [imageId]
        );

        if (result.rows[0]) {
            return NextResponse.json({
                message: 'Your public image is deleted successfully!',
                status: 200
            });
        } else {
            throw new Error("Image deleting is failed");
        }
    }
    catch (error: any) {
        return NextResponse.json({
            message: 'Image deleting is failed',
        }, { status: 400 });
    }
}