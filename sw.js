const CACHE_NAME = "birthday-reminder-v4";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Never cache HTML — always fetch fresh from network
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Always go to network for HTML pages (so updates show instantly)
  if (event.request.mode === "navigate" ||
      url.pathname.endsWith(".html") ||
      url.pathname.endsWith("/")) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/Birthday-Reminder/index.html")
      )
    );
    return;
  }

  // Cache-first for everything else (CSS, JS, images)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

self.addEventListener("push", event => {
  let data = { title: "Birthday Reminder", body: "You have an upcoming birthday!" };
  try { if (event.data) data = event.data.json(); } catch(e) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "https://placehold.co/192x192/ff6b6b/ffffff?text=B",
      tag: "birthday-reminder",
      data: { url: "/Birthday-Reminder/" }
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/Birthday-Reminder/"));
});
