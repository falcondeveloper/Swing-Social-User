import { initializeApp, getApps } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// const firebaseConfig = {
//     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
//     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
//     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
//     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
//     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
// };

const firebaseConfig = {
    apiKey: "AIzaSyBB16_SMij8I2BCG0qU4mtwrkUjov8gZvE",
    authDomain: "swing-social-website-37364.firebaseapp.com",
    projectId: "swing-social-website-37364",
    messagingSenderId: "24751189898",
    appId: "1:24751189898:web:d2a0204a0d6cb75cf66273",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const messaging =
    typeof window !== "undefined" ? getMessaging(app) : null;
