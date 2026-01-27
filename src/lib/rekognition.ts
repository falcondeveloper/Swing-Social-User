import {
    RekognitionClient,
    CompareFacesCommand,
} from "@aws-sdk/client-rekognition";

export const rekognitionClient = new RekognitionClient({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const compareFaces = async (
    sourceImage: Buffer,
    targetImage: Buffer
) => {
    const command = new CompareFacesCommand({
        SourceImage: { Bytes: sourceImage },
        TargetImage: { Bytes: targetImage },
        SimilarityThreshold: 90,
    });

    return rekognitionClient.send(command);
};
