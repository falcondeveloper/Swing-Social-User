import { NextResponse } from "next/server";
import { Pool } from "pg";
export const dynamic = "force-dynamic";
import moment from "moment";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

const generateEventDates = (
  startTime: string,
  endTime: string,
  repeats: any
) => {
  if (repeats.type === "none") {
    return [{ start: startTime, end: endTime }];
  }

  const dates = [];
  const duration = moment(endTime).diff(moment(startTime));
  let currentDate = moment(startTime);
  const endDate = getEndDate(repeats, startTime);

  while (currentDate.isSameOrBefore(endDate)) {
    if (repeats.type === "weekly" && repeats.weekDays) {
      const currentWeek = currentDate.clone().startOf("week");
      repeats.weekDays.forEach((isSelected: boolean, dayIndex: number) => {
        if (isSelected) {
          const dayDate = currentWeek.clone().add(dayIndex, "days");
          if (dayDate.isSameOrBefore(endDate)) {
            dates.push({
              start: dayDate.toISOString(),
              end: dayDate.clone().add(duration, "milliseconds").toISOString(),
            });
          }
        }
      });
    } else {
      dates.push({
        start: currentDate.toISOString(),
        end: currentDate.clone().add(duration, "milliseconds").toISOString(),
      });
    }

    switch (repeats.type) {
      case "daily":
        currentDate.add(repeats.interval, "days");
        break;
      case "weekly":
        currentDate.add(repeats.interval, "weeks");
        break;
      case "monthly":
        currentDate.add(repeats.interval, "months");
        if (repeats.monthDay) {
          currentDate.date(repeats.monthDay);
        }
        break;
    }

    if (repeats.stopCondition === "times" && dates.length >= repeats.times) {
      dates.length = repeats.times;
      break;
    }
  }

  return dates;
};

const getEndDate = (repeats: any, startTime: string) => {
  switch (repeats.stopCondition) {
    case "never":
      return moment(startTime).add(1, "year");
    case "date":
      return moment(repeats.untilDate);
    case "times":
      return moment(startTime).add(1, "year");
    default:
      return moment(startTime);
  }
};

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
      repeats,
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

    

    const eventDates = generateEventDates(startTime, endTime, repeats);
    const imagesArray = images.map((url: string) => url).join(",");

    const insertQuery = `SELECT * FROM public.event_insert($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`;
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
      longitude,
      hideTicketOption,
    ];

    const result = await pool.query(insertQuery, insertValues);
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Failed to create event" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Your event is created successfully!",
      status: 200,
    });
  } catch (error: any) {
    console.error("Database query failed:", error);
    return NextResponse.json({
      message: "Sorry, we are unable to process it. Please try again.",
      status: 500,
    });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const eventId = url.searchParams.get("eventId");
    if (eventId) {
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

      // Group attendees by ticket type/name - ensure field names match
      const attendeeCountByType = attendees.reduce((acc, attendee) => {
        // Use the correct field name that matches the ticket.Name field
        const type =
          attendee.TicketType || attendee.Name || attendee.ticketName;
        if (type) {
          acc[type] = (acc[type] || 0) + 1;
        }
        return acc;
      }, {});

      const ticketsWithRemainingQty = tickets.map((ticket) => {
        const attendeeCount = attendeeCountByType[ticket.Name] || 0;
        const remainingQuantity = Math.max(0, ticket.Quantity - attendeeCount);

        return {
          ...ticket,
          Quantity: remainingQuantity,
          OriginalQuantity: ticket.Quantity,
          SoldCount: attendeeCount,
        };
      });

      return NextResponse.json({
        event,
        rsvp,
        attendees,
        tickets: ticketsWithRemainingQty,
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
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
