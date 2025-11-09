export function initMap(googleMaps, containerSelector) {
  const mapContainer = document.querySelector(containerSelector);
  
  // Cria o elemento se ainda não existir
  let mapElement = document.getElementById("map");
  if (!mapElement) {
    mapElement = document.createElement("div");
    mapElement.id = "map";
    mapElement.style.height = "500px";
    mapElement.style.width = "100%";
    mapContainer.appendChild(mapElement);
  }

  const location = { lat: -6.9639, lng: -35.6974 }; // Areia - PB
  const map = new googleMaps.Map(mapElement, {
    zoom: 14,
    center: location,
  });

  new googleMaps.Marker({
    position: location,
    map,
    title: "Centro de Areia - PB",
  });
}
