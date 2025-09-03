import { messaging } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

export async function POST(req: any, res: any) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Only POST requests allowed" },
      { status: 405 }
    );
  }

  try {
    const {
      id,
      body = "Default Body",
      image = "https://example.com/path/to/image.jpg",
      url,
    } = await req.json();

    const result = await pool.query(
      "SELECT * FROM public.web_get_devicetoken($1)",
      [id]
    );
    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        {
          message: "No device tokens found for the given ID.",
        },
        { status: 404 }
      );
    }

    const responses = [];
    for (const token of result.rows) {
      if (!token) {
        responses.push({
          token: null,
          status: "error",
          error: "Invalid token",
        });
        continue;
      }

      const deviceToken = token?.deviceToken;

      const message = {
        token: deviceToken,
        notification: {
          title: "Message from SwingSocial",
          body: body,
        },
        webpush: {
          notification: {
            icon: "https://swingsocialphotos.blob.core.windows.net/images/1738268455860_icon.png",
            image:
              "https://swingsocialphotos.blob.core.windows.net/images/1738268455860_icon.png",
          },
        },
        android: {
          notification: {
            sound: "default",
            image:
              "https://swingsocialphotos.blob.core.windows.net/images/1738268455860_icon.png",
          },
        },
        apns: {
          payload: {
            aps: {
              "mutable-content": 1, // Enable Notification Service Extension
            },
          },
          fcm_options: {
            image:
              "https://swingsocialphotos.blob.core.windows.net/images/1738268455860_icon.png",
          },
        },
        data: {
          url,
          body,
        },
      };

      try {
        // Send the message using Firebase Admin SDK
        const response = await messaging.send(message);
        responses.push({ token, status: "success", response });
      } catch (error: any) {
        console.error("Error sending notification to token:", token, error);

        responses.push({ token, status: "error", error: error.message });
      }
    }

    // Return success response with details of sent messages
    return NextResponse.json({
      message: "Notifications processed.",
      results: responses,
    });
  } catch (error: any) {
    console.error("Error processing notifications:", error);
    return NextResponse.json(
      {
        message: "Failed to process notifications",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
