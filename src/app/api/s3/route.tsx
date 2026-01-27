import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: "AKIAUHA2HZBFNLCGZF3P",
    secretAccessKey: "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",
  },
});

export async function POST(req: Request) {
  const { userId, type } = await req.json();

  const key = `users/${userId}/${type}.jpg`;

  const command = new PutObjectCommand({
    Bucket: "swingsocial-face-verification",
    Key: key,
    ContentType: "image/jpeg",
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60,
  });

  return NextResponse.json({
    ok: true,
    uploadUrl,
    key,
  });
}
