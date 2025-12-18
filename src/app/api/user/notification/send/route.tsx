import { NextRequest, NextResponse } from "next/server";
import { messaging } from "@/lib/firebase/admin";
import { Pool } from "pg";

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
      const res = await messaging.send({
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
