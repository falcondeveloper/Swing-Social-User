importScripts(
  "https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBB16_SMij8I2BCG0qU4mtwrkUjov8gZvE",
  authDomain: "swing-social-website-37364.firebaseapp.com",
  projectId: "swing-social-website-37364",
  messagingSenderId: "24751189898",
  appId: "1:24751189898:web:d2a0204a0d6cb75cf66273",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, url, icon } = payload.data || {};

  self.registration.showNotification(title || "SwingSocial", {
    body: body || "New notification",
    icon: icon || "/logo.svg",
    badge: "/logo.svg",
    data: { url: url || "/" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if (client.url.includes(url)) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});

self.skipWaiting();
self.clients.claim();
