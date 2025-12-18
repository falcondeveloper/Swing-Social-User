import { initializeApp, getApps } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBB16_SMij8I2BCG0qU4mtwrkUjov8gZvE",
    authDomain: "swing-social-website-37364.firebaseapp.com",
    projectId: "swing-social-website-37364",
    messagingSenderId: "24751189898",
    appId: "1:24751189898:web:d2a0204a0d6cb75cf66273",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export { app };

export const messaging =
    typeof window !== "undefined" ? getMessaging(app) : null;
