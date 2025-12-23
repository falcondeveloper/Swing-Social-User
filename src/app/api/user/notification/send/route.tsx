import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import admin from "firebase-admin";

if (!admin.apps.length) {
  const projectId = "swing-social-website-37364";
  const privateKey =
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCtm3iIU1qbsPXU\nbWNj24YbrhrozG / 1flOhprTE4C1zniBpVcFcRmvmsXK / pzqsGmWefHtqvfGcHoPy\nnV5ecp8 + ByAssFveOIKppd3Bt4yPkoo87f2Gd04 / SB0nEkqV9EPiHRsOA4sxTKg4\n6odvLKv + W + oE3r8RDtcQQGW / 4e5KK7TWCcYBzzHL5mBDapXolAXi4segic6PEYqj\n6Yz0pERM4w7MpDDxD32reaUF9IBbEJZH8aIobd9QAo5n / 9ROILRU + rXzaGhiBi5k\nzWTsU + 27of / 7JZ1yOCrN0H5ol8a6hD4C2LzuBus + GSfbE + u9Xx7AgxlorgHv1X9x\nrrCvLNwFAgMBAAECggEAI + 9aADHsv + xdvjZUS9 + tPz6HIGfsxs56xiupIFVc4yE4\niUUwbIbBH / PcEjKt0OD35tnSfBJMGCoy2r3bQkaMkrzL2qQ4p + NfnHkSUV5KcI9 /\nIMSMZVB9uFiXfDZrjOWORZgLuRdfsPkymvFkzkzbXx + sbYyj1QaS2rDRvumntt9E\nrTrPFsmQ6zwLehPZTm3AGUMbM1aMgWD3kD0iUaLsqpwzVbsCS4n0tsiAVTtA + yuC\n7o4YD8s5eo / 6xO + /weghDIhP0liLXs0iUZz8++SLP2hhAq/AcmYAW9FLeis2u4fI\nky + q6jFFoZO7LguqEV + Jczouxx1pCjLVbrQLAndjMQKBgQDhHkmOF4cUQq0u8pDa\nZ2Ir9AmRnlWYxRqrWa8q7PiYY7 + MgFbp46qooKDx2oNzvVUELe8Fzj55mrdtdK0A\njm6EBULDM9uZt / SgI2NqdDsQvXYB9OMp3tjtk0mUdB01KTn3uG8HHPLQaba9MT7h\nz7Gpe + NBL5rLi8FHrMqPWMuSmQKBgQDFbDflE8u9UIP53CJaDpQFEqJcqIW3 + YLo\nlvSYa / LZRuKJKLtyxFtYNBrQSxZZbJd6K + GEfdPsJu2r2HgdBgXAit + jNjTcyuBd\nd + Fne2Yq1DClR8uFeOy7amkI7t7QvCWTv7jwnPsCWMnuThnq0XZ9MGazsRWMsn32\nFiR1dN5kTQKBgQCxs6vSe2YIqz10Aswva06GbaQkC71705Ni0W / Bzb / K42pwKVry\nU + ICLJH / eEMt2LXEj9HPXmfYrDXBNEngV46Lrm9uEYB2zkxPIMA4Zzm81CHUF5A +\nHAhXOV3qzuHDdiCpGDCkh8hwlhJHNBl0PPP8WqwgZ8ikhlRzFMXs8 + X2eQKBgE9U\nAsm7wJxbpAxcVjlVrkiziiYtWT3ptp57OeGdTsHb598xTND68bFpjnSwF1Tre5qN\n01qHrQYxRkNNAka3SsxpgR92ApvNsYYdS6dnQFBpXvqq9K63Pni4c2gxg7rgP0E1\nQrz8dygkQU / Odj + S10fKkRoXSA93EYI2t4Oy6EHpAoGBAI9vgdo0zDBoJqF5nV44\nLDC0qgOiLC77e7V2pcmPZaOggWKxvxKXvkTpsdVoj0OK1nPq2i7ZduiSqdHG9lUi\nCRbqbZs4rBhREHqxXLIaNc + R + xgQ7AbU / qJVKczapl9T9ZoYJgWpqHd58jUvQwF4\nqdS8RksHXTwA97KeJ04hRaAv\n-----END PRIVATE KEY-----\n";
  const clientEmail =
    "firebase-adminsdk-fbsvc@swing-social-website-37364.iam.gserviceaccount.com";

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error("Missing Firebase Admin credentials");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey: privateKey.replace(/\\n/g, "\n"),
      clientEmail,
    }),
  });
}

const pool = new Pool({
  user: "clark",
  host: "199.244.49.83",
  database: "swingsocialdb",
  password: "Bmw740il#$",
  port: 5432,
});

const DEFAULT_PREFERENCES = {
  pushNotifications: true,
  newMatches: true,
  messages: true,
  likes: true,
  requests: false,
  friendRequests: true,
};

async function getUserPreferences(
  userId: string
): Promise<typeof DEFAULT_PREFERENCES> {
  try {
    const result = await pool.query(
      `SELECT preferences 
       FROM notification_preferences 
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length > 0 && result.rows[0].preferences) {
      return { ...DEFAULT_PREFERENCES, ...result.rows[0].preferences };
    }

    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return DEFAULT_PREFERENCES;
  }
}

function isNotificationEnabled(
  preferences: typeof DEFAULT_PREFERENCES,
  type: string
): boolean {
  if (!preferences.pushNotifications) return false;

  switch (type) {
    case "new_match":
      return preferences.newMatches !== false;
    case "message":
      return preferences.messages !== false;
    case "like":
      return preferences.likes !== false;
    case "request":
      return preferences.requests !== false;
    case "friend_request":
      return preferences.friendRequests !== false;
    default:
      return true;
  }
}

function convertDataToStrings(data: any): Record<string, string> {
  const stringData: Record<string, string> = {};

  if (data && typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        stringData[key] = "";
      } else if (typeof value === "string") {
        stringData[key] = value;
      } else if (typeof value === "number" || typeof value === "boolean") {
        stringData[key] = value.toString();
      } else if (typeof value === "object") {
        // Stringify objects and arrays
        stringData[key] = JSON.stringify(value);
      } else {
        stringData[key] = String(value);
      }
    }
  }

  return stringData;
}

async function sendNotificationUUID({
  userId,
  title,
  body,
  type,
  data,
}: {
  userId: any;
  title: any;
  body: any;
  type: any;
  data?: any;
}) {
  const preferences = await getUserPreferences(userId);

  if (!isNotificationEnabled(preferences, type)) {
    return {
      success: false,
      message: `Notification ${type} disabled by user`,
      preferences,
    };
  }

  let deviceTokens: string[] = [];
  try {
    const tokenResult = await pool.query(
      `SELECT devicetoken FROM public.web_get_devicetoken($1)`,
      [userId]
    );
    deviceTokens = tokenResult.rows.map((r) => r.devicetoken).filter(Boolean);
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  if (deviceTokens.length === 0) {
    return { success: false, message: "No device tokens found" };
  }

  const responses: any[] = [];
  const targetUrl = data?.url || "/";

  const stringifiedData = convertDataToStrings({
    url: targetUrl,
    type,
    title,
    body,
    ...data,
  });

  for (const token of deviceTokens) {
    try {
      const res = await admin.messaging().send({
        token,
        notification: { title, body },
        webpush: {
          fcmOptions: { link: targetUrl },
          notification: { icon: "/logo.png" },
        },
        data: stringifiedData,
      });

      responses.push({ token, status: "success", response: res });
    } catch (err: any) {
      responses.push({ token, status: "error", error: err.message });
    }
  }

  return {
    success: true,
    sentTo: deviceTokens.length,
    responses,
  };
}

export async function POST(req: NextRequest) {
  const { userId, title, body, type, data } = await req.json();

  if (!userId) {
    return NextResponse.json({ success: false, error: "userId required" });
  }

  const result = await sendNotificationUUID({
    userId,
    title: title || "SwingSocial",
    body: body || "You have a new notification",
    type: type || "general",
    data,
  });

  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const { userId, notificationType, data } = await req.json();

  if (!userId || !notificationType) {
    return NextResponse.json({
      success: false,
      error: "userId and notificationType required",
    });
  }

  const configMap: Record<string, { title: string; body: string }> = {
    new_match: {
      title: "New Match! 🎉",
      body: `${data?.matchName || "Someone"} matched with you`,
    },
    message: {
      title: "New Message 💬",
      body: data?.preview || "You received a message",
    },
    like: {
      title: "New Like ❤️",
      body: `${data?.likerName || "Someone"} liked you`,
    },
    friend_request: {
      title: "Friend Request 👤",
      body: `${data?.requesterName || "Someone"} sent a friend request`,
    },
    request: {
      title: "New Request 🚀",
      body: `${data?.requesterName || "Someone"} sent a request`,
    },
  };

  const config = configMap[notificationType];

  if (!config)
    return NextResponse.json({ success: false, error: "Invalid type" });

  const result = await sendNotificationUUID({
    userId,
    type: notificationType,
    title: config.title,
    body: config.body,
    data,
  });

  return NextResponse.json(result);
}
