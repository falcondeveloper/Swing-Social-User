import { NextResponse } from "next/server";
import { Pool } from "pg";
import Mailgun from "mailgun.js";
import FormData from "form-data";

export const dynamic = "force-dynamic";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

export async function POST(req: any) {
  const { postId, profileId, commenterName, profileUsername, email } =
    await req.json();

  let result;

  try {
    const isLikeResult = await pool.query(
      "SELECT * FROM whatshot_profile_like_dupecheck($1, $2)",
      [postId, profileId]
    );

    const isPostedResult = await pool.query(
      "SELECT * FROM whatshot_postowner_check($1, $2)",
      [postId, profileId]
    );

    const isLiked = isLikeResult.rows[0].LikeExists;
    const isPosted = isPostedResult.rows[0].PostedByProfile;

    if (isLiked == 0 && isPosted == 0) {
      result = await pool.query("SELECT * FROM insert_likes_postfn($1, $2)", [
        postId,
        profileId,
      ]);

      const mailResult = await pool.query(
        'SELECT * FROM "Configuration" WHERE "ConfigName" = $1',
        ["EmailApi"]
      );
      const mailgunKey = mailResult.rows[0]?.ConfigValue;
      if (!mailgunKey) {
        throw new Error("Mailgun API key is not defined.");
      }

      const mailgun = new Mailgun(FormData);
      const mg = mailgun.client({
        username: "api",
        key: mailgunKey,
      });

      const postUrl = `https://swing-social-user.vercel.app/whatshot/post/detail/${postId}`;

      const emailData = {
        from: "info@swingsocial.co",
        to: email,
        subject: `${commenterName} liked your Whatshot Pic - Swing Social`,
        text: `${commenterName} liked your Whatshot pic. View it here: ${postUrl}`,
        html: `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        /* mobile styles (many clients ignore but helpful where supported) */
        @media only screen and (max-width:480px) {
          .container { width:100% !important; padding:12px !important; }
          .content { padding:16px !important; }
          .hero { font-size:20px !important; }
          .btn { width:100% !important; display:block !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
      <!-- Preheader (hidden in inbox but shown in preview snippets) -->
      <div style="display:none;max-height:0px;overflow:hidden;color:#f3f4f6;line-height:1px;max-width:0px;opacity:0;">
        ${commenterName} liked your Whatshot post — view it now on Swing Social.
      </div>

      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:24px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="width:600px;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08);">
              <!-- Header / Logo -->
              <tr>
                <td style="background: linear-gradient(90deg,#ff6b7a,#ff2d55); padding:18px 24px; text-align:left;">
                  <a href="https://swing-social-user.vercel.app" style="text-decoration:none;color:#ffffff;font-weight:700;font-size:18px;">
                    Swing Social
                  </a>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td class="content" style="padding:24px 32px 18px;">
                  <h1 class="hero" style="margin:0 0 12px;font-size:22px;color:#111827;">
                    ${commenterName} liked your Whatshot Pic
                  </h1>

                  <p style="margin:0 0 14px;color:#374151;font-size:14px;">
                    Hello <strong>${profileUsername}</strong>,
                  </p>

                  <p style="margin:0 0 18px;color:#374151;font-size:14px;line-height:1.5;">
                    <strong>${commenterName}</strong> just liked one of your <strong>Whatshot</strong> posts. Click the button below to view the post and see who liked it.
                  </p>

                  <!-- Post preview (optional placeholder) -->
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
                    <tr>
                      <td style="padding:0;">
                        <div style="background:#f9fafb;border:1px solid #eef2f7;border-radius:8px;padding:12px;font-size:13px;color:#6b7280;">
                          Post ID: <code style="background:#ffffff;padding:2px 6px;border-radius:4px;border:1px solid #eef2f7;font-size:12px;color:#111827;">${postId}</code>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <p style="margin:0 0 6px;">
                    <a href="${postUrl}" class="btn" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#FF2D55;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">
                      View your post
                    </a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `,
      };

      const data = await mg.messages.create("swingsocial.co", emailData);
      if (!data?.id) {
        throw new Error("Failed to send email.");
      }
    }

    return NextResponse.json({
      message:
        isLiked == 0 && isPosted == 0
          ? "Post liked & email sent"
          : "Like skipped",
      likeExist: isLiked,
      PostedByProfile: isPosted,
    });
  } catch (error: any) {
    console.error("Error liking post:", error);
    return NextResponse.json(
      {
        message: "Post Like failed",
        error: error.message || "Unknown error",
      },
      { status: 400 }
    );
  }
}
