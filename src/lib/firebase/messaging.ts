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
    vapidKey: "BMQCJxFYGoZrPS4GNe-LBcXGBl_9T6xYGBU8SZBoq8LAKc1fRiiIZEhZAomThQdeEC9GFz4ZDwQE1Nru7ykS5fE",
    serviceWorkerRegistration: await navigator.serviceWorker.ready,
  });
}