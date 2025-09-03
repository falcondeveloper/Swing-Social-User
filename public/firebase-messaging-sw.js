importScripts(
  "https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyB0ZCpDgqTNoxnplSIlK7k6JdwRDV9gs9g",
  authDomain: "swing-social-28101.firebaseapp.com",
  projectId: "swing-social-28101",
  storageBucket: "swing-social-28101.appspot.com",
  messagingSenderId: "1024693141412",
  appId: "1:1024693141412:web:da069d79d24114358ccb31",
  measurementId: "G-0XD9GR0VE9",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, image } = payload.notification || {};
  const notificationTitle = title || "Default Title";
  const notificationOptions = {
    body: body || "Default Body",
    icon: icon || image || "/logo.png",
    data: {
      link:
        payload?.data?.link || "https://swing-social-user.vercel.app/messaging",
    },
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    const payload = event.data.payload;
    const { title, body, icon, image } = payload.notification || {};
    const notificationTitle = title || "New Notification";
    const notificationOptions = {
      body: body || "You got a message",
      icon: icon || image || "/logo.png",
      requireInteraction: true,
      data: {
        link: payload?.data?.link || "/",
      },
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
