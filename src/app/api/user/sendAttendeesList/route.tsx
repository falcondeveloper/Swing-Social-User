import FormData from "form-data";
import Mailgun from "mailgun.js";
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw635csi#",
  port: 5432,
});

export async function POST(req: Request) {
  try {
    const result = await pool.query(
      'SELECT * FROM "Configuration" WHERE "ConfigName" = $1',
      ["EmailApi"]
    );

    const mailgunKey = result.rows[0]?.ConfigValue;
    if (!mailgunKey) {
      throw new Error("Mailgun API key not configured.");
    }

    const body = await req.json();
    const usernames = body.usernames;

    if (!Array.isArray(usernames) || usernames.length === 0) {
      throw new Error("Usernames must be a non-empty array.");
    }

    const formattedList = usernames
      .map((username: string, index: number) => `${index + 1}. ${username}`)
      .join("<br>");

    const plainList = usernames
      .map((username: string, index: number) => `${index + 1}. ${username}`)
      .join("\n");

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: mailgunKey,
    });

    const emailData = {
      from: "info@swingsocial.co",
      to: "latuttle22@gmail.com",
      cc: "falconsoftmobile@gmail.com",
      subject: `Attendees Usernames List`,
      text: `Here are the usernames of attendees:\n\n${plainList}`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Attendees Usernames List</h2>
            <p>${formattedList}</p>
            <br />
            <p>Best regards,<br/>The Swing Social Team</p>
          </body>
        </html>
      `,
    };

    const data = await mg.messages.create("swingsocial.co", emailData);

    return NextResponse.json({
      message: "Usernames email sent successfully",
      data,
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        message: "Failed to send email",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
