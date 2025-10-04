import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
function sanitizeCardNumber(cardNumber: any) {
  return parseInt(cardNumber.replace(/\s+/g, ""), 10);
}
export async function POST(req: any) {
  try {
    const {
      cardNumber,
      expiry,
      cvc,
      pprice,
      firstName,
      lastName,
      city,
      state,
      streetAddress,
      zipCode,
    } = await req.json();
    if (!cardNumber || !expiry || !cvc) {
      return NextResponse.json(
        { message: "Missing required card details." },
        { status: 400 }
      );
    }

    const sanitizedonetimePriceWithOutFee = pprice;

    const sanitizedonetimePrice = (
      sanitizedonetimePriceWithOutFee * 1.035
    ).toFixed(2);
    var oneTimeResponseData;
    const oneTimePaymentPayload = {
      createTransactionRequest: {
        merchantAuthentication: {
          name: "5n89FY2Wdn",
          transactionKey: "8dVn289k5xm4WcKe",
        },
        refId: "123456",
        transactionRequest: {
          transactionType: "authCaptureTransaction",
          amount: sanitizedonetimePrice,
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
          },
        },
      },
    };

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

    if (!oneTimeResponse.ok) {
      throw new Error(
        `One-time payment failed: ${
          oneTimeResponseData.messages?.message[0]?.text || "Unknown error"
        }`
      );
    }

    return NextResponse.json({
      message: "One-time payment and subscription created successfully",
      oneTimePaymentResponse: oneTimeResponseData,
      respondCode: oneTimeResponseData?.transactionResponse?.responseCode,
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
