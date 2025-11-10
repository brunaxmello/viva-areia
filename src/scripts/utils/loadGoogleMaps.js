let googleMapsPromise = null;

export function loadGoogleMaps(apiKey) {
  if (googleMapsPromise) return googleMapsPromise; // Evita carregar duas vezes

  googleMapsPromise = new Promise((resolve, reject) => {
    // Se a API já estiver carregada
    if (window.google && window.google.maps) {
      resolve(window.google);
      return;
    }

    // Cria o script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google);
      } else {
        reject(new Error("Google Maps SDK não foi carregado corretamente."));
      }
    };

    script.onerror = () => reject(new Error("Erro ao carregar o script do Google Maps."));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
