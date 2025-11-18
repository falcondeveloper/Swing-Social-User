import { NextResponse } from "next/server";
import { Pool } from "pg";
export const dynamic = "force-dynamic";
import FormData from "form-data";
import Mailgun from "mailgun.js";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

async function getMailgunKey(): Promise<string | null> {
  try {
    const res = await pool.query(
      'SELECT * FROM "Configuration" WHERE "ConfigName" = $1 LIMIT 1',
      ["EmailApi"]
    );
    return res.rows?.[0]?.ConfigValue ?? null;
  } catch (err) {
    console.error("Failed to read Mailgun key from DB:", err);
    return null;
  }
}

async function sendMail(
  subject: string,
  text: string,
  recipients: string[] = [
    "falconsoftmobile@gmail.com",
    "baldhavansh2505@gmail.com",
    "latuttle22@gmail.com",
  ]
) {
  const mailgunKey = await getMailgunKey();
  if (!mailgunKey) {
    console.warn("Mailgun key not found; skipping sendMail");
    return;
  }

  try {
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({ username: "api", key: mailgunKey });

    await mg.messages.create("swingsocial.co", {
      from: "info@swingsocial.co",
      to: recipients,
      subject,
      text,
    });
  } catch (err) {
    console.error("Failed to send mailgun message:", err);
  }
}

async function sendSuccessEmail(payload: any) {
  const subject = `✅ Event Step-1 Saved — ${
    payload.values?.eventName ?? "Untitled"
  }`;
  const body = `
Event step 1 saved successfully.

Profile ID: ${payload.profileId ?? "N/A"}
Event Name: ${payload.values?.eventName ?? "N/A"}
Category: ${payload.values?.category ?? "N/A"}
Venue: ${payload.values?.venue ?? "N/A"}
Start Time: ${payload.values?.startTime ?? "N/A"}
End Time: ${payload.values?.endTime ?? "N/A"}
Hide Venue: ${payload.values?.hideVenue === 1 ? "Yes" : "No"}
Hide Ticket Option: ${payload.values?.hideTicketOption === 1 ? "Yes" : "No"}
Time: ${new Date().toISOString()}
  `;
  await sendMail(subject, body);
}

async function sendFailureEmail(params: {
  errorMessage?: string;
  stack?: string;
  routeName?: string;
  userId?: any;
  payload?: any;
}) {
  const subject = `🚨 Error in ${params.routeName ?? "step-1 route"}`;
  const body = `
An error occurred:

Route: ${params.routeName ?? "step-1"}
User ID: ${params.userId ?? "N/A"}
Message: ${params.errorMessage ?? "N/A"}
Stack: ${params.stack ?? "No stack trace"}
Payload: ${JSON.stringify(params.payload ?? {}, null, 2)}
Time: ${new Date().toISOString()}
  `;
  await sendMail(subject, body);
}

export async function POST(req: Request) {
  let payload: any = null;
  let profileId: any = null;

  try {
    payload = await req.json();

    profileId = payload.profileId;
    const values = payload.values || {};

    const {
      eventName,
      category,
      startTime,
      endTime,
      venue,
      hideVenue,
      hideTicketOption,
    } = values;

    if (
      !profileId ||
      !eventName ||
      !category ||
      !startTime ||
      !endTime ||
      !venue
    ) {
      const errorMessage =
        "Missing required fields: profileId, eventName, category, startTime, endTime, venue";

      await sendFailureEmail({
        errorMessage,
        routeName: "event-step-1",
        userId: profileId,
        payload: payload,
      });

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const insertQuery = `SELECT * FROM public.event_insert_step_1($1,$2,$3,$4,$5,$6,$7,$8)`;
    const insertValues = [
      profileId,
      eventName,
      startTime,
      endTime,
      category,
      venue,
      hideVenue,
      hideTicketOption,
    ];

    const result = await pool.query(insertQuery, insertValues);

    if (!result || !result.rows || result.rows.length === 0) {
      const errorMessage = "Failed to create event step 1 - No rows returned";

      await sendFailureEmail({
        errorMessage,
        routeName: "event-step-1",
        userId: profileId,
        payload: payload,
      });

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const eventId = result.rows[0]?.event_id || result.rows[0]?.id || "N/A";

    await sendSuccessEmail(payload);

    return NextResponse.json({
      message: "Your event step 1 is created successfully!",
      status: 200,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Database query failed:", error);

    await sendFailureEmail({
      errorMessage: "Sorry, we are unable to process it. Please try again.",
      stack: error?.stack,
      routeName: "event-step-1",
      userId: profileId,
      payload: payload,
    });

    return NextResponse.json({
      message: "Sorry, we are unable to process it. Please try again.",
      status: 500,
      error: String(error?.message ?? error),
    });
  }
}
