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

		console.log(result.rows[0].ConfigValue);
		const mailgunKey = result.rows[0].ConfigValue;
		if (!mailgunKey) {
			throw new Error("MAILGUN_KEY environment variable is not defined");
		}

		const { userName } = await req.json();
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
			to: userName,
			subject: "Reset Your Password - Swing Social",
			text: "Reset your password",
			html: `
				<html>
					<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
						<h2>Password Reset Request</h2>
						<p>Hello,</p>
						<p>We received a request to reset your password for your Swing Social account.</p>
						<p>To reset your password, please click on the link below:</p>
						<p><a href="https://swing-social-user.vercel.app/reset-password?email=${encodeURIComponent(userName)}" style="padding: 10px 20px; background-color: #FF2D55; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
						<p>If you didn't request this, you can safely ignore this email.</p>
						<p>This link will expire in 24 hours.</p>
						<br>
						<p>Best regards,</p>
						<p>The Swing Social Team</p>
					</body>
				</html>`,
		};

		const data = await mg.messages.create("swingsocial.co", emailData);

		// await client.sendEmail(emailData)
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
