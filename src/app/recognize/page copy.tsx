"use client";
import React, { useState, Suspense, useEffect } from "react";
import { Box, Button, Grid, Checkbox, FormControlLabel, Typography } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter, useSearchParams } from "next/navigation";
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';
import { imag } from "@tensorflow/tfjs";
type Params = Promise<{ id: string }>

export default function Recognize() {

  const [id, setId] = useState<string>(''); // State for error messages
  useEffect(() => {
    const getIdFromParam = async () => {
      const data = await fetch("/api/user/recognize", {method: "GET"});
      const pid = await data.json();
      console.log(pid.message);
      const results = [];
      const errors = [];
      const nonimages = []
      for (const msg of pid.message) {
        // console.log(msg);
        try {
          const isBodyPicture = await analyzeImage(msg.Avatar);
          results.push({ imageUrl: msg.Avatar, isBodyPicture });
          if(!isBodyPicture){
            nonimages.push(msg);
          }
        } catch (error) {
          console.error(`Error analyzing image ${msg.Avatar}:`, error);
          // Continue with the next image
          errors.push(msg);
        }
      }
      console.log(results);
      console.log(errors);
      // Send results to the backend
    //   await fetch("/api/user/analyzeResults", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify(results)
    //   });
    }
    getIdFromParam();

  }, []);

  const analyzeImage = async (imageData: string): Promise<boolean> => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Allow cross-origin requests
    img.src = imageData;

    return new Promise((resolve, reject) => {
        img.onload = async () => {
            try {
                const model = await mobilenet.load();
                const predictions = await model.classify(img);

                console.log('Predictions:', predictions);

                // Check if any of the predictions indicate a body picture
                const bodyKeywords = ['person', 'human', 'body', 'diaper', 'nappy', 'napkin', 'brassiere', 'bra', 'bandeau', 'mini', 'head', 'neck', 'shoulder', 'arm', 'elbow', 'forearm', 'wrist', 'hand', 'finger', 'thumb', 'chest', 'back', 'spine', 'waist', 'hip', 'buttock', 'thigh', 'knee', 'leg', 'calf', 'ankle', 'foot', 'toe', 'face', 'eye', 'nose', 'ear', 'mouth', 'cheek', 'chin', 'brow', 'forehead', 'jaw', 'temple', 'lip', 'tongue', 'teeth', 'palate', 'gums', 'abdomen', 'navel', 'rib', 'breast', 'nipple', 'underarm', 'bicep', 'tricep', 'hamstring', 'quadricep', 'scalp', 'hair', 'eyelid', 'eyebrow', 'lash', 'nostril', 'cheekbone', 'jawline', 'neckline', 'collarbone', 'sternum', 'clavicle', 'shoulders', 'upper back', 'lower back', 'lumbar', 'pelvis', 'groin', 'genitals', 'penis', 'scrotum', 'testicle', 'vagina', 'vulva', 'labia', 'clitoris', 'ovary', 'uterus', 'cervix', 'butt', 'gluteus', 'thigh', 'inner thigh', 'knee cap', 'shin', 'heel', 'arch', 'sole', 'instep', 'toenail', 'fingernail', 'knuckle', 'palm', 'back of hand', 'wrist bone', 'elbow joint', 'shoulder blade', 'rotator cuff', 'biceps', 'triceps', 'forearm', 'radius', 'ulna', 'carpal', 'metacarpal', 'phalanges', 'tibia', 'fibula', 'patella', 'femur', 'iliac crest', 'sacrum', 'coccyx', 'muscle', 'tendon', 'ligament', 'cartilage', 'bone', 'skull', 'ribcage'];
                const isBodyPicture = predictions.some(prediction =>
                    bodyKeywords.some(keyword => prediction.className.toLowerCase().includes(keyword))
                );

                resolve(isBodyPicture);
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = (error) => {
            reject(error);
        };
    });
};
  

  const router = useRouter();


  return (
    <div>
        <h1>Recognize</h1>
    </div>
  );
}
