import { NextResponse } from 'next/server';
import https from 'https';
import nodeFetch from 'node-fetch';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface UploadResponse {
  blobName: string;
  blobUrl: string;
}

export async function POST(req: any) {
  try {
    const formData = await req.formData();
    console.log(formData)
    // const imageBlob = formData.get('image');

    // if (!imageBlob || !imageBlob.type.startsWith('image/')) {
    //   return NextResponse.json({ message: "Invalid image file" }, { status: 400 });
    // }

    // // Generate a unique filename using timestamp
    // const fileName = `${Date.now()}_${imageBlob.name || 'uploaded_image'}`;
    // const publicDir = path.join(process.cwd(), 'public', 'swing_images');

    // // Ensure the directory exists
    // if (!existsSync(publicDir)) {
    //   await mkdir(publicDir, { recursive: true });
    // }

    // const filePath = path.join(publicDir, fileName);

    // // Convert the blob to buffer and save locally
    // const buffer = Buffer.from(await imageBlob.arrayBuffer());
    // await writeFile(filePath, buffer);

    // Now sync the file to the external server
    const imageFile = formData.get('image');
    if (!imageFile || !(imageFile instanceof Blob)) {
      return NextResponse.json(
        { message: 'Invalid image file' },
        { status: 400 }
      );
    }

    const contentType = imageFile.type;
    console.log("Content-Type:", contentType);

    const apiEndpoint = 'https://swingsocial.app/api/user/upload'; // External server's upload endpoint
    // const formDataToSync = new FormData();
    // formDataToSync.append('image', new Blob([buffer]), fileName);
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    const uploadResponse = await nodeFetch(apiEndpoint, {
      method: 'POST',
      body: formData,
      agent: httpsAgent
    });

    if (!uploadResponse.ok) {
      const errorResponse = await uploadResponse.json();
      console.error("Upload to external server failed:", errorResponse);
      return NextResponse.json({
        message: "Failed to upload image to external server",
        error: errorResponse,
      }, { status: uploadResponse.status });
    }

    const responseBody = await uploadResponse.json() as UploadResponse;

    // Assuming the external server responds with a URL to the uploaded image
    return NextResponse.json({
      message: "Image uploaded successfully",
      blobName: responseBody.blobName, // Local path for debugging
      blobUrl: responseBody.blobUrl, // External server's URL
    });

  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({
      message: "Image upload failed",
      error: error,
    }, { status: 500 });
  }
}