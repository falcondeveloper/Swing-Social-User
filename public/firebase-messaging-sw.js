importScripts(
  "https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyBB16_SMij8I2BCG0qU4mtwrkUjov8gZvE",
  authDomain: "swing-social-website-37364.firebaseapp.com",
  projectId: "swing-social-website-37364",
  storageBucket: "swing-social-website-37364.firebasestorage.app",
  messagingSenderId: "24751189898",
  appId: "1:24751189898:web:d2a0204a0d6cb75cf66273",
};

const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);

messaging.onBackgroundMessage(messaging, async (payload) => {
  const { notification, data } = payload;
  const notificationOptions = {
    body: notification?.body,
    icon: "/logo.png",
    data: { url: data?.url || "/" },
  };

  await self.registration.showNotification(
    payload.notification.title,
    notificationOptions
  );
});

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url;
  if (url) {
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url === url && "focus" in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});
