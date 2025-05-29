// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/11.7.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.7.3/firebase-messaging-compat.js');

// TODO: Reemplaza con la configuración de tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyD9cpSfGG212h80iXofJetw-B-arEEcOvI",
  authDomain: "emprochampions2025.firebaseapp.com",
  projectId: "emprochampions2025",
  storageBucket: "emprochampions2025.appspot.com",
  messagingSenderId: "683206087538",
  appId: "1:683206087538:web:8a1473aec968bd6ab543eb"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/EmproChampions-2025/favicon.ico' // Icono para la notificación
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});