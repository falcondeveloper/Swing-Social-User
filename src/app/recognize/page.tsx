"use client";
import React, { useState, useEffect } from 'react';

const ImaggaHumanDetector = () => {
  const [results, setResults] = useState<Record<string, boolean | 'Error'>>({});
  const [falseImages, setFalseImages] = useState<{ Avatar: string }[]>([]);
  const API_KEY = 'acc_cfdca280a8c45bc';
  const API_SECRET = '4d4ed1974040a5437c24b19fea78bb8d';
  const BASE_URL = 'https://api.imagga.com/v2';

  const fetchImageTags = async (imageUrl: string) => {
    const url = `${BASE_URL}/tags?image_url=${encodeURIComponent(imageUrl)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(`${API_KEY}:${API_SECRET}`),
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) throw new Error('Network response was not ok');

    const data = await response.json();
    return data.result.tags;
  };

  useEffect(() => {
    const checkImages = async () => {
      try {
        const data = await fetch("/api/user/recognize", { method: "GET" });
        const pid = await data.json();
        console.log(pid.message);

        const newResults: Record<string, boolean | 'Error'> = {};
        const newFalseImages: { Avatar: string }[] = [];
        const limitedMessages = pid.message.slice(270, 335);
        for (const msg of limitedMessages) {
          try {
            const tags = await fetchImageTags(msg.Avatar);
            const hasHuman = tags.some((tag: any) =>
              ['person', 'people', 'man', 'woman', 'child', 'boy', 'girl'].includes(tag.tag.en)
            );
            console.log("result", hasHuman)
            newResults[msg.Avatar] = hasHuman;
            if (!hasHuman) {
              newFalseImages.push({ Avatar: msg.Avatar });
            }
          } catch (error) {
            console.error(`Error processing image ${msg.Avatar}:`, error);
            newResults[msg.Avatar] = 'Error';
          }
        }
        console.log(newFalseImages)
        setResults(newResults);
        setFalseImages(newFalseImages);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };
    checkImages();
  }, []);

  return (
    <div style={{color:"white"}}>
      <h2>Human Detection Results:</h2>
      <ul>
        {Object.entries(results).map(([image, result]) => (
          <li key={image}>
            {image}: {result === true ? 'Human detected' : result === false ? 'No human detected' : 'Error'}
          </li>
        ))}
      </ul>
      <h2>False Images:</h2>
      <ul>
        {falseImages.map((img, index) => (
          <li key={index}>
            {img.Avatar}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImaggaHumanDetector;