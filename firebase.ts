// src/firebase.ts
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
      apiKey: "AIzaSyBYKNIOcbbHKjS2ukuLMlriac7Lu_cw10c",
      authDomain: "swing-social-website.firebaseapp.com",
      projectId: "swing-social-website",
      storageBucket: "swing-social-website.firebasestorage.app",
      messagingSenderId: "620697559766",
      appId: "1:620697559766:web:50d93c8b21d8e79f9f9f77",
      measurementId: "G-BF70P8Z081",
};

// Initialize Firebase
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export default app;