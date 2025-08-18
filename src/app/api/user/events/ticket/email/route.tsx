import FormData from "form-data"; // form-data v4.0.1
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
import { title } from "process";

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
      eventDescription, // Added event description
      firstName,
      lastName,
      phone,
      userName,
      userPartnerName,
      ticketName,
      ticketType,
      ticketPrice,
      ticketQuantity,
      title,
      country,
      city,
      streetAddress,
      zipCode,
    } = data;
    // const client = new ServerClient('dcd2cc9f-7ac2-4753-bf70-46cb9df05178')
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: mailgunKey,
      // When you have an EU-domain, you must specify the endpoint:
      // url: "https://api.eu.mailgun.net/v3"
    });

    console.log(data);
    // ${ticketType.toLowerCase().includes('couple') ? `<p style="margin: 5px 0;"><strong>Partner Name:</strong> ${userPartnerName || "N/A"}</p>` : ''}

    const template = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h1 style="font-weight: bold; font-size: 18px; margin-bottom: 10px;">${title}</h1>
                <p style="margin: 5px 0;"><strong>Event:</strong> ${eventName}</p>
                
                ${
                  eventDescription
                    ? `
                <h1 style="font-weight: bold; font-size: 18px; margin: 20px 0 10px;">Event Description</h1>
                <div style="margin: 5px 0;">${eventDescription}</div>
                `
                    : ""
                }
                
                <h1 style="font-weight: bold; font-size: 18px; margin: 20px 0 10px;">User Information</h1>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${
                  email || "N/A"
                }</p>
                <p style="margin: 5px 0;"><strong>First Name:</strong> ${
                  firstName || "N/A"
                }</p>
                <p style="margin: 5px 0;"><strong>Last Name:</strong> ${
                  lastName || "N/A"
                }</p>
                <p style="margin: 5px 0;"><strong>Phone:</strong> ${
                  phone || "N/A"
                }</p>
                <p style="margin: 5px 0;"><strong>Username:</strong> ${
                  userName || "N/A"
                }</p>
				
				<p style="margin: 5px 0;"><strong>Country:</strong> ${country || "N/A"}</p>
				<p style="margin: 5px 0;"><strong>City:</strong> ${city || "N/A"}</p>
				<p style="margin: 5px 0;"><strong>Address:</strong> ${
          streetAddress || "N/A"
        }</p>
                
                <h1 style="font-weight: bold; font-size: 18px; margin: 20px 0 10px;">Ticket Details</h1>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4; text-align: left;">Description</th>
							<th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4; text-align: left;">Type</th>
                            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4; text-align: left;">Price</th>
                            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4; text-align: left;">Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">${
                              ticketName || "N/A"
                            }</td>
							<td style="border: 1px solid #ddd; padding: 8px;">${ticketType || "N/A"}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${
                              `$${parseInt(ticketPrice).toFixed(2)}` || "N/A"
                            }</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${
                              ticketQuantity || "N/A"
                            }</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

    const emailData: any = [
      {
        from: "info@swingsocial.co",
        to: "latuttle22@gmail.com",
        text: "",
        subject: "Ticket and UserDetail Summary",
        html: template,
      },
      {
        from: "info@swingsocial.co",
        to: "falconsoftmobile@gmail.com",
        text: "",
        subject: "Ticket and UserDetail Summary",
        html: template,
      },
      {
        from: "info@swingsocial.co",
        to: "smartbigguru@gmail.com",
        text: "",
        subject: "Ticket and UserDetail Summary",
        html: template,
      },
      {
        from: "info@swingsocial.co",
        to: email,
        text: "",
        subject: "Ticket and UserDetail Summary",
        html: template,
      },
    ];

    // await client.sendEmailBatch(emailData)
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
