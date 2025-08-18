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
  const { postId, profileId, email, commenterName, profileUsername } =
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
      // Insert like
      result = await pool.query("SELECT * FROM insert_likes_postfn($1, $2)", [
        postId,
        profileId,
      ]);

      // Get Mailgun API key
      const mailResult = await pool.query(
        'SELECT * FROM "Configuration" WHERE "ConfigName" = $1',
        ["EmailApi"]
      );
      const mailgunKey = mailResult.rows[0]?.ConfigValue;
      if (!mailgunKey) {
        throw new Error("Mailgun API key is not defined.");
      }

      // Send Email
      const mailgun = new Mailgun(FormData);
      const mg = mailgun.client({
        username: "api",
        key: mailgunKey,
      });

      const emailData = {
        from: "info@swingsocial.co",
        to: "baldhavansh2505@gmail.com",
        subject: `${commenterName} liked your Whatshot Pic - Swing Social`,
        text: `Hi,\n\n${commenterName} liked your Whatshot pic.\n\nLog in to view.\n\nSwing Social Team`,
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #FF2D55;">${commenterName} liked your Whatshot Pic</h2>
                <p>Hello ${profileUsername}</p>
                <p><strong>${commenterName}</strong> just liked your <strong>Whatshot</strong> post.</p>
                <p>Log in to <a href="https://swing-social-user.vercel.app/" style="color: #FF2D55;">Swing Social</a> to see who’s loving your content!</p>
                <br/>
                <p>Cheers,<br/>The Swing Social Team</p>
              </div>
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
