import { NextResponse } from "next/server";
import FormData from "form-data";
import Mailgun from "mailgun.js";
import { Pool } from "pg";
export const dynamic = "force-dynamic";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw635csi#",
  port: 5432,
});

function chunkArray(array: any, size: number) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function POST(req: any) {
  try {
    const result = await pool.query(
      'SELECT * FROM "Configuration" WHERE "ConfigName" = $1',
      ["EmailApi"]
    );

    const mailgunKey = result.rows[0]?.ConfigValue;
    if (!mailgunKey) {
      throw new Error("MAILGUN_KEY environment variable is not defined");
    }

    const { recipients, htmlBody, subject } = await req.json();

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { message: "No recipients found for the selected segment." },
        { status: 400 }
      );
    }

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: mailgunKey,
    });

    const recipientChunks = chunkArray(recipients, 40);
    const emailResults: { email: string; status: string; error?: string }[] =
      [];

    for (const chunk of recipientChunks) {
      const emailBatch = chunk.map((recipient: any) => ({
        from: "info@swingsocial.co",
        to: recipient.Email,
        subject: subject,
        text: "",
        html: htmlBody,
      }));

      await Promise.all(
        emailBatch.map(async (email: any) => {
          try {
            await mg.messages.create("swingsocial.co", email);
            emailResults.push({ email: email.to, status: "success" });
          } catch (error: any) {
            emailResults.push({
              email: email.to,
              status: "failed",
              error: error.message || "Unknown error",
            });
          }
        })
      );
    }

    const totalSent = emailResults.filter((e) => e.status === "success").length;
    const totalFailed = emailResults.filter(
      (e) => e.status === "failed"
    ).length;

    return NextResponse.json({
      message: "Bulk email process completed.",
      totalRecipients: recipients.length,
      totalSent,
      totalFailed,
      failedEmails: emailResults.filter((e) => e.status === "failed"),
    });
  } catch (error: any) {
    console.error("Error sending bulk emails:", error);
    return NextResponse.json(
      {
        message: "Error sending bulk emails",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

async function getEmailList(
  targetSegment: string
): Promise<{ email: string; name: string }[]> {
  try {
    const query = `SELECT * FROM public.admin_getalldata()`;
    const { rows: users } = await pool.query(query);

    let filteredUsers: { email: string; name: string }[] = [];

    switch (targetSegment) {
      case "All":
        filteredUsers = users.map((user: any) => ({
          email: user.Email,
          name: user.Username,
        }));
        break;
      case "Paid Members":
        filteredUsers = users
          .filter((user: any) => parseFloat(user.Price) > 0)
          .map((user: any) => ({
            email: user.Email,
            name: user.Username,
          }));
        break;
      case "Free Members":
        filteredUsers = users
          .filter((user: any) => parseFloat(user.Price) === 0)
          .map((user: any) => ({
            email: user.Email,
            name: user.Username,
          }));
        break;
      case "Legacy Members":
        break;
      case "New Platform Members":
        filteredUsers = users
          .filter((user: any) => user.Username === "Webnew")
          .map((user: any) => ({
            email: user.Email,
            name: user.Username,
          }));
        break;
      default:
        throw new Error(`Invalid target segment: ${targetSegment}`);
    }

    return filteredUsers;
  } catch (error) {
    console.error("Error fetching email list:", error);
    throw new Error("Unable to retrieve email list");
  }
}
