import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import FormData from "form-data";
import Mailgun from "mailgun.js";
import { Pool } from "pg"; // optional — kept only if you still want to query DB elsewhere

// If you truly don't need DB at all in this file you can remove Pool and its config below.
const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

async function getMailgunKey(): Promise<string | null> {
  try {
    // keep reading the key from DB Configuration table (optional)
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

async function sendSuccessEmail(
  payload: any,
  profileName?: string,
  eventName?: string
) {
  const subject = `✅ Event Step-3 Completed`;
  const values = payload?.values ?? {};
  const body = `
Event step 3 completed successfully.

Profile Name: ${profileName ?? payload.profileName ?? "N/A"}
Event Name: ${eventName ?? values?.eventName ?? "N/A"}
Cover Photo: ${values?.coverPhoto ? "Uploaded" : "Not uploaded"}
Photos: ${Array.isArray(values?.photos) ? values.photos.length : 0} uploaded
Repeat Type: ${values?.repeats?.type ?? "none"}
Repeat Interval: ${values?.repeats?.interval ?? 1}
Stop Condition: ${values?.repeats?.stopCondition ?? "never"}
Until Date: ${values?.repeats?.untilDate ?? "N/A"}
Times: ${values?.repeats?.times ?? 1}
Week Days: ${
    values?.repeats?.weekDays ? JSON.stringify(values.repeats.weekDays) : "N/A"
  }
Month Day: ${values?.repeats?.monthDay ?? 1}
Time: ${new Date().toISOString()}

Full payload:
${JSON.stringify(payload, null, 2)}
  `;
  await sendMail(subject, body);
}

async function sendFailureEmail(params: {
  errorMessage?: string;
  stack?: string;
  routeName?: string;
  userId?: any;
  payload?: any;
  profileName?: any;
  eventName?: any;
}) {
  const subject = `🚨 Error in ${params.routeName ?? "step-3 route"}`;
  const body = `
An error occurred:

Route: ${params.routeName ?? "step-3"}
Profile Name: ${params.profileName ?? params.payload?.profileName ?? "N/A"}
Event Name: ${params.eventName ?? params.payload?.values?.eventName ?? "N/A"}
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
    const profileName = payload.profileName ?? null;
    const values = payload.values || {};

    const {
      coverPhoto = null,
      photos = [],
      repeats = {
        type: "none",
        interval: 1,
        stopCondition: "never",
        untilDate: null,
        times: 1,
        weekDays: Array(7).fill(false),
        monthDay: 1,
      },
    } = values;

    const eventName = values?.eventName ?? null;

    if (!profileId) {
      const errorMessage = "Missing required field: profileId";

      await sendFailureEmail({
        errorMessage,
        routeName: "event-step-3",
        userId: profileId,
        payload,
        profileName,
        eventName,
      });

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // No DB persistence — only send email with context
    await sendSuccessEmail(payload, profileName, eventName);

    return NextResponse.json({
      message: "Your event step 3 is completed and emailed successfully!",
      status: 200,
      data: {
        profileId,
        profileName,
        eventName,
        coverPhoto,
        photos,
        repeats,
      },
    });
  } catch (error: any) {
    console.error("Step-3 process failed:", error);

    await sendFailureEmail({
      errorMessage:
        error?.message ??
        "Sorry, we are unable to process step 3. Please try again.",
      stack: error?.stack,
      routeName: "event-step-3",
      userId: profileId,
      payload,
    });

    return NextResponse.json({
      message: "Sorry, we are unable to process step 3. Please try again.",
      status: 500,
      error: String(error?.message ?? error),
    });
  }
}
