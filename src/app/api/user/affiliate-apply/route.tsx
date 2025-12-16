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

    const LOGO_URL = "https://swing-social-user.vercel.app/logo.png";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>

<body style="
  margin:0;
  padding:0;
  background:#0b0b12;
  font-family:Arial, Helvetica, sans-serif;
  color:#ffffff;
">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:16px 8px;">
  <tr>
    <td align="center">

      <!-- CARD -->
      <table width="100%" cellpadding="0" cellspacing="0"
        style="
          max-width:560px;
          background:#11111b;
          border-radius:18px;
          overflow:hidden;
          border:1px solid rgba(255,255,255,0.08);
        "
      >

        <!-- HEADER -->
        <tr>
          <td style="
            background:linear-gradient(135deg,#ff5fa2,#ff006e);
            padding:20px 16px;
            text-align:center;
          ">
            <img
              src="${LOGO_URL}"
              alt="SwingSocial"
              width="170"
              style="display:block;margin:0 auto 10px;"
            />

            <div style="font-size:32px;line-height:1;">🎉</div>

            <h2 style="
              margin:8px 0 4px;
              font-size:20px;
              font-weight:700;
              color:#ffffff;
            ">
              Welcome to the Affiliate Program
            </h2>

            <p style="margin:0;font-size:13px;opacity:0.95;">
              Your Swing Social affiliate account is now active
            </p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:20px 18px;">

            <p style="margin-top:0;font-size:14px;">
              Hi <strong>${firstName || ""} ${lastName || ""}</strong>,
            </p>

            <p style="
              color:#d6d6e0;
              font-size:13px;
              line-height:1.6;
              margin-bottom:16px;
            ">
              Thank you for completing your affiliate registration.
              You’re officially part of the <strong>Swing Social Affiliate Program</strong> 💖
            </p>

            <!-- INFO CARD -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="
                background:#16162a;
                border-radius:12px;
                padding:14px;
                margin-bottom:18px;
              "
            >
              <tr>
                <td style="font-size:13px;color:#ff9fc9;font-weight:600;">
                  What you can do now
                </td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#ffffff;line-height:1.6;padding-top:6px;">
                  • Access your affiliate dashboard<br/>
                  • Get your unique referral links<br/>
                  • Track referrals & conversions<br/>
                  • Monitor earnings and payouts
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:18px;">
              <a href="https://swing-social-user.vercel.app/earn-money-referrals"
                 style="
                   display:inline-block;
                   background:linear-gradient(135deg,#ff5fa2,#ff006e);
                   color:#ffffff;
                   text-decoration:none;
                   padding:12px 22px;
                   border-radius:999px;
                   font-size:14px;
                   font-weight:700;
                 ">
                Go to Affiliate Dashboard →
              </a>
            </div>

            <p style="font-size:13px;color:#d6d6e0;line-height:1.6;">
              If you need help getting started, just reply to this email or reach
              us anytime at
              <a href="mailto:info@swingsocial.co" style="color:#ff5fa2;">
                info@swingsocial.co
              </a>.
            </p>

            <p style="margin-top:18px;font-size:13px;">
              With love,<br/>
              <strong>Team SwingSocial 💕</strong>
            </p>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="
            text-align:center;
            padding:12px;
            font-size:11px;
            color:#a0a0b5;
            background:#0b0b12;
          ">
            © ${new Date().getFullYear()} SwingSocial · All rights reserved
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

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
