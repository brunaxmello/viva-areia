let googleMapsPromise = null;

export function loadGoogleMaps(apiKey, MAP_ID) {
  if (googleMapsPromise) return googleMapsPromise; // Evita carregar duas vezes

  googleMapsPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google);
      return;
    }

    const callbackName = "__vivaAreiaInitGoogleMaps";

    // Evita redefinir se outro carregamento já definiu o callback
    if (!window[callbackName]) {
      window[callbackName] = () => {
        if (window.google && window.google.maps) {
          resolve(window.google);
        } else {
          reject(new Error("Google Maps SDK não foi inicializada corretamente (callback)."));
        }
        try {
          delete window[callbackName];
        } catch (e) {
          window[callbackName] = undefined;
        }
      };
    }

    const script = document.createElement("script");
    let src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=${callbackName}`;
    if (MAP_ID) src += `&map_ids=${MAP_ID}`;
    script.src = src;
    script.async = true;
    script.defer = true;

    script.onerror = () => reject(new Error("Erro ao carregar o script do Google Maps."));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
