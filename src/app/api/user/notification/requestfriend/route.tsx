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

type NotificationType =
  | "new_match"
  | "message"
  | "like"
  | "request"
  | "friend_request";

interface TokenResult {
  token: string;
  tokenPreview: string;
  isValid: boolean;
  sent: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string;
}

function maskToken(token: string): string {
  if (!token || token.length < 20) return "INVALID_TOKEN_FORMAT";
  return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
}

function isInvalidTokenError(error: any): boolean {
  const invalidTokenCodes = [
    "messaging/invalid-registration-token",
    "messaging/registration-token-not-registered",
    "messaging/invalid-argument",
  ];
  return invalidTokenCodes.includes(error?.code);
}

export async function POST(req: NextRequest) {
  try {
    const { userId, title, body, type, url } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const preferencesResult = await pool.query(
      `SELECT preferences 
       FROM notification_preferences 
       WHERE user_id = $1`,
      [userId]
    );

    if (preferencesResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const preferences = preferencesResult.rows[0].preferences || {};

    const notificationEnabled = {
      new_match: preferences.newMatches !== false,
      message: preferences.messages !== false,
      like: preferences.likes !== false,
      request: preferences.requests !== false,
      friend_request: preferences.friendRequests !== false,
    };

    if (preferences.pushNotifications === false) {
      return NextResponse.json({
        success: true,
        message: "Notification skipped - push disabled",
      });
    }

    if (!type || !notificationEnabled[type as NotificationType]) {
      return NextResponse.json({
        success: true,
        message: "Notification skipped - type disabled",
        type,
      });
    }

    const tokenRes = await pool.query(
      "SELECT deviceToken FROM public.web_get_devicetoken($1)",
      [userId]
    );

    if (!tokenRes.rows.length) {
      return NextResponse.json(
        { message: "No device tokens found" },
        { status: 404 }
      );
    }

    const targetUrl = url || "/";
    const notificationTitle = title || "SwingSocial";
    const notificationBody = body || "You have a new notification";

    const tokenResults: TokenResult[] = [];
    let successCount = 0;
    let failureCount = 0;
    let invalidTokenCount = 0;

    for (let i = 0; i < tokenRes.rows.length; i++) {
      const row = tokenRes.rows[i];
      const firebaseToken = row.devicetoken;
      const tokenPreview = maskToken(firebaseToken);
      if (
        !firebaseToken ||
        typeof firebaseToken !== "string" ||
        firebaseToken.length < 100
      ) {
        tokenResults.push({
          token: firebaseToken,
          tokenPreview,
          isValid: false,
          sent: false,
          error: "Invalid token format",
          errorCode: "INVALID_FORMAT",
        });
        failureCount++;
        invalidTokenCount++;
        continue;
      }

      const payload = {
        data: {
          title: notificationTitle,
          body: notificationBody,
          url: targetUrl,
        },
        webpush: {
          fcmOptions: {
            link: targetUrl,
          },
        },
        token: firebaseToken,
      };

      try {
        const messageId = await admin.messaging().send(payload);

        tokenResults.push({
          token: firebaseToken,
          tokenPreview,
          isValid: true,
          sent: true,
          messageId,
        });
        successCount++;
      } catch (error: any) {
        const isInvalid = isInvalidTokenError(error);

        tokenResults.push({
          token: firebaseToken,
          tokenPreview,
          isValid: !isInvalid,
          sent: false,
          error: error.message,
          errorCode: error.code,
        });
        failureCount++;
      }
    }

    await pool.query(
      `INSERT INTO notifications 
        (user_id, type, title, body, url, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, false, NOW())`,
      [
        userId,
        type || "general",
        notificationTitle,
        notificationBody,
        targetUrl,
      ]
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalTokens: tokenRes.rows.length,
        successCount,
        failureCount,
        invalidTokenCount,
      },
      tokenResults: tokenResults.map((r) => ({
        tokenPreview: r.tokenPreview,
        isValid: r.isValid,
        sent: r.sent,
        messageId: r.messageId,
        error: r.error,
        errorCode: r.errorCode,
      })),
      message:
        failureCount === 0
          ? "All notifications sent successfully"
          : `${successCount} sent, ${failureCount} failed`,
    });
  } catch (err: any) {
    console.error(`[ERROR] Unexpected error:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
