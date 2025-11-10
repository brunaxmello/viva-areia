import { MAP_ID } from "../config/config.js";
// modules/mapController.js

// Novo helper para criar o conteúdo do marcador (o número)
function buildMarkerContent(label) {
  const content = document.createElement("div");
  content.style.cssText = `
    color: white;
    font-weight: bold;
    font-size: 14px;
    background-color: #007bff; /* Cor do seu botão primário */
    border-radius: 50%;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  `;
  content.textContent = label;
  return content;
}

// Função para adicionar marcadores avançados
function addCustomMarkers(googleMaps, map, locations, AdvancedMarkerElement) {
  locations.forEach((loc, index) => {
    const content = buildMarkerContent(String(index + 1));
    
    // Usando o AdvancedMarkerElement
    const marker = new AdvancedMarkerElement({
      position: { lat: loc.lat, lng: loc.lng },
      map,
      content: content, 
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

    // O AdvancedMarkerElement herda o addListener do Marker
    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });
}

// Função principal de inicialização do mapa (ASYNC)
export async function initMap(
  googleMaps,
  containerSelector,
  selectedLocationsData
) {

  // 1. Carrega o módulo de marcador
  const { AdvancedMarkerElement } = await googleMaps.maps.importLibrary(
    "marker"
  );

  const container = document.querySelector(containerSelector);

  if (!container) {
    console.error("Container do mapa não encontrado:", containerSelector);
    return;
  }

  // Extrai e valida as coordenadas
  const validLocations = selectedLocationsData
    .map((loc) => ({
      ...loc,
      lat: Number(loc.mapa?.latitude),
      lng: Number(loc.mapa?.longitude),
    }))
    .filter((loc) => Number.isFinite(loc.lat) && Number.isFinite(loc.lng));

  if (validLocations.length === 0) {
    console.error("Nenhum local com coordenadas válidas encontrado.");
    alert("Não há locais válidos para exibir no mapa.");
    return;
  }

  // Cria o mapa (agora com o mapId)
  const map = new googleMaps.maps.Map(container, {
    zoom: 13,
    center: { lat: validLocations[0].lat, lng: validLocations[0].lng },
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    mapId: MAP_ID, // <-- Implementação do Map ID
  });

  // Caso só tenha um ponto, apenas marca no mapa
  if (validLocations.length < 2) {
    validLocations.forEach((loc) => {
      new AdvancedMarkerElement({
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
      
      // Adiciona os marcadores personalizados
      addCustomMarkers(googleMaps, map, validLocations, AdvancedMarkerElement); 

      // Ajusta automaticamente o zoom/centro para caber toda a rota
      const route = response.routes[0];
      const bounds = new googleMaps.maps.LatLngBounds();
      route.overview_path.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds);

      // =================================================================
      // LÓGICA DE NAVEGAÇÃO GPS (Tipo Dirigindo)
      // =================================================================
      const originCoord = `${validLocations[0].lat},${validLocations[0].lng}`;
      const destinationCoord = `${validLocations[validLocations.length - 1].lat},${validLocations[validLocations.length - 1].lng}`;
      
      // Formata os waypoints no formato LAT,LNG|LAT,LNG|...
      const waypointsString = validLocations.slice(1, -1)
          .map(loc => `${loc.lat},${loc.lng}`)
          .join('|');
          
      // Constrói a URL do Google Maps para iniciar a navegação
      let mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originCoord}&destination=${destinationCoord}&travelmode=driving`;
      
      if (waypointsString) {
          mapsUrl += `&waypoints=${waypointsString}`;
      }

      // Abre a navegação GPS em uma nova aba para o usuário
      window.open(mapsUrl, '_blank');
      // =================================================================
      
    } else {
      console.error("Erro ao gerar rota:", status, response);
      alert("Não foi possível gerar a rota. Verifique as permissões da API Key (Directions API) e o Map ID.");
    }
  });
}