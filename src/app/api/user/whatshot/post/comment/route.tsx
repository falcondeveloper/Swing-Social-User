import { NextResponse } from "next/server";
import { Pool } from "pg";
import Mailgun from "mailgun.js";
export const dynamic = "force-dynamic";
import FormData from "form-data";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw635csi#",
  port: 5432,
});

export async function POST(req: any) {
  try {
    const {
      postId,
      comment,
      profileId,
      email,
      commenterName,
      profileUsername,
    } = await req.json();

    if (
      !postId ||
      !comment ||
      !profileId ||
      !email ||
      !commenterName ||
      !profileUsername
    ) {
      return NextResponse.json(
        { message: "Invalid input data" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT * FROM insert_comments_post_fn($1,$2,$3)",
      [postId, comment, profileId]
    );

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

    const emailData: any = {
      from: "info@swingsocial.co",
      to: email,
      subject: `${commenterName} commented on your Whatshot Pic - Swing Social`,
      text: `Hello,\n\n${commenterName} commented on your Whatshot pic:\n"${comment}"\n\nLog in to reply.\n\nSwing Social Team`,
      html: `
   <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #FF2D55;">${commenterName} commented on your Whatshot Pic</h2>
          <p>Hey ${profileUsername},</p>
          <p><strong>${commenterName}</strong> left a new comment on your <strong>Whatshot</strong> post:</p>
          <blockquote style="border-left: 4px solid #FF2D55; padding-left: 15px; color: #555; font-style: italic;">
            ${comment}
          </blockquote>
          <p>Log in to <a href="https://swing-social-user.vercel.app/" style="color: #FF2D55;">Swing Social</a> to view or respond.</p>
          <br/>
          <p>Cheers,<br/>The Swing Social Team</p>
        </div>
      </body>
    </html>
  `,
    };

    const data = await mg.messages.create("swingsocial.co", emailData);

    if (!data || !data.id) {
      throw new Error("Failed to send email.");
    }
    // return NextResponse.json({
    //   message:
    //     "One-time login code sent successfully. Please check your email.",
    // });

    return NextResponse.json({
      message: "Comment created successfully",
    });
  } catch (error: any) {
    console.error("Error in POST handler:", error);

    return NextResponse.json(
      {
        message: "Comment creation failed",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: any) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { message: "Invalid input data" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT * FROM get_comments_whatshot_post($1)",
      [postId]
    );

    return NextResponse.json({
      message: "Comment Found successfully",
      comments: result?.rows,
    });
  } catch (error: any) {
    console.error("Error in POST handler:", error);

    return NextResponse.json(
      {
        message: "Comment creation failed",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
