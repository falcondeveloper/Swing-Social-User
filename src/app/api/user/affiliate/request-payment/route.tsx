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
      affiliateCode,
      yourName,
      businessName,
      makePayableTo,
      email,
      phone,
      countryCode,
      address,
      city,
      state,
      postal,
      country,
      paymentEmail,
      taxIndividual,
      taxBusiness,
    } = data;

    if (!profileId || !affiliateCode || !email || !paymentEmail) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    client = await pool.connect();

    // const checkPending = await client.query(
    //   `
    //   SELECT 1 FROM "AffiliatePaymentRequest"
    //   WHERE "ProfileId" = $1 AND "Status" = 'pending'
    //   LIMIT 1
    //   `,
    //   [profileId]
    // );

    // if (checkPending.rowCount > 0) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "You already have a pending payout request.",
    //     },
    //     { status: 400 }
    //   );
    // }

    // await client.query(
    //   `
    //   INSERT INTO "AffiliatePaymentRequest" (
    //     "ProfileId",
    //     "AffiliateCode",
    //     "YourName",
    //     "BusinessName",
    //     "MakePayableTo",
    //     "Email",
    //     "Phone",
    //     "Address",
    //     "City",
    //     "State",
    //     "Postal",
    //     "Country",
    //     "PaymentEmail",
    //     "TaxIndividual",
    //     "TaxBusiness",
    //     "Status",
    //     "CreatedAt"
    //   )
    //   VALUES (
    //     $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'pending',NOW()
    //   )
    //   `,
    //   [
    //     profileId,
    //     affiliateCode,
    //     yourName,
    //     businessName,
    //     makePayableTo,
    //     email,
    //     phone,
    //     address,
    //     city,
    //     state,
    //     postal,
    //     country,
    //     paymentEmail,
    //     JSON.stringify(taxIndividual || {}),
    //     JSON.stringify(taxBusiness || {}),
    //   ]
    // );

    const configResult = await client.query(
      'SELECT "ConfigValue" FROM "Configuration" WHERE "ConfigName" = $1',
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

    function infoRowDark(label: string, value: string) {
      return `
  <tr>
    <td style="
      padding:8px 0 2px;
      font-size:12px;
      color:#ff9fc9;
      font-weight:600;
    ">
      ${label}
    </td>
  </tr>
  <tr>
    <td style="
      padding:0 0 10px;
      font-size:14px;
      color:#ffffff;
      word-break:break-word;
    ">
      ${value || "-"}
    </td>
  </tr>
  `;
    }

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
            padding:18px 16px;
            text-align:center;
          ">
            <img
              src="${LOGO_URL}"
              alt="SwingSocial"
              width="180"
              style="display:block;margin:0 auto 8px;"
            />

            <div style="font-size:30px;">💖</div>

            <h2 style="
              margin:6px 0 4px;
              font-size:20px;
              font-weight:700;
              color:#ffffff;
            ">
              Affiliate Payout Request
            </h2>

            <p style="margin:0;font-size:13px;opacity:0.95;">
              We’ve received your request successfully
            </p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:18px 16px;">

            <p style="margin-top:0;font-size:14px;">
              Hi <strong>${yourName || "Affiliate"}</strong>,
            </p>

            <p style="color:#d6d6e0;font-size:13px;line-height:1.5;">
              Thank you for submitting your payout request.
              Below is a secure summary of the information you provided.
            </p>

            <!-- DETAILS -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="
                margin-top:14px;
                padding:4px;
              "
            >
              ${infoRowDark("Affiliate Code", affiliateCode)}
              ${infoRowDark("Make Payable To", makePayableTo)}
              ${infoRowDark("Your Name", yourName)}
              ${infoRowDark("Business Name", businessName || "-")}
              ${infoRowDark("Email", email)}
              ${infoRowDark("Payment Email", paymentEmail)}
              ${infoRowDark("Phone", phone)}
              ${infoRowDark(
                "Address",
                `${address}, ${city}, ${state}, ${postal}, ${country}`
              )}
              ${
                makePayableTo === "your"
                  ? infoRowDark(
                      "SSN",
                      `${taxIndividual?.part1 || ""}-${
                        taxIndividual?.part2 || ""
                      }-${taxIndividual?.part3 || ""}`
                    )
                  : ""
              }
              ${
                makePayableTo === "business"
                  ? infoRowDark("Business EIN", taxBusiness?.ein || "-")
                  : ""
              }

            </table>

            <!-- STATUS -->
            <div style="
              margin-top:16px;
              padding:12px;
              background:#16162a;
              border-radius:10px;
              font-size:12px;
              line-height:1.5;
            ">
              You’ll receive updates via your registered email once
              your payout is approved or processed.
            </div>

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
            Need help?
            <a href="mailto:info@swingsocial.co" style="color:#ff5fa2;">
              info@swingsocial.co
            </a>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`;

    await mg.messages.create("swingsocial.co", {
      from: "SwingSocial <info@swingsocial.co>",
      to: [
        "falconsoftmobile@gmail.com",
        "latuttle22@gmail.com",
        "baldhavansh2505@gmail.com",
        email,
      ],
      subject: "Affiliate Payout Request Received 💖",
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: "Payout request submitted successfully.",
    });
  } catch (err: any) {
    console.error("Affiliate Request Payment API error:", err);

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
      } catch (e) {
        console.warn("Failed to release client:", e);
      }
    }
  }
}
