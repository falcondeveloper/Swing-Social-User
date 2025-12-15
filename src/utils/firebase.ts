import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBB16_SMij8I2BCG0qU4mtwrkUjov8gZvE",
    authDomain: "swing-social-website-37364.firebaseapp.com",
    projectId: "swing-social-website-37364",
    messagingSenderId: "24751189898",
    appId: "1:24751189898:web:d2a0204a0d6cb75cf66273",
    measurementId: "G-JJGVNRTWPY",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);