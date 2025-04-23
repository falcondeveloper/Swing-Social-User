'use client'
import { useEffect, useState } from 'react';
import { getMessaging, getToken, deleteToken } from 'firebase/messaging';
import firebaseApp from '../../firebase';

const useFcmToken = () => {
  const [token, setToken] = useState('');
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState('');

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          const messaging = getMessaging(firebaseApp);
          
          // First, delete any existing token
          try {
            await deleteToken(messaging);
          } catch (e) {
            console.log('No existing token to delete');
          }

          const permission = await Notification.requestPermission();
          setNotificationPermissionStatus(permission);

          if (permission === 'granted') {
            const currentToken = await getToken(messaging, {
              vapidKey: 'BCbLjHHDUjzyLY0OoZRL-oqpZ8OScEUlcsQ3mq-_yxhljEOKmpQWOmSEUrTM0h4wAK2Xl3ZMOcXXH61vs1CE4fA'
            });
            
            if (currentToken) {
              setToken(currentToken);
              // Save this new token to your database
            }
          }
        }
      } catch (error) {
        console.log('Error retrieving token:', error);
      }
    };

    retrieveToken();
  }, []);

  return { token, notificationPermissionStatus };
};

export default useFcmToken;
