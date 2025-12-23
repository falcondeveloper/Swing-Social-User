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
  const title =
    payload.notification?.title || payload.data?.title || "New Notification";

  const clickUrl = payload.fcmOptions?.link || payload.data?.url || "/";

  const options = {
    body:
      payload.notification?.body || payload.data?.body || "You have a message",
    icon: "/logo.png",
    badge: "/logo.png",
    data: {
      url: clickUrl,
    },
    requireInteraction: false,
    tag: "notification-" + Date.now(),
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const clickUrl = event.notification.data?.url || "/";

  const targetUrl = clickUrl.startsWith("http")
    ? clickUrl
    : `${self.location.origin}${clickUrl}`;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
