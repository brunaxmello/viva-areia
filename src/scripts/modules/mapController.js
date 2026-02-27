import { MAP_ID } from "../config/config.js";

// Novo helper para criar o conteúdo do marcador (o número)
function buildMarkerContent(label) {
  const content = document.createElement("div");
  content.style.cssText = `
    color: white;
    font-weight: bold;
    font-size: 14px;
    background-color: #007bff;
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
function addCustomMarkers(
  googleMaps,
  map,
  locations,
  AdvancedMarkerElement,
  waypointOrder
) {
  // Array com os waypoints na ordem otimizada
  const sortedWaypoints = waypointOrder.map((index) => locations[index]);

  // O destino final é o último elemento da lista original (que não é um waypoint)
  const destinationIndex = locations.length - 1;
  const finalLocations = [...sortedWaypoints, locations[destinationIndex]];

  finalLocations.forEach((loc, index) => {
    // Marcadores de 1 a N
    const content = buildMarkerContent(String(index + 1));

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

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });
}

// Função principal de inicialização do mapa (ASYNC)
export async function initMap(
  googleMaps,
  containerSelector,
  selectedLocationsData,
  userLocation // Pode ser null se a permissão for negada
) {
  const { AdvancedMarkerElement } = await googleMaps.maps.importLibrary(
    "marker"
  );
  const container = document.querySelector(containerSelector);

  if (!container) {
    console.error("Container do mapa não encontrado.");
    return;
  }

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

  // 1. Definição de ORIGEM (Prioridade: Localização do Usuário, Senão: Primeiro Local)
  const isUserOrigin = userLocation && userLocation.lat && userLocation.lng;
  const origin = isUserOrigin
    ? userLocation
    : { lat: validLocations[0].lat, lng: validLocations[0].lng };

  // 2. Definição dos WAYPOINTS e DESTINO
  // Se a origem for a localização do usuário, todos os locais salvos são waypoints/destino.
  // Se a origem for o primeiro local salvo, removemos ele da lista de waypoints.

  const routePoints = isUserOrigin ? validLocations : validLocations.slice(1);

  if (routePoints.length === 0) {
    // Este caso é se o usuário negou a permissão E só tinha 1 ponto salvo.
    // A rota não é necessária, apenas o mapa centrado no ponto.
  }

  const destination =
    routePoints.length > 0
      ? {
          lat: routePoints[routePoints.length - 1].lat,
          lng: routePoints[routePoints.length - 1].lng,
        }
      : origin;

  const waypoints = routePoints.slice(0, -1).map((loc) => ({
    location: { lat: loc.lat, lng: loc.lng },
    stopover: true,
  }));

  // Cria o mapa (agora com o mapId)
  const map = new googleMaps.maps.Map(container, {
    zoom: 13,
    center: origin,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    mapId: MAP_ID,
  });

  // Caso só tenha um ponto ou a rota seja impossível
  if (routePoints.length <= 1) {
    // Adiciona um marcador no único ponto/destino
    new AdvancedMarkerElement({
      position: destination,
      map,
      title: validLocations[0].nome,
    });
    if (isUserOrigin) {
      new AdvancedMarkerElement({
        position: origin,
        map,
        content: buildMarkerContent("EU"),
        title: "Minha Localização Atual",
      });
    }
    map.setCenter(origin);
    map.setZoom(13);
    return;
  }

  const directionsService = new googleMaps.maps.DirectionsService();
  const directionsRenderer = new googleMaps.maps.DirectionsRenderer({
    map,
    suppressMarkers: true,
    preserveViewport: false,
  });

  const request = {
    origin,
    destination,
    waypoints,
    travelMode: googleMaps.maps.TravelMode.DRIVING,
    optimizeWaypoints: true, // A chave da otimização
  };

  directionsService.route(request, (response, status) => {
    if (status === googleMaps.maps.DirectionsStatus.OK || status === "OK") {
      directionsRenderer.setDirections(response);

      const waypointOrder = response.routes[0].waypoint_order;

      // Adiciona um marcador especial para o usuário
      if (isUserOrigin) {
        new AdvancedMarkerElement({
          position: origin,
          map,
          content: buildMarkerContent("EU"),
          title: "Minha Localização Atual",
        });
      }

      // Adiciona os marcadores customizados usando a ordem otimizada
      addCustomMarkers(
        googleMaps,
        map,
        routePoints,
        AdvancedMarkerElement,
        waypointOrder
      );

      // Lógica de Bounds e Geração da URL...
      const route = response.routes[0];
      const bounds = new googleMaps.maps.LatLngBounds();
      route.overview_path.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds);

      const destinationCoord = `${destination.lat},${destination.lng}`;
      const originCoord = `${origin.lat},${origin.lng}`;

      // Gera a string de waypoints na ordem OTIMIZADA
      const sortedWaypointsCoords = waypointOrder
        .map((index) => `${routePoints[index].lat},${routePoints[index].lng}`)
        .join("|");

      // Usa a sintaxe correta da API de URL do Google Maps para Direções
      let mapsUrl = `https://www.google.com/maps/dir/?api=1`;

      // Adicionar Origem, Destino e Modo de Viagem
      mapsUrl += `&origin=${originCoord}`;
      mapsUrl += `&destination=${destinationCoord}`;
      mapsUrl += `&travelmode=driving`; // Define o modo "Dirigindo"

      // Adicionar waypoints otimizados, se houver
      if (sortedWaypointsCoords) {
        mapsUrl += `&waypoints=${sortedWaypointsCoords}`;
      }

      window.open(mapsUrl, "_blank");
    } else {
      console.error("Erro ao gerar rota:", status, response);
      alert(
        "Não foi possível gerar a rota. Verifique as permissões da API Key (Directions API) e o Map ID."
      );
    }
  });
}
