importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAl9CBhk6JJBCIj-6yOCVdUSQnevgIRSLE",
      authDomain: "swingsocial-1357a.firebaseapp.com",
      projectId: "swingsocial-1357a",
      storageBucket: "swingsocial-1357a.firebasestorage.app",
      messagingSenderId: "1085508120921",
      appId: "1:1085508120921:web:814643ed81f4633c5d5c48",
      measurementId: "G-JPKH2Y414N"
};

firebase.initializeApp(firebaseConfig);

class CustomPushEvent extends Event {
    constructor(data) {
        super('push');

        Object.assign(this, data);
        this.custom = true;
    }
}

/*
 * Overrides push notification data, to avoid having 'notification' key and firebase blocking
 * the message handler from being called
 */
self.addEventListener('push', (e) => {
    // Skip if event is our own custom event
    if (e.custom) return;

    // Keep old event data to override
    const oldData = e.data;

    // Create a new event to dispatch
    const newEvent = new CustomPushEvent({
        data: {
            ehheh: oldData.json(),
            json() {
                const newData = oldData.json();
                newData.data = {
                    ...newData.data,
                    ...newData.notification,
                };
                delete newData.notification;
                return newData;
            },
        },
        waitUntil: e.waitUntil.bind(e),
    });

    // Stop event propagation
    e.stopImmediatePropagation();

    // Dispatch the new wrapped event
    dispatchEvent(newEvent);
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const { title = 'Default Title', body = 'Default Body', image, icon, ...restPayload } = payload?.data || {};
    const notificationOptions = {
        body,
        icon: image || '/logo.png', // path to your "fallback" firebase notification logo
        url: "https://swing-social-website.vercel.app/messaging",
        data: restPayload,
    };

    return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    const link = event?.notification?.data?.link;
    console.log("event`s notification", event.notification.data);

    event.notification.close(); // Close the notification first
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If the link is already open, focus on it
            for (const client of clientList) {
                if (client.url === link && 'focus' in client) {
                    return client.focus();
                }
            }

            // Otherwise, open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow("https://swing-social-website.vercel.app/messaging");
            }
        })
    );

    // if (link) {
    //     event.waitUntil(
    //         self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    //             // If the link is already open, focus on it
    //             for (const client of clientList) {
    //                 if (client.url === link && 'focus' in client) {
    //                     return client.focus();
    //                 }
    //             }

    //             // Otherwise, open a new window
    //             if (self.clients.openWindow) {
    //                 return self.clients.openWindow(link);
    //             }
    //         })
    //     );
    // } else {
    //     console.warn('Notification click event missing "link" in data.');
    // }
});