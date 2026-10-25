// importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
// importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// firebase.initializeApp({
//   apiKey: "AIzaSyAoaclYZ6P4vZ6uMY-uK1Qd5B_n_a-FwJo",
//   authDomain: "notification-system-6b7e7.firebaseapp.com",
//   projectId: "notification-system-6b7e7",
//   storageBucket: "notification-system-6b7e7.firebasestorage.app",
//   messagingSenderId: "457148151766",
//   appId: "1:457148151766:web:8fd607c8be2d06781ad677",
//   measurementId: "G-20X4Z727JJ"
// });

// const messaging = firebase.messaging();

// // Handle background messages
// messaging.onBackgroundMessage((payload) => {
//   console.log("Background message received:", payload);

//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: "/icon.png",
//     badge: "/badge.png",
//     vibrate: [200, 100, 200],
//     requireInteraction: true,
//     actions: [
//       {
//         action: 'open',
//         title: 'Open App'
//       }
//     ]
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

// // Handle notification click
// self.addEventListener('notificationclick', function(event) {
//   event.notification.close();
  
//   event.waitUntil(
//     clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
//       if (clientList.length > 0) {
//         let client = clientList[0];
//         return client.focus();
//       }
//       return clients.openWindow('/');
//     })
//   );
// });