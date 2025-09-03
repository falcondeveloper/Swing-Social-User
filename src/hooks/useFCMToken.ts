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
              vapidKey: 'BA4k_YYfP8FDCcEyIcnxWUqnljPScp8k_IYu6H95_MI3iwDY2JUyVOyzImYkQwfSD8ml3u8pIW3DX4tUx1d-D1U',
              serviceWorkerRegistration: await navigator.serviceWorker.ready, // ✅ ensure SW is ready
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
