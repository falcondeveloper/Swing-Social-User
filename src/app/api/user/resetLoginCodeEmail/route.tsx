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

export async function POST(req: any) {
  try {
    const { email, code } = await req.json();

    const querybyUserName = `SELECT * FROM public.admin_getoneprofile_by_user($1)`;

    const searchByUser = await pool.query(querybyUserName, [email]);

    if (searchByUser.rows.length == 0) {
      return NextResponse.json({
        success: false,
        message: "No registered users found. Please sign up first!",
      });
    }

    const result = await pool.query(
      'SELECT * FROM "Configuration" WHERE "ConfigName" = $1',
      ["EmailApi"]
    );

    const mailgunKey = result.rows[0]?.ConfigValue;
    if (!mailgunKey) {
      throw new Error("Mailgun API key is not defined.");
    }

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: mailgunKey,
    });

    const emailData: any = {
      from: "info@swingsocial.co",
      to: email,
      subject: "Your One-Time Login Code - Swing Social",
      text: `Hello,\n\nYour one-time login code for Swing Social is: ${code}\n\nEnter this code on the login page to access your account. This code is valid for 10 minutes.\n\nIf you didn’t request this, please ignore this email.`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Your One-Time Login Code</h2>
            <p>Hello,</p>
            <p>Your one-time login code for <strong>Swing Social</strong> is:</p>
            <p style="font-size: 24px; font-weight: bold; color: #FF2D55;">${code}</p>
            <p>Enter this code on the login page to access your account. This code is valid for 10 minutes.</p>
            <p>If you didn’t request this, you can safely ignore this email.</p>
            <br/>
            <p>Best regards,<br/>The Swing Social Team</p>
          </body>
        </html>`,
    };

    const data = await mg.messages.create("swingsocial.co", emailData);

    if (!data || !data.id) {
      throw new Error("Failed to send email.");
    }

    return NextResponse.json({
      message:
        "One-time login code sent successfully. Please check your email.",
    });
  } catch (error: any) {
    console.error("Error sending login code email:", error);

    return NextResponse.json(
      {
        message: "Failed to send login code email.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
