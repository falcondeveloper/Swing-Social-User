import { NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';

const AZURE_STORAGE_CONNECTION_STRING =
  "DefaultEndpointsProtocol=https;AccountName=swingsocialphotos;AccountKey=iDal7a2cNgykrLMjRxm4j6OlhdzJddpT8DuSHKNgcYKc2j2kWAfty4pIWNDn0PD0p0m4k8KHrFe5+AStnpfekg==;EndpointSuffix=core.windows.net";

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerName = "images";
const containerClient = blobServiceClient.getContainerClient(containerName);

export async function POST(req: any) {
  try {
    const formData = await req.formData();

    console.log(formData);
    // Extracting fields
    const pid = formData.get('pid');
    const imageBlob = formData.get('image'); // Assuming this is a File or Blob object

    console.log(imageBlob);

    if (!imageBlob) {
      return NextResponse.json({ message: "Image is required" }, { status: 400 });
    }

    // Generate a unique blob name using the current timestamp
    const blobName = `${Date.now()}_${imageBlob.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log(blobName);

    // Convert the Blob/File object to a buffer for upload
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Uploading the blob
    const uploadResponse = await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: imageBlob.type }, // Set the correct content type
    });

    console.log(`Upload completed successfully. Request ID: ${uploadResponse.requestId}`);

    return NextResponse.json({
      message: "Image uploaded successfully",
      blobName,
      blobUrl: blockBlobClient.url,
    });
  } catch (error: any) {
    console.error("Upload failed:", error);

    return NextResponse.json({
      message: "Image upload failed",
      error: error.message,
    }, { status: 500 });
  }
}
