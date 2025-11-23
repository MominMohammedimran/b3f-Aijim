importScripts(
  "https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyDK44MkyIsym4P4wyj0xNfvQa7uVtDb8ng",
  authDomain: "aijim-app-notification.firebaseapp.com",
  projectId: "aijim-app-notification",
  storageBucket: "aijim-app-notification.firebasestorage.app",
  messagingSenderId: "867815689974",
  appId: "1:867815689974:web:6be73314cc6cdceaa4e6d7",
  measurementId: "G-YE21CE2D57",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/aijim.svg",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
