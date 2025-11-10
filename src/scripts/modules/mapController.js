// modules/mapController.js

export function initMap(googleMaps, containerSelector, selectedLocationsData) {
  const container = document.querySelector(containerSelector);

  if (!container) {
    console.error("Container do mapa não encontrado:", containerSelector);
    return;
  }

  // Extrai lat/lng do JSON
  const validLocations = selectedLocationsData
    .map(loc => ({
      ...loc,
      lat: Number(loc.mapa?.latitude),
      lng: Number(loc.mapa?.longitude),
    }))
    .filter(loc => Number.isFinite(loc.lat) && Number.isFinite(loc.lng));

  if (validLocations.length === 0) {
    console.error("Nenhum local com coordenadas válidas encontrado.");
    alert("Não há locais válidos para exibir no mapa.");
    return;
  }

  // Cria o mapa centralizado no primeiro ponto
  const map = new googleMaps.maps.Map(container, {
    zoom: 13,
    center: { lat: validLocations[0].lat, lng: validLocations[0].lng },
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  });

  // Caso só tenha um ponto, apenas marca no mapa
  if (validLocations.length < 2) {
    validLocations.forEach((loc) => {
      new googleMaps.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        map,
        title: loc.nome || "Local",
      });
    });
    return;
  }

  const directionsService = new googleMaps.maps.DirectionsService();
  const directionsRenderer = new googleMaps.maps.DirectionsRenderer({
    map,
    suppressMarkers: false,
    preserveViewport: false,
  });

  const origin = { lat: validLocations[0].lat, lng: validLocations[0].lng };
  const destination = {
    lat: validLocations[validLocations.length - 1].lat,
    lng: validLocations[validLocations.length - 1].lng,
  };
  const waypoints = validLocations.slice(1, -1).map((loc) => ({
    location: { lat: loc.lat, lng: loc.lng },
    stopover: true,
  }));

  const request = {
    origin,
    destination,
    waypoints,
    travelMode: googleMaps.maps.TravelMode.DRIVING,
    optimizeWaypoints: false,
  };

  directionsService.route(request, (response, status) => {
    if (status === googleMaps.maps.DirectionsStatus.OK || status === "OK") {
      directionsRenderer.setDirections(response);

      // Ajusta automaticamente o zoom/centro para caber toda a rota
      const route = response.routes[0];
      const bounds = new googleMaps.maps.LatLngBounds();
      route.overview_path.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds);

      addCustomMarkers(googleMaps, map, validLocations);
    } else {
      console.error("Erro ao gerar rota:", status, response);
      alert("Não foi possível gerar a rota. Tente novamente mais tarde.");
    }
  });
}

function addCustomMarkers(googleMaps, map, locations) {
  locations.forEach((loc, index) => {
    const marker = new googleMaps.maps.Marker({
      position: { lat: loc.lat, lng: loc.lng },
      map,
      label: String(index + 1),
      title: loc.nome || `Ponto ${index + 1}`,
    });

    const infoWindow = new googleMaps.maps.InfoWindow({
      content: `
        <div style="font-size:14px;">
          <strong>${loc.nome || "Local"}</strong><br>
          ${loc.contato?.endereco || ""}
        </div>
      `,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });
}
