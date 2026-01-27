import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.S3_BUCKET_NAME!;

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
});

export async function POST(req: Request) {
  try {
    const { userId, avatarUrl } = await req.json();

    if (!userId || !avatarUrl) {
      return NextResponse.json(
        { ok: false, error: "MISSING_PARAMS" },
        { status: 400 },
      );
    }

    const imgRes = await fetch(avatarUrl);
    if (!imgRes.ok) throw new Error("IMAGE_FETCH_FAILED");

    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const key = `avatars/${userId}.jpg`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
      }),
    );

    return NextResponse.json({
      ok: true,
      key,
      url: `https://swingsocial-face-verification.s3.amazonaws.com/${key}`,
    });
  } catch (error: any) {
    console.error("UPLOAD_AVATAR_ERROR:", error);

    return NextResponse.json(
      { ok: false, error: error.message || "UPLOAD_FAILED" },
      { status: 500 },
    );
  }
}
