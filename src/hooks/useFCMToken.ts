'use client';
import { useEffect, useState } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import firebaseApp from '../../firebase';

const useFcmToken = () => {
  const [token, setToken] = useState('');
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState('');

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          const messaging = getMessaging(firebaseApp);

          const permission = await Notification.requestPermission();
          setNotificationPermissionStatus(permission);

          if (permission === 'granted') {
            const currentToken = await getToken(messaging, {
              vapidKey: 'BMQCJxFYGoZrPS4GNe-LBcXGBl_9T6xYGBU8SZBoq8LAKc1fRiiIZEhZAomThQdeEC9GFz4ZDwQE1Nru7ykS5fE',
              serviceWorkerRegistration: await navigator.serviceWorker.ready,
            });

            if (currentToken) {
              setToken(currentToken);
            } else {
              console.warn("⚠️ No registration token available");
            }
          }
        }
      } catch (error) {
        console.error('❌ Error retrieving FCM token:', error);
      }
    };

    retrieveToken();
  }, []);

  return { token, notificationPermissionStatus };
};

export default useFcmToken;
