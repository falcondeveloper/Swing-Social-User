import { NextResponse } from "next/server";
import {
  RekognitionClient,
  DetectFacesCommand,
} from "@aws-sdk/client-rekognition";

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION!,
});

export async function POST(req: Request) {
  try {
    const { selfieBase64 } = await req.json();

    if (!selfieBase64) {
      return NextResponse.json(
        { ok: false, reason: "NO_IMAGE" },
        { status: 400 },
      );
    }

    const imageBytes = Buffer.from(selfieBase64, "base64");

    const command = new DetectFacesCommand({
      Image: { Bytes: imageBytes },
      Attributes: ["ALL"],
    });

    const res = await rekognition.send(command);

    if (!res.FaceDetails || res.FaceDetails.length === 0) {
      return NextResponse.json({
        ok: false,
        reason: "NO_FACE_DETECTED",
      });
    }

    if (res.FaceDetails.length > 1) {
      return NextResponse.json({
        ok: false,
        reason: "MULTIPLE_FACES",
      });
    }

    const face = res.FaceDetails[0];

    if (face.Confidence! < 90) {
      return NextResponse.json({
        ok: false,
        reason: "LOW_CONFIDENCE",
        confidence: face.Confidence,
      });
    }

    if (face.Sunglasses?.Value) {
      return NextResponse.json({
        ok: false,
        reason: "SUNGLASSES_NOT_ALLOWED",
      });
    }

    if (face.EyesOpen?.Value === false) {
      return NextResponse.json({
        ok: false,
        reason: "EYES_CLOSED",
      });
    }

    if (
      Math.abs(face.Pose?.Yaw || 0) > 20 ||
      Math.abs(face.Pose?.Pitch || 0) > 20
    ) {
      return NextResponse.json({
        ok: false,
        reason: "FACE_NOT_STRAIGHT",
        pose: face.Pose,
      });
    }

    return NextResponse.json({
      ok: true,
      confidence: face.Confidence,
      smile: face.Smile?.Value,
      pose: face.Pose,
    });
  } catch (error) {
    console.error("Rekognition error:", error);
    return NextResponse.json(
      { ok: false, reason: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
