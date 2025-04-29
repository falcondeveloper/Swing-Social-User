import { NextResponse } from 'next/server';
import https from 'https';
import nodeFetch from 'node-fetch';

// Define the type for the response
type UploadResponse = {
  url: string;
  blob: string;
};

// Type guard to check if the response matches the expected structure
function isUploadResponse(obj: any): obj is UploadResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.url === 'string' &&
    typeof obj.blob === 'string'
  );
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image');

    if (!imageFile || !(imageFile instanceof Blob)) {
      return NextResponse.json(
        { message: 'Invalid image file' },
        { status: 400 }
      );
    }

    const newFormData = new FormData();
    newFormData.append('image', imageFile);

    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    // External API URL
    const uploadResponse = await nodeFetch('https://images.andystutor.com', {
      method: 'POST',
      body: newFormData,
      agent: httpsAgent,
    });

    // Parse the JSON response
    const json = await uploadResponse.json();

    // Validate the response
    if (!uploadResponse.ok || !isUploadResponse(json)) {
      console.error("Unexpected upload response:", json);
      return NextResponse.json(
        { message: 'Invalid or failed response from upload server' },
        { status: 500 }
      );
    }

    // Return the success response with both URL and blob
    return NextResponse.json({
      message: 'Image uploaded successfully',
      imageUrl: json.url,
      blobUrl: json.blob
    });

  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { message: 'Image upload failed', error },
      { status: 500 }
    );
  }
}
