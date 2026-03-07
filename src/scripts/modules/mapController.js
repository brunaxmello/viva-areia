import { MAP_ID } from "../config/config.js";

function buildMarkerContent(label) {
  const content = document.createElement("div");
  content.style.cssText = "color:white;font-weight:600;font-size:14px;background:#007bff;border-radius:50%;width:24px;height:24px;line-height:24px;text-align:center;border:2px solid white;";
  content.textContent = label;
  return content;
}

function addCustomMarkers(mapsNamespace, map, locations, AdvancedMarkerElement, waypointOrder) {
  const sortedWaypoints = waypointOrder.map((index) => locations[index]);
  const destinationIndex = locations.length - 1;
  const finalLocations = [...sortedWaypoints, locations[destinationIndex]];

  finalLocations.forEach((loc, index) => {
    const content = buildMarkerContent(String(index + 1));

    const marker = new AdvancedMarkerElement({
      position: { lat: loc.lat, lng: loc.lng },
      map,
      content,
      title: loc.nome || `Ponto ${index + 1}`,
    });

    const infoWindow = new mapsNamespace.InfoWindow({
      content: `<div style="font-size:14px;"><strong>${loc.nome || "Local"}</strong><br>${loc.contato?.endereco || ""}</div>`,
    });

    if (typeof marker.addListener === "function") {
      marker.addListener("click", () => infoWindow.open(map, marker));
    } else if (marker.addEventListener) {
      marker.addEventListener("click", () => infoWindow.open(map, marker));
    }
  });
}

export async function initMap(googleMaps, containerSelector, selectedLocationsData, userLocation) {
  const mapsNamespace = (googleMaps && googleMaps.maps) || (window.google && window.google.maps) || null;
  if (!mapsNamespace) throw new Error("Google Maps namespace não encontrado (google.maps).");

  let AdvancedMarkerElement;
  if (typeof mapsNamespace.importLibrary === "function") {
    ({ AdvancedMarkerElement } = await mapsNamespace.importLibrary("marker"));
  } else if (mapsNamespace.marker && mapsNamespace.marker.AdvancedMarkerElement) {
    AdvancedMarkerElement = mapsNamespace.marker.AdvancedMarkerElement;
  } else {
    AdvancedMarkerElement = function (opts) {
      return new mapsNamespace.Marker({ position: opts.position, map: opts.map, title: opts.title, label: opts.content?.textContent });
    };
  }

  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Container do mapa não encontrado.");
    return;
  }

  const validLocations = selectedLocationsData
    .map((loc) => ({ ...loc, lat: Number(loc.mapa?.latitude), lng: Number(loc.mapa?.longitude) }))
    .filter((loc) => Number.isFinite(loc.lat) && Number.isFinite(loc.lng));

  if (validLocations.length === 0) {
    alert("Não há locais válidos para exibir no mapa.");
    return;
  }

  const isUserOrigin = userLocation && userLocation.lat && userLocation.lng;
  const origin = isUserOrigin ? userLocation : { lat: validLocations[0].lat, lng: validLocations[0].lng };
  const routePoints = isUserOrigin ? validLocations : validLocations.slice(1);

  const destination = routePoints.length > 0 ? { lat: routePoints[routePoints.length - 1].lat, lng: routePoints[routePoints.length - 1].lng } : origin;
  const waypoints = routePoints.slice(0, -1).map((loc) => ({ location: { lat: loc.lat, lng: loc.lng }, stopover: true }));

  const map = new mapsNamespace.Map(container, { zoom: 13, center: origin, mapTypeControl: false, streetViewControl: false, fullscreenControl: true, mapId: MAP_ID });

  if (routePoints.length <= 1) {
    new AdvancedMarkerElement({ position: destination, map, title: validLocations[0].nome });
    if (isUserOrigin) new AdvancedMarkerElement({ position: origin, map, content: buildMarkerContent("EU"), title: "Minha Localização Atual" });
    map.setCenter(origin);
    map.setZoom(13);
    return;
  }

  const directionsService = new mapsNamespace.DirectionsService();
  const directionsRenderer = new mapsNamespace.DirectionsRenderer({ map, suppressMarkers: true, preserveViewport: false });

  const request = { origin, destination, waypoints, travelMode: mapsNamespace.TravelMode.DRIVING, optimizeWaypoints: true };

  directionsService.route(request, (response, status) => {
    if (status === mapsNamespace.DirectionsStatus.OK || status === "OK") {
      directionsRenderer.setDirections(response);
      const waypointOrder = response.routes[0].waypoint_order;

      if (isUserOrigin) new AdvancedMarkerElement({ position: origin, map, content: buildMarkerContent("EU"), title: "Minha Localização Atual" });

      addCustomMarkers(mapsNamespace, map, routePoints, AdvancedMarkerElement, waypointOrder);

      const route = response.routes[0];
      const bounds = new mapsNamespace.LatLngBounds();
      route.overview_path.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds);

      const destinationCoord = `${destination.lat},${destination.lng}`;
      const originCoord = `${origin.lat},${origin.lng}`;
      const sortedWaypointsCoords = waypointOrder.map((index) => `${routePoints[index].lat},${routePoints[index].lng}`).join("|");

      let mapsUrl = `https://www.google.com/maps/dir/?api=1`;
      mapsUrl += `&origin=${originCoord}`;
      mapsUrl += `&destination=${destinationCoord}`;
      mapsUrl += `&travelmode=driving`;
      if (sortedWaypointsCoords) mapsUrl += `&waypoints=${sortedWaypointsCoords}`;
      window.open(mapsUrl, "_blank");
    } else {
      console.error("Erro ao gerar rota:", status, response);
      alert("Não foi possível gerar a rota. Verifique a API Key e o Map ID.");
    }
  });
}
