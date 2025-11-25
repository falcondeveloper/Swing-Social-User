importScripts(
  "https://www.gstatic.com/firebasejs/9.1.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.1.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyBYKNIOcbbHKjS2ukuLMlriac7Lu_cw10c",
  authDomain: "swing-social-website.firebaseapp.com",
  projectId: "swing-social-website",
  storageBucket: "swing-social-website.firebasestorage.app",
  messagingSenderId: "620697559766",
  appId: "1:620697559766:web:50d93c8b21d8e79f9f9f77",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
