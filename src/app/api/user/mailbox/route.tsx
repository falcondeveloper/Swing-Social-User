import { NextResponse } from "next/server";
import { Pool } from "pg";
import FormData from "form-data";
import Mailgun from "mailgun.js";
export const dynamic = "force-dynamic";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

export async function POST(req: any) {
  const { fromId, toId, htmlBody, subject } = await req.json();

  try {
    const chatResult = await pool.query(
      "SELECT * FROM public.insert_mailmessage_push($1, $2, $3, $4)",
      [fromId, toId, subject, htmlBody]
    );

    let recipientEmail: string | null = null;

    // try {
    //   const emailResult = await pool.query(
    //     'SELECT "Email" FROM "Profile" WHERE "Id" = $1 LIMIT 1',
    //     [toId]
    //   );
    //   recipientEmail = emailResult.rows[0]?.Email ?? null;
    // } catch (err) {
    //   console.warn("Could not fetch recipient email from DB:", err);
    //   recipientEmail = null;
    // }

    const configRes = await pool.query(
      'SELECT * FROM "Configuration" WHERE "ConfigName" = $1 LIMIT 1',
      ["EmailApi"]
    );
    const mailgunKey = configRes.rows[0]?.ConfigValue;
    if (!mailgunKey) {
      console.warn(
        "Mailgun key not found in Configuration. Skipping sending email."
      );
      return NextResponse.json({
        message:
          "Chat inserted, but Mailgun API key not found (email not sent).",
        data: chatResult.rows,
      });
    }

    const fallbackRecipients = [
      // "falconsoftmobile@gmail.com",
      "baldhavansh2505@gmail.com",
      // "latuttle22@gmail.com",
    ];
    // const recipients = recipientEmail ? [recipientEmail] : fallbackRecipients;
    const recipients = fallbackRecipients;

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: mailgunKey,
    });

    const textBody = `
      You have a new message from profile ${fromId} to ${toId}

      Subject: ${subject}
      Time: ${new Date().toISOString()}

      Message HTML (preview):
      ${htmlBody}
    `;

    try {
      await mg.messages.create("swingsocial.co", {
        from: "info@swingsocial.co",
        to: recipients,
        subject,
        text: textBody,
        html: htmlBody,
      });
    } catch (mgErr) {
      console.error("Mailgun send error:", mgErr);
      return NextResponse.json({
        message: "Chat inserted, but failed to send email via Mailgun.",
        mailgunError: (mgErr as Error)?.message ?? mgErr,
        data: chatResult.rows,
      });
    }

    return NextResponse.json({
      message: "Chat conversation inserted and email sent successfully",
      data: chatResult.rows,
    });
  } catch (error: any) {
    console.error("Error in /api/user/mailbox POST:", error);

    return NextResponse.json(
      {
        message: "Chat conversation insertion or email sending failed",
        error: error?.message ?? String(error),
      },
      { status: 400 }
    );
  }
}

export async function GET(req: any) {
  const { searchParams } = new URL(req.url);
  const profileid = searchParams.get("profileid");
  const type = searchParams.get("type");

  if (!profileid) {
    return NextResponse.json(
      {
        message: "Profile ID is required",
      },
      { status: 400 }
    );
  }

  try {
    if (type == "received") {
      const result = await pool.query(
        "SELECT * FROM public.get_mailinbox($1)",
        [profileid]
      );

      return NextResponse.json({
        message: "Chats fetched successfully",
        data: result.rows,
      });
    } else if (type == "sent") {
      const result = await pool.query(
        "SELECT * FROM public.get_mailsentbox($1)",
        [profileid]
      );

      return NextResponse.json({
        message: "Chats fetched successfully",
        data: result.rows,
      });
    }
  } catch (error: any) {
    console.error("Error fetching chats:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch chats",
        error: error.message,
      },
      { status: 400 }
    );
  }
}
