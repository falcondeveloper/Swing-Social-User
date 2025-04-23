import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js";

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
	user: "clark",
	host: "199.244.49.83",
	database: "swingsocialdb",
	password: "Bmw635csi#",
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

		const { email, htmlBody, subject } = await req.json();
		// const client = new ServerClient('dcd2cc9f-7ac2-4753-bf70-46cb9df05178')
		const mailgun = new Mailgun(FormData);
		const mg = mailgun.client({
			username: "api",
			key: mailgunKey,
			// When you have an EU-domain, you must specify the endpoint:
			// url: "https://api.eu.mailgun.net/v3"
		});

		const emailData: any = {
			from: "info@swingsocial.co",
			to: email,
			text: "",
			subject: subject,
			html: htmlBody,
		};

		// await client.sendEmail(emailData)
		const data = await mg.messages.create("swingsocial.co", emailData);
		console.log(data);
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
