import FormData from "form-data";
import Mailgun from "mailgun.js";

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

export async function POST(req: any) {
  try {
    const result = await pool.query(
      'SELECT * FROM "Configuration" WHERE "ConfigName" = $1',
      ["EmailApi"]
    );

    const mailgunKey = result.rows[0].ConfigValue;
    if (!mailgunKey) {
      throw new Error("MAILGUN_KEY environment variable is not defined");
    }

    const { username, email, code } = await req.json();
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: mailgunKey,
    });

    const emailData: any = {
      from: "info@swingsocial.co",
      to: email,
      subject: "Email Verification",
      text: "Hi " + username,
      html:
        "<html><body><strong>Your email verification code is</strong> " +
        code +
        "</body></html>",
    };

    const data = await mg.messages.create("swingsocial.co", emailData);
    if (!data || !data.id) {
      throw new Error("Failed to send email");
    }
    return NextResponse.json({
      message: "Email is sent successfully",
    });
  } catch (error: any) {
    console.error("Error sending email:", error);

    return NextResponse.json(
      {
        message: "Error sending email",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
