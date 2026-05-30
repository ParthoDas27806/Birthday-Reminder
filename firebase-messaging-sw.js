importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyDVVBPl9EMTZGUYsMRzigvKcDVQkQBq2-U",
  authDomain:        "birthday-reminder-630a2.firebaseapp.com",
  projectId:         "birthday-reminder-630a2",
  storageBucket:     "birthday-reminder-630a2.firebasestorage.app",
  messagingSenderId: "20710694139",
  appId:             "1:20710694139:web:8125398222c068c6fe245e"
});

const messaging = firebase.messaging();

// Handle background messages (when app is closed/minimized)
messaging.onBackgroundMessage(payload => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'OccasionVault', {
    body:    body || 'You have an upcoming occasion!',
    icon:    icon || './icons/icon-192x192.png',
    badge:        './icons/icon-96x96.png',
    vibrate:      [200, 100, 200],
    tag:          payload.data?.tag || 'ov-notif',
    renotify:     true,
    requireInteraction: false,
    data: { url: payload.data?.url || './' }
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
      for (const c of list) {
        if (c.url.includes('OccasionVault') || c.url.includes('github.io')) return c.focus();
      }
      return clients.openWindow('./');
    })
  );
});
