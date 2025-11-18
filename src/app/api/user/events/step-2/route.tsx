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

async function sendSuccessEmail(payload: any, eventId: any) {
  const subject = `✅ Event Step-2 Saved — Event ID: ${eventId}`;
  const body = `
Event step 2 saved successfully.

Profile ID: ${payload.profileId ?? "N/A"}
Event ID: ${eventId ?? "N/A"}
Description: ${payload.values?.description ? "Provided" : "Not provided"}
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
  eventId?: any;
}) {
  const subject = `🚨 Error in ${params.routeName ?? "step-2 route"}`;
  const body = `
An error occurred:

Route: ${params.routeName ?? "step-2"}
User ID: ${params.userId ?? "N/A"}
Event ID: ${params.eventId ?? "N/A"}
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

    const { description } = values;

    if (!profileId) {
      const errorMessage = "Missing required field: profileId";

      await sendFailureEmail({
        errorMessage,
        routeName: "event-step-2",
        userId: profileId,
        payload: payload,
      });

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const updateQuery = `SELECT * FROM public.event_insert_step_2($1, $2)`;
    const updateValues = [profileId, description || null];

    const result = await pool.query(updateQuery, updateValues);

    if (!result || !result.rows || result.rows.length === 0) {
      const errorMessage =
        "Failed to update event step 2 - No event found for this profile or no rows returned";

      await sendFailureEmail({
        errorMessage,
        routeName: "event-step-2",
        userId: profileId,
        payload: payload,
      });

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const eventId = result.rows[0]?.event_id || result.rows[0]?.id;

    await sendSuccessEmail(payload, eventId);

    return NextResponse.json({
      message: "Your event step 2 is updated successfully!",
      status: 200,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Database query failed for step-2:", error);

    await sendFailureEmail({
      errorMessage:
        error?.message ??
        "Sorry, we are unable to process step 2. Please try again.",
      stack: error?.stack,
      routeName: "event-step-2",
      userId: profileId,
      payload: payload,
    });

    return NextResponse.json({
      message: "Sorry, we are unable to process step 2. Please try again.",
      status: 500,
      error: String(error?.message ?? error),
    });
  }
}
