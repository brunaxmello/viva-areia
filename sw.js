const CACHE_NAME = "viva-areia-v1";
const urlsToCache = [
  "/viva-areia/",
  "/viva-areia/index.html",
  "/viva-areia/manifest.json",
  "/viva-areia/src/styles/style.css",
  "/viva-areia/src/scripts/index.js",
  "/viva-areia/src/images/logo-viva-areia.png", 
  "/viva-areia/src/images/logo-favicon.png",
  "/viva-areia/src/pages/selected-routes.html"
];

// Instalando o SW e adicionando arquivos ao cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Interceptando requisições para servir do cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// Atualizando cache quando o SW muda
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (!cacheWhitelist.includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});