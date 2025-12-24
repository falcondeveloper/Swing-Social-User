// firebase-messaging-sw.js
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

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Fixed: removed duplicate 'messaging' parameter
messaging.onBackgroundMessage(async (payload) => {
  const { data } = payload;

  await self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/logo.png",
    data: { url: data.url || "/" },
  });
});

self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification);
  event.notification.close();

  const url = event.notification.data?.url || "/";
  console.log("[SW] Opening URL:", url);

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window with matching URL
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        // Open new window if none found
        return clients.openWindow(url);
      })
  );
});
