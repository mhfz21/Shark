/* Pure Shark Agent - Service Worker
   Strateji: "network-first" - once internetten guncel surumu cek,
   internet yoksa onbellekten goster. Boylece GitHub'a yeni surum
   yukleyince telefon HEP en guncelini alir, eski surumde takili kalmaz. */

const CACHE = 'shark-win-v5';

// Kurulumda hemen aktif ol (eski surumu bekleme)
self.addEventListener('install', function(e){
  self.skipWaiting();
});

// Aktif olunca eski onbellekleri temizle
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Her istekte: once internet, olmazsa onbellek
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(resp){
      // Basarili cevabi onbellege de kaydet (offline icin)
      const copy = resp.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return resp;
    }).catch(function(){
      // Internet yok - onbellekten ver
      return caches.match(e.request);
    })
  );
});
