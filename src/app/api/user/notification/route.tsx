import { messaging } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw635csi#",
  port: 5432,
});

export async function POST(req: any, res: any) {
  // Ensure the request is a POST request
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Only POST requests allowed" },
      { status: 405 }
    );
  }

  try {
    // Parse the request body
    const { id, body = "Default Body", image = "https://example.com/path/to/image.jpg", url } = await req.json();
    console.log("Request body:", { id, body, image, url });
    // Fetch device tokens from the database
    const result = await pool.query(
      "SELECT * FROM public.web_get_devicetoken($1)",
      [id]
    );

    console.log("Device tokens result:", result.rows);

    // Check if the result has rows (tokens)
    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        {
          message: "No device tokens found for the given ID.",
        },
        { status: 404 }
      );
    }

    // Prepare responses array to collect results for each token
    const responses = [];

    // Iterate over each row to send a notification
    for (const token of result.rows) {

      // Validate the token
      if (!token) {
        console.warn("Skipping notification for missing or invalid token:", token);
        responses.push({ token: null, status: "error", error: "Invalid token" });
        continue;
      }

      const deviceToken = token?.deviceToken;

      // Prepare the message object
      const message = {
        token: deviceToken, // The FCM token of the recipient device
        notification: {
          title: "Message from SwingSocial", // Notification title
          body: body, // Notification body
        },
        webpush: {
          notification: {
            icon: "https://swingsocialphotos.blob.core.windows.net/images/1738268455860_icon.png",
            image: "https://swingsocialphotos.blob.core.windows.net/images/1738268455860_icon.png",
          },
        },
        android: {
          notification: {
            sound: "default", // Play default sound on Android
            image: "https://swingsocialphotos.blob.core.windows.net/images/1738268455860_icon.png",
          },
        },
        apns: {
          payload: {
            aps: {
              "mutable-content": 1, // Enable Notification Service Extension
            },
          },
          fcm_options: {
            image: "https://swingsocialphotos.blob.core.windows.net/images/1738268455860_icon.png",
          },
        },
        data: {
          url, // Custom data for deep linking or additional information
        //   title, // Custom data for the title
          body, // Custom data for the body
        },
      };

      try {
        // Send the message using Firebase Admin SDK
        const response = await messaging.send(message);
        responses.push({ token, status: "success", response });
      } catch (error: any) {
        console.error("Error sending notification to token:", token, error);
        
        // Delete invalid token from database
        // try {
        //   await pool.query(
        //     "SELECT * FROM public.web_delete_devicetoken($1)",
        //     [deviceToken]
        //   );
        //   console.log(`Deleted invalid token: ${deviceToken}`);
        // } catch (deleteError) {
        //   console.error("Error deleting invalid token:", deleteError);
        // }

        responses.push({ token, status: "error", error: error.message });
      }
    }

    // Return success response with details of sent messages
    return NextResponse.json({
      message: "Notifications processed.",
      results: responses,
    });
  } catch (error: any) {
    // Log and return failure response
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
