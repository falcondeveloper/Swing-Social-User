importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBB16_SMij8I2BCG0qU4mtwrkUjov8gZvE",
  authDomain: "swing-social-website-37364.firebaseapp.com",
  projectId: "swing-social-website-37364",
  messagingSenderId: "24751189898",
  appId: "1:24751189898:web:d2a0204a0d6cb75cf66273",
  measurementId: "G-JJGVNRTWPY",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("📩 Background message:", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png",
  });
});
