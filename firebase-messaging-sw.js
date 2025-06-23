// empro-v3/public/firebase-messaging-sw.js
// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyD9cpSfGG212h80iXofJetw-B-arEEcOvI",
  authDomain: "emprochampions2025.firebaseapp.com",
  databaseURL: "https://emprochampions2025-default-rtdb.firebaseio.com",
  projectId: "emprochampions2025",
  storageBucket: "emprochampions2025.firebasestorage.app",
  messagingSenderId: "683206087538",
  appId: "1:683206087538:web:8a1473aec968bd6ab543eb",
  measurementId: "G-3TX5J3NDT5"
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/img/favicon.ico', // Usa el ícono de la notificación o uno por defecto
    data: {
        click_action: payload.notification.click_action || payload.fcmOptions.link || '/',
     }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Cierra la notificación

    let clickAction = event.notification.data.click_action;

    // Si click_action no está en data, intenta obtenerlo de fcmOptions si está presente
    // Esto es más para compatibilidad, ya que en onBackgroundMessage deberías haberlo puesto en data.
    if (!clickAction && event.notification.data && event.notification.data.FCM_MSG && event.notification.data.FCM_MSG.notification && event.notification.data.FCM_MSG.notification.click_action) {
        clickAction = event.notification.data.FCM_MSG.notification.click_action;
    } else if (!clickAction && event.notification.data && event.notification.data.fcmOptions && event.notification.data.fcmOptions.link) {
         clickAction = event.notification.data.fcmOptions.link;
    }


    if (clickAction && clickAction !== '/') {
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
                // Revisa si alguna de las ventanas/pestañas abiertas ya tiene la URL.
                for (var i = 0; i < windowClients.length; i++) {
                    var client = windowClients[i];
                    if (client.url === clickAction && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no hay ninguna ventana abierta con esa URL, abre una nueva.
                if (clients.openWindow) {
                    return clients.openWindow(clickAction);
                }
            })
        );
    }
});