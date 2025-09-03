import {
  getToken as fcmGetToken,
  onMessage as fcmOnMessage,
  getMessaging,
  MessagePayload,
  Messaging,
  NextFn,
  Observer,
  Unsubscribe,
} from "firebase/messaging";
import { app } from "./app";

export { isSupported } from "firebase/messaging";

export async function messaging(): Promise<Messaging> {

  return getMessaging(app);
}

export async function onMessage(
  handler: NextFn<MessagePayload> | Observer<MessagePayload>,
): Promise<Unsubscribe> {
  return fcmOnMessage(await messaging(), handler);
}

export async function getToken(
  serviceWorkerRegistration?: ServiceWorkerRegistration,
): Promise<string> {
  return fcmGetToken(await messaging(), {
    vapidKey: "BA4k_YYfP8FDCcEyIcnxWUqnljPScp8k_IYu6H95_MI3iwDY2JUyVOyzImYkQwfSD8ml3u8pIW3DX4tUx1d-D1U",
    serviceWorkerRegistration: await navigator.serviceWorker.ready,
  });
}