// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js"
);

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYKNIOcbbHKjS2ukuLMlriac7Lu_cw10c",
  authDomain: "swing-social-website.firebaseapp.com",
  projectId: "swing-social-website",
  storageBucket: "swing-social-website.firebasestorage.app",
  messagingSenderId: "620697559766",
  appId: "1:620697559766:web:50d93c8b21d8e79f9f9f77",
  measurementId: "G-BF70P8Z081",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification?.title || "New Message";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: payload.notification?.icon || "/logo.png",
    data: {
      url: payload.data?.link || "/",
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      // Check if there's already a window/tab open with the target URL
      for (let client of windowClients) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
