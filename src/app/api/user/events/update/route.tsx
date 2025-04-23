/**
 * ! We haven't used this file in our template. We've used the server actions in the
 * ! `src/app/server/actions.ts` file to fetch the static data from the fake-db.
 * ! This file has been created to help you understand how you can create your own API routes.
 * ! Only consider making API routes if you're planing to share your project data with other applications.
 * ! else you can use the server actions or third-party APIs to fetch the data from your database.
 */

// Next Imports
import { ImageAspectRatio } from '@mui/icons-material';
import { responsiveFontSizes } from '@mui/material';
import { profile } from 'console';
import { ImagePlay } from 'lucide-react';
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


export async function POST(req: Request) {
    try {
        const {
            profileId,
            eventId,
            startTime,
            endTime,
            eventName,
            description,
            category,
            isVenueHidden,
            venue,
            coverImageURL,
            emailDescription,
            images,
            longitude,
            latitude
        } = await req.json();

        // Validate the required fields
        if (!profileId || !startTime || !endTime || !eventName || !category || !venue) {
            return NextResponse.json(
                { error: 'Missing required fields: profileId, startTime, endTime, eventName, category, venue' },
                { status: 400 }
            );
        }

        console.log(profileId);

        console.log(images, '====================original');

        // Convert images to a valid PostgreSQL array format
        const imagesArray = images.map((url: string) => url).join(",");
        // const formattedImagesArray = imagesArray; // PostgreSQL array format


        // const formattedImagesArray = `{${imagesArray}}`;

        console.log(imagesArray);
        const updateTimeQuery = `Select * from event_edit_($1, $2, $3 , $4)`;
        const updateCoverImageQuery = `Select * from event_edit_cover($1, $2)`;
        const updateImagesQuery = `Select * from event_edit_images($1, $2)`;
        const updateVenueQuery = `Select * from event_edit_venue($1, $2, $3)`;

        const TimePayload = [
            eventId,
            eventName,
            startTime,
            endTime
        ];

        const CoverImagePayload = [
            eventId,
            coverImageURL
        ];

        const ImagesPayload = [
            eventId,
            imagesArray
        ];

        const VenuePayload = [
            eventId,
            venue,
            category
        ];

        console.log(TimePayload);
        console.log(CoverImagePayload);
        console.log(ImagesPayload);
        console.log(VenuePayload);

        const timeResult = await pool.query(updateTimeQuery, TimePayload);
        console.log("success time");
        const coverResult = await pool.query(updateCoverImageQuery, CoverImagePayload);
        console.log("success cover");
        const imageResult = await pool.query(updateImagesQuery, ImagesPayload);
        console.log("success image");
        const venuResult = await pool.query(updateVenueQuery, VenuePayload);
        console.log("success venu");

        // Check for successful insert
        if (timeResult.rows.length === 0 || coverResult.rows.length === 0 || imageResult.rows.length === 0 || venuResult.rows.length === 0) {
            return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
        }

        const newEvent = venuResult.rows[0];
        console.log('Event created:', newEvent);

        return NextResponse.json(
            { message: 'Event updated successfully', event: newEvent },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Database query failed:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
