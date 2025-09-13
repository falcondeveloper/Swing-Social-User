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

    const mailgunKey = result.rows[0]?.ConfigValue;
    if (!mailgunKey) {
      throw new Error("Mailgun API key not found in DB");
    }

    const { errorMessage, stack } = await req.json();
    const mailgun = new Mailgun(FormData);

    const mg = mailgun.client({
      username: "api",
      key: mailgunKey,
    });

    const subject = "🚨 Error in uploadCoverImage";
    const body = `
      An error occurred in uploadCoverImage:

      Message: ${errorMessage}
      Stack: ${stack || "No stack trace provided"}
      Time: ${new Date().toISOString()}
    `;

    const recipients = [
      "falconsoftmobile@gmail.com",
      "info@swingsocial.co",
      "baldhavansh2505@gmail.com",
      "latuttle22@gmail.com",
    ];

    await mg.messages.create("swingsocial.co", {
      from: "info@swingsocial.co",
      to: recipients,
      subject,
      text: body,
    });

    return NextResponse.json({
      message: "Error email sent successfully",
    });
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error sending error email:", error);

    return NextResponse.json(
      {
        message: "Failed to send error email",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
