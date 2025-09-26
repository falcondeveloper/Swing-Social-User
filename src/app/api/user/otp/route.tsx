import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, countryCode } = await req.json();

    const url = `https://cpaas.messagecentral.com/verification/v3/send?countryCode=${countryCode}&customerId=C-1D4F8A32EDDC472&flowType=SMS&mobileNumber=${phone}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        authToken:
          "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLTFENEY4QTMyRUREQzQ3MiIsImlhdCI6MTc1NzYxMTQzNSwiZXhwIjoxOTE1MjkxNDM1fQ.NLmhw0JVFonwwSWBrQj4Sg4m1V1xhGjkZEFeru8HNbBaIbnzcwMpjaxnldccWHqQu4xQ1p3lxhOe07kB2cgBrQ",
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { message: "Failed to send OTP" },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const countryCode = searchParams.get("countryCode");
    const mobileNumber = searchParams.get("mobileNumber");
    const verificationId = searchParams.get("verificationId");
    const code = searchParams.get("code");

    if (!countryCode || !mobileNumber || !verificationId || !code) {
      return NextResponse.json(
        { message: "Missing required query params" },
        { status: 400 }
      );
    }

    const url = `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=${countryCode}&mobileNumber=${mobileNumber}&verificationId=${verificationId}&customerId=C-1D4F8A32EDDC472&code=${code}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        authToken:
          "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLTFENEY4QTMyRUREQzQ3MiIsImlhdCI6MTc1NzYxMTQzNSwiZXhwIjoxOTE1MjkxNDM1fQ.NLmhw0JVFonwwSWBrQj4Sg4m1V1xhGjkZEFeru8HNbBaIbnzcwMpjaxnldccWHqQu4xQ1p3lxhOe07kB2cgBrQ",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { message: "Failed to verify OTP" },
      { status: 400 }
    );
  }
}
