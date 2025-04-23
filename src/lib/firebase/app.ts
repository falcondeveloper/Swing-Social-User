import { getApp, initializeApp } from "firebase/app";

export const app = (() => {
  try {
    return getApp();
  } catch (error) {
    return initializeApp({
      apiKey: "AIzaSyAl9CBhk6JJBCIj-6yOCVdUSQnevgIRSLE",
      authDomain: "swingsocial-1357a.firebaseapp.com",
      projectId: "swingsocial-1357a",
      storageBucket: "swingsocial-1357a.firebasestorage.app",
      messagingSenderId: "1085508120921",
      appId: "1:1085508120921:web:814643ed81f4633c5d5c48",
      measurementId: "G-JPKH2Y414N"
    });
  }
})();