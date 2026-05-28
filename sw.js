// OccasionVault Service Worker v5
const CACHE = "occasionvault-v5";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

// Never cache HTML — always fresh
self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === "basic") {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      }
      return res;
    }))
  );
});

// Show notifications sent from app
self.addEventListener("push", e => {
  let d = { title: "OccasionVault", body: "You have an upcoming occasion!" };
  try { if (e.data) d = e.data.json(); } catch {}
  e.waitUntil(self.registration.showNotification(d.title, {
    body: d.body, icon: "./icon.svg", badge: "./icon.svg",
    vibrate: [200, 100, 200], tag: d.tag || "ov-notif", renotify: true,
  }));
});

// Handle notification click
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes("OccasionVault") || c.url.includes("Birthday-Reminder") || c.url.includes("github.io")) {
          return c.focus();
        }
      }
      return clients.openWindow("./");
    })
  );
});

// Listen for messages from the app to show notifications
self.addEventListener("message", e => {
  if (e.data && e.data.type === "SHOW_NOTIFICATION") {
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: "./icon.svg",
      badge: "./icon.svg",
      vibrate: [200, 100, 200],
      tag: e.data.tag || "ov-msg",
      renotify: true,
    });
  }
});
