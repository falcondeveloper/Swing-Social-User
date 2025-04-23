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

export const dynamic = "force-dynamic";
function sanitizeCardNumber(cardNumber: any) {
	// Remove all spaces from the card number and ensure it is numeric
	return parseInt(cardNumber.replace(/\s+/g, ""), 10);
}

function getCurrentDateTime() {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

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
		// Parse request body
		var oneTimeResponseData;
		const onetimePrice = "$ 1";
		const {
			country,
			cardNumber,
			expiry,
			cvc,
			price,
			firstName,
			lastName,
			plan,
			length,
			isPromoCode,
			pprice,
			username,
			email,
			city,
			state,
			streetAddress,
			phone,
			zipCode,
			firstMonthFree,
			promocode,
			userid,
		} = await req.json();
		console.log({
			country,
			cardNumber,
			expiry,
			cvc,
			price,
			firstName,
			lastName,
			plan,
			length,
			isPromoCode,
			pprice,
			username,
			email,
			city,
			state,
			streetAddress,
			phone,
			zipCode,
			firstMonthFree,
			promocode,
			userid,
		})
		const currentDate = getCurrentDateTime();
		// const client = new ServerClient('dcd2cc9f-7ac2-4753-bf70-46cb9df05178');
		const mailgun = new Mailgun(FormData);
		const mg = mailgun.client({
			username: "api",
			key: mailgunKey,
			// When you have an EU-domain, you must specify the endpoint:
			// url: "https://api.eu.mailgun.net/v3"
		});

		const htmlBody = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #000000;">
                <h1 style="font-weight: bold; font-size: 18px; margin-bottom: 10px;">Success : Subscription Summary for ${username}</h1>                
                
                <h1 style="font-weight: bold; font-size: 18px; margin: 20px 0 10px;">User Information</h1>                
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
									username || "N/A"
								}</p>    
                <p style="margin: 5px 0;"><strong>Email:</strong> ${
									email || "N/A"
								}</p>   
                <p style="margin: 5px 0;"><strong>Promo Code:</strong> ${
									promocode || "None"
								}</p>
                <p style="margin: 5px 0;"><strong>Membership Price:</strong> ${
									pprice || "N/A"
								}</p>   
                <p style="margin: 5px 0;"><strong>Country:</strong> ${country}</p>
                <p style="margin: 5px 0;"><strong>City:</strong> ${
									city || "N/A"
								}</p>      
                <p style="margin: 5px 0;"><strong>Street Address:</strong> ${
									streetAddress || "N/A"
								}</p>  
                <p style="margin: 5px 0;"><strong>Zip Code:</strong> ${zipCode}</p>
                <p style="margin: 5px 0;"><strong>Card Status:</strong> Successfully Charged</p>        
                <p style="margin: 5px 0;"><strong>Date:</strong> ${currentDate}</p> <!-- Add the current date here -->
            </div>
        `;
		const failedBody = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #000000;">
                <h1 style="font-weight: bold; font-size: 18px; margin-bottom: 10px;">Sorry, we were unable to process your card request for : ${username}</h1>                
                
                <h1 style="font-weight: bold; font-size: 18px; margin: 20px 0 10px;">User Information</h1>                
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
									username || "N/A"
								}</p>    
                <p style="margin: 5px 0;"><strong>Email:</strong> ${
									email || "N/A"
								}</p>      
                <p style="margin: 5px 0;"><strong>Promo Code:</strong> ${
									promocode || "None"
								}</p>
                <p style="margin: 5px 0;"><strong>Membership Price:</strong> ${
                  (promocode || firstMonthFree) ? "1" : (pprice || "N/A")
                }</p>   
                <p style="margin: 5px 0;"><strong>Country:</strong> ${country}</p>
                <p style="margin: 5px 0;"><strong>City:</strong> ${
									city || "N/A"
								}</p>      
                <p style="margin: 5px 0;"><strong>Street Address:</strong> ${
									streetAddress || "N/A"
								}</p>            
                <p style="margin: 5px 0;"><strong>Zip Code:</strong> ${zipCode}</p>     
                <p style="margin: 5px 0;"><strong>Card Status:</strong> Declined</p>  
                <p style="margin: 5px 0;"><strong>Date:</strong> ${currentDate}</p>
            </div>
        `;

		const emailData: any = [
			{
				from: "info@swingsocial.co",
				to: "latuttle22@gmail.com",
				text: "",
				subject: "Subscription Summary",
				html: htmlBody,
			},
			{
				from: "info@swingsocial.co",
				to: "falconsoftmobile@gmail.com",
				text: "",
				subject: "Subscription Summary",
				html: htmlBody,
			},
			{
				from: "info@swingsocial.co",
				to: "smartbigguru@gmail.com",
				text: "",
				subject: "Subscription Summary",
				html: htmlBody,
			},
			{
				from: "info@swingsocial.co",
				to: email,
				text: "",
				subject: "Subscription Summary",
				html: htmlBody,
			},
		];

		const falseData: any = [
			{
				from: "info@swingsocial.co",
				to: "latuttle22@gmail.com",
				text: "",
				subject: "Subscription Summary",
				html: failedBody,
			},
			{
				from: "info@swingsocial.co",
				to: "falconsoftmobile@gmail.com",
				text: "",
				subject: "Subscription Summary",
				html: failedBody,
			},
			{
				from: "info@swingsocial.co",
				to: "smartbigguru@gmail.com",
				text: "",
				subject: "Subscription Summary",
				html: failedBody,
			},
			{
				from: "info@swingsocial.co",
				to: email,
				text: "",
				subject: "Subscription Summary",
				html: failedBody,
			},
		];

		console.log(
			city,
			state,
			streetAddress,
			phone,
			zipCode,
			firstMonthFree,
			isPromoCode,
			promocode
		);
		console.log(length);
		console.log("first month status", firstMonthFree);
		if (!cardNumber || !expiry || !cvc) {
			return NextResponse.json(
				{ message: "Missing required card details." },
				{ status: 400 }
			);
		}

		console.log(price);
		console.log(isPromoCode);
		console.log(pprice);
		const santiziedPrice = price.replace(/^\$/, "");
		const santiziedPromoPrice = pprice.replace(/^\$/, "");
		const santiziedOneTimePrice = onetimePrice.replace(/^\$/, "");

		// const santiziedPrice = (santiziedPriceWithOutFee * 1.035).toFixed(2);
		// const santiziedPromoPrice = (santiziedPromoPriceWithOutFee * 1.035).toFixed(2);
		const startDate = isPromoCode
			? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Start date 30 days later
					.toISOString()
					.split("T")[0]
			: new Date().toISOString().split("T")[0]; // Start date today if no promo code

			const subscriptionPayload = {
				ARBCreateSubscriptionRequest: {
					merchantAuthentication: {
						// name: "8LqpS52cU3n",
						// transactionKey: "5k9VmYfS5aP5332X"
						name: "5n89FY2Wdn",
						transactionKey: "3UrVG248Y3d2VAk5",
					},
					refId: "12345",
					subscription: {
						name: plan,
						paymentSchedule: {
							interval: {
								length: length,
								unit: "months",
							},
							startDate,
							totalOccurrences: "9999",
							trialOccurrences: "0",
						},
						amount: santiziedPrice,
						trialAmount: "0.00",
						payment: {
							creditCard: {
								cardNumber: sanitizeCardNumber(cardNumber),
								expirationDate: expiry,
								cardCode: cvc,
							},
						},
						billTo: {
							firstName: firstName,
							lastName: lastName,
							address: streetAddress,
							city: city,
							state: state,
							zip: zipCode,
							// company: `${username} : ${userid}`,
						},
					},
				},
			};

		if (isPromoCode === true) {
			console.log(
				`${
					promocode == "" && firstMonthFree === false
						? pprice
						: santiziedOneTimePrice
				} will be one-charged and ${pprice} subscription will be created`
			);
			const realamount =
				promocode == "" && firstMonthFree === false
					? pprice
					: santiziedOneTimePrice;

			const oneTimePaymentPayload = {
				createTransactionRequest: {
					merchantAuthentication: {
						// name: "8LqpS52cU3n",
						// transactionKey: "5k9VmYfS5aP5332X"
						name: "5n89FY2Wdn",
						transactionKey: "3UrVG248Y3d2VAk5",
					},
					refId: "123456",
					transactionRequest: {
						transactionType: "authCaptureTransaction",
						// amount: firstMonthFree === true ? santiziedOneTimePrice : santiziedPrice, // One-time payment amount
						amount: realamount,
						payment: {
							creditCard: {
								cardNumber: sanitizeCardNumber(cardNumber),
								expirationDate: expiry,
								cardCode: cvc,
							},
						},
						billTo: {
							firstName: firstName,
							lastName: lastName,
							company: `${username} : ${state}`,
							// company: `${username} : ${userid}`,
							// "phone": phone,
							address: streetAddress,
							city: city,
							state: state,
							zip: zipCode,
						},
					},
				},
			};

			/*------------------- charge --------------------*/
			const oneTimeResponse = await fetch(
				"https://api.authorize.net/xml/v1/request.api",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(oneTimePaymentPayload),
				}
			);

			oneTimeResponseData = await oneTimeResponse.json();

			console.log("Authorize.net Response Code: ", JSON.stringify(oneTimeResponseData))

			if (oneTimeResponseData?.transactionResponse?.responseCode === "1") {
				/*------------------- subscription charge --------------------*/
				const subscriptionResponse = await fetch(
					"https://api.authorize.net/xml/v1/request.api",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(subscriptionPayload),
					}
				);

				const subscriptionResponseData = await subscriptionResponse.json();

				console.log("Authorize.net subscriptionResponseData Code: ", JSON.stringify(subscriptionResponseData))

				try {
					await Promise.all(
						emailData.map((email: any) =>
							mg.messages.create("swingsocial.co", email)
						)
					);
					console.log(`Batch of ${emailData.length} emails sent successfully.`);

					return NextResponse.json({
						message: "One-time payment and subscription created successfully",
						oneTimePaymentResponse: isPromoCode ? oneTimeResponseData : null,
						subscriptionResponse: subscriptionResponseData,
						respondCode: oneTimeResponseData?.transactionResponse?.responseCode,
					});
				} catch (error) {
					throw new Error("There are some errors while processing the email.");
				}
			} else {
				await Promise.all(
					falseData.map((email: any) =>
						mg.messages.create("swingsocial.co", email)
					)
				);
				return NextResponse.json({
					message: "There are some errors on subscription process.",
					oneTimePaymentResponse: isPromoCode ? oneTimeResponseData : null,
					subscriptionResponse: null,
					respondCode: oneTimeResponseData?.transactionResponse?.responseCode,
				});
			}
		} else {
			console.log("promo code is false.");
			const oneTimePaymentPayload = {
				createTransactionRequest: {
					merchantAuthentication: {
						name: "5n89FY2Wdn",
						transactionKey: "3UrVG248Y3d2VAk5",
					},
					refId: "123456",
					transactionRequest: {
						transactionType: "authCaptureTransaction",
						amount:
							firstMonthFree == true
								? santiziedOneTimePrice
								: santiziedPromoPrice, // One-time payment amount
						// amount: santiziedPromoPrice,
						payment: {
							creditCard: {
								cardNumber: sanitizeCardNumber(cardNumber),
								expirationDate: expiry,
								cardCode: cvc,
							},
						},
						billTo: {
							firstName: firstName,
							lastName: lastName,
							// "phone": phone,
							address: streetAddress,
							city: city,
							state: state,
							zip: zipCode,
							company: `${username} - ${state}`,
							// company: `${username} : ${userid}`,
						},
					},
				},
			};

			console.log(oneTimePaymentPayload);

			const oneTimeResponse = await fetch(
				"https://api.authorize.net/xml/v1/request.api",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(oneTimePaymentPayload),
				}
			);

			console.log(oneTimeResponse);
			oneTimeResponseData = await oneTimeResponse.json();
			if (oneTimeResponseData?.transactionResponse?.responseCode === "1") {
				const subscriptionResponse = await fetch(
					"https://api.authorize.net/xml/v1/request.api",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(subscriptionPayload),
					}
				);

				const subscriptionResponseData = await subscriptionResponse.json();

				await Promise.all(
					emailData.map((email: any) =>
						mg.messages.create("swingsocial.co", email)
					)
				);
				console.log(`Batch of ${emailData.length} emails sent successfully.`);

				return NextResponse.json({
					message: "Subscription is created successfully",
					oneTimePaymentResponse: null,
					subscriptionResponse: subscriptionResponseData,
					respondCode: oneTimeResponseData?.transactionResponse?.responseCode,
				});
			} else {
				await Promise.all(
					falseData.map((email: any) =>
						mg.messages.create("swingsocial.co", email)
					)
				);
				return NextResponse.json({
					message: "Subscription is failed!",
					oneTimePaymentResponse: null,
					subscriptionResponse: null,
					respondCode: oneTimeResponseData?.transactionResponse?.responseCode,
				});
			}
		}
	} catch (error: any) {
		console.error("Error:", error);

		return NextResponse.json(
			{
				message: "An error occurred while processing your request",
				error: error.message,
			},
			{ status: 500 }
		);
	}
}
