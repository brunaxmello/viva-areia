export async function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    // Evita carregar duas vezes
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    // Cria o script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMapLib`;
    script.async = true;
    script.defer = true;

    // Define o callback global
    window.initMapLib = () => {
      resolve(window.google.maps);
    };

    script.onerror = () => reject("Erro ao carregar Google Maps API.");
    document.head.appendChild(script);
  });
}
