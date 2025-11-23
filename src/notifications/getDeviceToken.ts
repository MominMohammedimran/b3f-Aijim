import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDK44MkyIsym4P4wyj0xNfvQa7uVtDb8ng",
  authDomain: "aijim-app-notification.firebaseapp.com",
  projectId: "aijim-app-notification",
  storageBucket: "aijim-app-notification.firebasestorage.app",
  messagingSenderId: "867815689974",
  appId: "1:867815689974:web:6be73314cc6cdceaa4e6d7",
  measurementId: "G-YE21CE2D57",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function saveDeviceToken(userId: string) {
  try {
    const token = await getToken(messaging, {
      vapidKey:
        "BBTpVIcgnlG0ObBRASGi8A5fDWORHGYZn3aw-o_Eep-TevIdkoEn-5DklHsGXfwIlgTJcgdmE346gNKXlg1eYzs",
    });
    if (!token) return;

    await fetch("/api/save-device-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userId }),
    });

    console.log("Device token saved:", token);
  } catch (err) {
    console.error("Error getting device token:", err);
  }
}

// Listen to notifications when app is open
onMessage(messaging, (payload) => {
  console.log("Foreground notification:", payload);
});
