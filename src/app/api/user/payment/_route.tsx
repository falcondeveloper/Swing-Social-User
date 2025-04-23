import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
function sanitizeCardNumber(cardNumber: any) {
    // Remove all spaces from the card number and ensure it is numeric
    return parseInt(cardNumber.replace(/\s+/g, ''), 10);
}
export async function POST(req: any) {
    try {
        // Parse request body
        const onetimePrice = "$ 1";
        const { cardNumber, expiry, cvc, price, firstName, lastName, plan, unit, isPromoCode } = await req.json();

        if (!cardNumber || !expiry || !cvc) {
            return NextResponse.json(
                { message: "Missing required card details." },
                { status: 400 }
            );
        }

        const sanitizedonetimePrice = onetimePrice.replace(/^\$/, "");
        const santiziedPrice = price.replace(/^\$/, "");
        console.log("one time payment");
        console.log(santiziedPrice);
        var oneTimeResponseData;
        // If promo code is provided, process one-time payment first
        if (isPromoCode) {
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
                        amount: sanitizedonetimePrice, // One-time payment amount
                        payment: {
                            creditCard: {
                                cardNumber: sanitizeCardNumber(cardNumber),
                                expirationDate: expiry,
                                cardCode: cvc,
                            },
                        },
                        billTo: {
                            firstName,
                            lastName,
                        },
                    },
                },
            };

            // Make the API call for one-time payment
            const oneTimeResponse = await fetch("https://api.authorize.net/xml/v1/request.api", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(oneTimePaymentPayload),
            });
            console.log(oneTimePaymentPayload);
            oneTimeResponseData = await oneTimeResponse.json();

            if (!oneTimeResponse.ok) {
                throw new Error(`One-time payment failed: ${oneTimeResponseData.messages?.message[0]?.text || "Unknown error"}`);
            }

            console.log("One-time payment successful:", oneTimeResponseData);
        }

        // Determine the start date for the subscription
        const startDate = isPromoCode
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Start date 30 days later
                .toISOString()
                .split("T")[0]
            : new Date().toISOString().split("T")[0]; // Start date today if no promo code

        // Proceed with subscription
        const subscriptionPayload = {
            ARBCreateSubscriptionRequest: {
                merchantAuthentication: {
                    // name: "8LqpS52cU3n",
                    // transactionKey: "5k9VmYfS5aP5332X"
                    name: "5n89FY2Wdn",
                    transactionKey: "3UrVG248Y3d2VAk5",
                },
                refId: "123456",
                subscription: {
                    name: plan,
                    paymentSchedule: {
                        interval: {
                            length: "1",
                            unit: unit || "months",
                        },
                        startDate,
                        totalOccurrences: "12",
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
                        firstName,
                        lastName,
                    },
                },
            },
        };

        // Make the API call for subscription
        const subscriptionResponse = await fetch("https://api.authorize.net/xml/v1/request.api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(subscriptionPayload),
        });

        const subscriptionResponseData = await subscriptionResponse.json();

        if (!subscriptionResponse.ok) {
            throw new Error(`Subscription failed: ${subscriptionResponseData.messages?.message[0]?.text || "Unknown error"}`);
        }

        console.log("Subscription created successfully:", subscriptionResponseData);
        console.log("Onetime code", oneTimeResponseData?.messages?.message[0]?.code);

        // Respond with success
        return NextResponse.json({
            message: "One-time payment and subscription created successfully",
            oneTimePaymentResponse: isPromoCode ? oneTimeResponseData : null,
            subscriptionResponse: subscriptionResponseData,
            respondCode: oneTimeResponseData?.transactionResponse?.responseCode
        });
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

