import { NextResponse } from "next/server";
import { Pool } from "pg";
export const dynamic = "force-dynamic";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
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
      latitude,
      hideTicketOption,
    } = await req.json();

    if (
      !profileId ||
      !startTime ||
      !endTime ||
      !eventName ||
      !category ||
      !venue
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: profileId, startTime, endTime, eventName, category, venue",
        },
        { status: 400 }
      );
    }

    const imagesArray = images.map((url: string) => url).join(",");

    const updateTimeQuery = `select * From event_edit_2($1,$2,$3,$4,$5,$6)`;
    const updateCoverImageQuery = `Select * from event_edit_cover($1, $2)`;
    const updateImagesQuery = `Select * from event_edit_images($1, $2)`;
    const updateVenueQuery = `SELECT * FROM event_edit_venue($1, $2, $3, $4, $5, $6, $7)`;

    const TimePayload = [
      eventId,
      eventName,
      startTime,
      endTime,
      description,
      emailDescription,
    ];

    const CoverImagePayload = [eventId, coverImageURL];

    const ImagesPayload = [eventId, imagesArray];

    const VenuePayload = [
      eventId,
      venue,
      category,
      isVenueHidden,
      hideTicketOption,
      longitude,
      latitude,
    ];

    const timeResult = await pool.query(updateTimeQuery, TimePayload);

    const coverResult = await pool.query(
      updateCoverImageQuery,
      CoverImagePayload
    );

    const imageResult = await pool.query(updateImagesQuery, ImagesPayload);

    const venuResult = await pool.query(updateVenueQuery, VenuePayload);

    if (
      timeResult.rows.length === 0 ||
      coverResult.rows.length === 0 ||
      imageResult.rows.length === 0 ||
      venuResult.rows.length === 0
    ) {
      return NextResponse.json(
        { error: "Failed to create event" },
        { status: 500 }
      );
    }

    const newEvent = venuResult.rows[0];
    console.log("Event created:", newEvent);

    return NextResponse.json(
      { message: "Event updated successfully", event: newEvent },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
