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
import moment from 'moment';

const pool = new Pool({
  user: 'clark',
  host: '199.244.49.83',
  database: 'swingsocialdb',
  password: 'Bmw635csi#',
  port: 5432,
});

const generateEventDates = (startTime: string, endTime: string, repeats: any) => {
  if (repeats.type === 'none') {
    return [{ start: startTime, end: endTime }];
  }

  const dates = [];
  const duration = moment(endTime).diff(moment(startTime));
  let currentDate = moment(startTime);
  const endDate = getEndDate(repeats, startTime);

  while (currentDate.isSameOrBefore(endDate)) {
    if (repeats.type === 'weekly' && repeats.weekDays) {
      // Handle weekly repeats with selected days
      const currentWeek = currentDate.clone().startOf('week');
      repeats.weekDays.forEach((isSelected: boolean, dayIndex: number) => {
        if (isSelected) {
          const dayDate = currentWeek.clone().add(dayIndex, 'days');
          if (dayDate.isSameOrBefore(endDate)) {
            dates.push({
              start: dayDate.toISOString(),
              end: dayDate.clone().add(duration, 'milliseconds').toISOString()
            });
          }
        }
      });
    } else {
      // Handle daily and monthly repeats
      dates.push({
        start: currentDate.toISOString(),
        end: currentDate.clone().add(duration, 'milliseconds').toISOString()
      });
    }

    switch (repeats.type) {
      case 'daily':
        currentDate.add(repeats.interval, 'days');
        break;
      case 'weekly':
        currentDate.add(repeats.interval, 'weeks');
        break;
      case 'monthly':
        currentDate.add(repeats.interval, 'months');
        // Adjust to specified day of month
        if (repeats.monthDay) {
          currentDate.date(repeats.monthDay);
        }
        break;
    }

    // Break if we've generated enough occurrences for 'times' stop condition
    if (repeats.stopCondition === 'times' && dates.length >= repeats.times) {
      dates.length = repeats.times;
      break;
    }
  }

  return dates;
}

const getEndDate = (repeats: any, startTime: string) => {
  switch (repeats.stopCondition) {
    case 'never':
      // Default to 1 year if "never" is selected
      return moment(startTime).add(1, 'year');
    case 'date':
      return moment(repeats.untilDate);
    case 'times':
      // For 'times', we'll handle the limit in the main loop
      return moment(startTime).add(1, 'year');
    default:
      return moment(startTime);
  }
}

export async function POST(req: Request) {
  try {
    const {
      profileId,
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
      repeats
    } = await req.json();

    // Validate the required fields
    if (!profileId || !startTime || !endTime || !eventName || !category || !venue) {
      return NextResponse.json(
        { error: 'Missing required fields: profileId, startTime, endTime, eventName, category, venue' },
        { status: 400 }
      );
    }

    console.log(images, '====================original');

    const eventDates = generateEventDates(startTime, endTime, repeats);

    console.log("eventDates", eventDates);


    // Convert images to a valid PostgreSQL array format
    const imagesArray = images.map((url: string) => url).join(",");
    // const formattedImagesArray = imagesArray; // PostgreSQL array format

    const formattedImagesArray = `{${imagesArray}}`;

    // Insert event data into the database using the event_insert function
    const insertQuery = `SELECT * FROM public.event_insert($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`;
    const insertValues = [
      profileId,
      startTime,
      endTime,
      eventName,
      description,
      category,
      isVenueHidden,
      venue,
      coverImageURL,
      emailDescription,
      imagesArray,
      latitude,
      longitude
    ];

    console.log(insertValues, "==============insertValues");

    const result = await pool.query(insertQuery, insertValues);
    console.log(result, "================result");
    // Check for successful insert
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    const newEvent = result.rows[0];
    console.log('Event created:', newEvent);

    return NextResponse.json(
      { message: 'Your event is created successfully!', status: 200 }
    );
  } catch (error: any) {
    console.error('Database query failed:', error);
    return NextResponse.json({ message: 'Sorry, we are unable to process it. Please try again.', status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // Extract the `id` from the query parameters
    const url = new URL(req.url);
    const eventId = url.searchParams.get('eventId');
    if (eventId) {
      console.log('Fetching event with ID:', eventId);
      // Query the database for event details
      const eventQuery = `SELECT * FROM public.event_get_details($1)`;
      const eventValues = [eventId];
      const eventResult = await pool.query(eventQuery, eventValues);

      if (eventResult.rows.length === 0) {
        return NextResponse.json(
          { error: `No event found with ID ${eventId}` },
          { status: 404 }
        );
      }

      const event = eventResult.rows[0];
      console.log('Event fetched:', event);

      // Fetch RSVP, attendees, and tickets data
      const rsvpQuery = `SELECT * FROM event_rsvp_attendees($1, 'rsvp')`;
      const attendeesQuery = `SELECT * FROM event_rsvp_attendees($1, 'attendees')`;
      const ticketsQuery = `SELECT * FROM get_event_ticket_packages($1)`;

      const [rsvpResult, attendeesResult, ticketsResult] = await Promise.all([
        pool.query(rsvpQuery, [eventId]),
        pool.query(attendeesQuery, [eventId]),
        pool.query(ticketsQuery, [eventId]),
      ]);

      const rsvp = rsvpResult.rows;
      const attendees = attendeesResult.rows;
      const tickets = ticketsResult.rows;

      return NextResponse.json({
        event,
        rsvp,
        attendees,
        tickets,
      });
    } else {
      let query = `SELECT * FROM get_all_events()`;
      const conditions: string[] = [];
      const values: any[] = [];
      const profilesResult = await pool.query(query, values);
      return NextResponse.json({
        events: profilesResult.rows,
      });
    }
  } catch (error) {
    console.error('Database query failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

