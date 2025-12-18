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

// ==================== BACKGROUND NOTIFICATION ====================
messaging.onBackgroundMessage(function (payload) {
  console.log("📩 Background message:", payload);

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
      payload: JSON.stringify(payload), // Store full payload for foreground
    },
    requireInteraction: false,
    tag: "notification-" + Date.now(),
    vibrate: [200, 100, 200], // Vibration pattern
  };

  self.registration.showNotification(title, options);
});

// ==================== FOREGROUND NOTIFICATION HANDLER ====================
// Note: This is typically in your main app JavaScript, not service worker
// Service worker can't directly handle foreground notifications
// But you can forward them to your app

// This message handler will receive messages when service worker is active
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FOREGROUND_NOTIFICATION") {
    console.log("📱 Service Worker received foreground notification request");

    // If you want to show a notification even in foreground
    const { title, body, data } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: "/logo.png",
      data,
      silent: true, // Don't play sound for foreground
    });
  }
});

// ==================== NOTIFICATION CLICK HANDLER ====================
self.addEventListener("notificationclick", function (event) {
  console.log("🖱️ Notification clicked:", event.notification);

  event.notification.close();

  const clickUrl = event.notification.data?.url || "/";
  const payload = event.notification.data?.payload
    ? JSON.parse(event.notification.data.payload)
    : null;

  const targetUrl = clickUrl.startsWith("http")
    ? clickUrl
    : `${self.location.origin}${clickUrl}`;

  console.log("🔗 Opening URL:", targetUrl);

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a tab open with this URL
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            // Send notification data to the focused window
            client.postMessage({
              type: "NOTIFICATION_CLICKED",
              payload: payload,
              url: clickUrl,
            });
            return client.focus();
          }
        }

        // If no existing tab, open new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl).then((windowClient) => {
            // Send data to new window after it loads
            if (windowClient) {
              windowClient.postMessage({
                type: "NOTIFICATION_CLICKED",
                payload: payload,
                url: clickUrl,
              });
            }
          });
        }
      })
  );
});

// ==================== NOTIFICATION CLOSE HANDLER ====================
self.addEventListener("notificationclose", function (event) {
  console.log("❌ Notification closed:", event.notification);
});
