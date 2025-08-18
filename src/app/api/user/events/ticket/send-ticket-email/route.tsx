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

    const data = await req.json();
    const {
      eventName,
      email,
      eventDescription,
      firstName,
      lastName,
      phone,
      userName,
      ticketName,
      ticketType,
      ticketPrice,
      ticketQuantity,
      country,
      city,
      streetAddress,
      zipCode,
    } = data;

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: mailgunKey,
    });

    const now = new Date();
    const formattedDate = now.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const template = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #1a73e8;">🎟️ Ticket Purchase Confirmation</h2>
        
        <p>Hi ${firstName || "Guest"},</p>
        <p>Thank you for your purchase! You have successfully reserved your ticket for the event below:</p>


        <h3 style="margin: 20px 0 10px;">Your Info</h3>
        <p><strong>Name:</strong> ${firstName || ""} ${lastName || ""}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Username:</strong> ${userName || "N/A"}</p>
        <p><strong>Address:</strong> ${streetAddress || "N/A"}, ${
      city || "N/A"
    }, ${country || "N/A"} - ${zipCode || ""}</p>

        <h3 style="margin: 20px 0 10px;">Event Details</h3>
        <p><strong>Event:</strong> ${eventName}</p>
        ${
          eventDescription
            ? `<p><strong>Description:</strong> ${eventDescription}</p>`
            : ""
        }
        

        <h3 style="margin: 20px 0 10px;">Your Ticket</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f9f9f9;">Description</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f9f9f9;">Type</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f9f9f9;">Price</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f9f9f9;">Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${
                ticketName || "N/A"
              }</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${
                ticketType || "N/A"
              }</td>
              <td style="border: 1px solid #ddd; padding: 8px;">$${parseFloat(
                ticketPrice
              ).toFixed(2)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${
                ticketQuantity || "N/A"
              }</td>
            </tr>
          </tbody>
        </table>

        

        <hr style="margin: 30px 0;" />
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>See you at the event!</p>
        <p style="margin-top: 30px;">The SwingSocial Team</p>
        <p style="font-size: 12px; color: #777; margin-top: 20px;">
          Version: ${formattedDate}
        </p>
      </div>
    `;

    const emailData: any = [
      {
        from: "info@swingsocial.co",
        to: "latuttle22@gmail.com",
        text: "",
        subject: "Your SwingSocial Ticket Purchase Confirmation 🎉",
        html: template,
      },
      {
        from: "info@swingsocial.co",
        to: "falconsoftmobile@gmail.com",
        text: "",
        subject: "Your SwingSocial Ticket Purchase Confirmation 🎉",
        html: template,
      },
      {
        from: "info@swingsocial.co",
        to: "baldhavansh2505@gmail.com",
        text: "",
        subject: "Your SwingSocial Ticket Purchase Confirmation 🎉",
        html: template,
      },
      {
        from: "info@swingsocial.co",
        to: email,
        text: "",
        subject: "Your SwingSocial Ticket Purchase Confirmation 🎉",
        html: template,
      },
    ];

    await Promise.all(
      emailData.map((email: any) => mg.messages.create("swingsocial.co", email))
    );

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
