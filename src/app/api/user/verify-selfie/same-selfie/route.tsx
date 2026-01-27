import { NextResponse } from "next/server";
import {
  RekognitionClient,
  CompareFacesCommand,
  DetectFacesCommand,
} from "@aws-sdk/client-rekognition";

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION!,
});

const BUCKET = process.env.S3_BUCKET_NAME!;

export async function POST(req: Request) {
  console.log("🔥 VERIFY-SELFIE API HIT");
  try {
    const body = await req.json();
    const { avatarKey, selfieKey, userId } = body;

    if (!avatarKey || !selfieKey) {
      return NextResponse.json(
        {
          ok: false,
          reason: "MISSING_S3_KEYS",
          message: "avatarKey and selfieKey are required",
        },
        { status: 400 },
      );
    }

    /* ----------------------------------
       1️⃣ DETECT FACE ON SELFIE
    ---------------------------------- */

    const detectResponse = await rekognitionClient.send(
      new DetectFacesCommand({
        Image: {
          S3Object: {
            Bucket: BUCKET,
            Name: selfieKey,
          },
        },
        Attributes: ["ALL"],
      }),
    );

    const faces = detectResponse.FaceDetails ?? [];

    if (faces.length === 0) {
      return NextResponse.json({
        ok: false,
        reason: "NO_FACE_DETECTED",
        message: "No face detected in selfie image",
      });
    }

    if (faces.length > 1)
      return NextResponse.json({
        ok: false,
        message: "Multiple faces detected",
      });

    const face = faces[0];

    if (face.EyesOpen?.Value === false)
      return NextResponse.json({
        ok: false,
        message: "Eyes are closed in selfie",
      });

    if (face.Sunglasses?.Value)
      return NextResponse.json({
        ok: false,
        message: "Sunglasses detected",
      });

    if (face.Confidence && face.Confidence < 90)
      return NextResponse.json({
        ok: false,
        message: `Low face confidence (${face.Confidence.toFixed(1)}%)`,
      });

    /* ----------------------------------
       2️⃣ COMPARE FACES (Avatar vs Selfie)
    ---------------------------------- */

    const compare = await rekognitionClient.send(
      new CompareFacesCommand({
        SourceImage: {
          S3Object: {
            Bucket: BUCKET,
            Name: avatarKey,
          },
        },
        TargetImage: {
          S3Object: {
            Bucket: BUCKET,
            Name: selfieKey,
          },
        },
        SimilarityThreshold: 70,
      }),
    );

    const match = compare.FaceMatches?.[0];

    if (!match)
      return NextResponse.json({
        ok: false,
        message: "Face does not match avatar",
        similarity: 0,
      });

    /* ----------------------------------
       3️⃣ SUCCESS
    ---------------------------------- */

    return NextResponse.json({
      ok: true,
      match: true,
      similarity: match.Similarity,
      confidence: match.Face?.Confidence,
      userId,
    });
  } catch (err: any) {
    console.error("AWS ERROR:", err);

    return NextResponse.json(
      {
        ok: false,
        message: err.name || err.message || "AWS Rekognition failed",
        aws: err,
      },
      { status: 500 },
    );
  }
}
