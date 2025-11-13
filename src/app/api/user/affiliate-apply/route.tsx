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

export async function POST(req: Request) {
  let client: any = null;
  try {
    const data = await req.json();
    const {
      profileId,
      organizationType,
      companyName,
      firstName,
      lastName,
      email,
      mobilePhone,
      businessPhone,
      address,
      city,
      state,
      zip,
      country,
      website,
      whatsapp,
      paymentMethod,
      paypalEmail,
    } = data;

    if (!profileId || !email) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    client = await pool.connect();

    await client.query(
      `SELECT * FROM apply_affiliate(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17
      )`,
      [
        profileId,
        organizationType,
        companyName,
        firstName,
        lastName,
        email,
        mobilePhone,
        businessPhone,
        address,
        city,
        state,
        zip,
        country,
        website,
        whatsapp,
        paymentMethod,
        paypalEmail,
      ]
    );

    const configResult = await client.query(
      'SELECT * FROM "Configuration" WHERE "ConfigName" = $1',
      ["EmailApi"]
    );

    const mailgunKey = configResult.rows[0]?.ConfigValue;
    if (!mailgunKey) {
      throw new Error("MAILGUN_KEY not found in configuration");
    }

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: mailgunKey,
    });

    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2>Welcome to the SwingSocial Affiliate Program 🎉</h2>
          <p>Hi <strong>${firstName || ""} ${lastName || ""}</strong>,</p>
          <p>Thank you for completing your affiliate registration. Your affiliate account is now active.</p>
          <p>Visit your <strong>Affiliate Dashboard</strong> to:</p>
          <ul>
            <li>Find your referral links</li>
            <li>Track referred users and conversions</li>
            <li>Monitor your earnings and payouts</li>
          </ul>
          <p>If you need help getting started, reply to this email or contact support at <a href="mailto:info@swingsocial.co">info@swingsocial.co</a>.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>Team SwingSocial</strong></p>
          <hr/>
          <p style="font-size: 12px; color: #777;">
            Need help? Contact us anytime at 
            <a href="mailto:info@swingsocial.co">info@swingsocial.co</a>.
          </p>
        </body>
      </html>
    `;

    const recipients = [
      "falconsoftmobile@gmail.com",
      "latuttle22@gmail.com",
      "baldhavansh2505@gmail.com",
      email,
    ];

    await mg.messages.create("swingsocial.co", {
      from: "info@swingsocial.co",
      to: recipients,
      subject: "Welcome to SwingSocial Affiliate Program",
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: "Affiliate application submitted and email sent successfully.",
    });
  } catch (err: any) {
    console.error("Affiliate Apply API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: err?.message,
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseErr) {
        console.warn("Failed to release client:", releaseErr);
      }
    }
  }
}
