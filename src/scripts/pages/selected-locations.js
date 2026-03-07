import { getLocationsData } from "../modules/dataManager.js";
import {
  getSelectedLocations,
  removeLocation,
} from "../modules/selectedLocationsManager.js";
import { renderLocations } from "../modules/renderCardList.js";
import { closeLocationModal } from "../modules/locationModal.js";
import { GOOGLE_MAPS_API_KEY, MAP_ID } from "../config/config.js";
import { loadGoogleMaps } from "../utils/loadGoogleMaps.js";
import { initMap } from "../modules/mapController.js";
import { handleActionClick } from "../modules/locationCardInteractions.js";
import { customAlert } from "../modules/customAlert.js";

const locationsListContainer = document.getElementById("locations-list");
const startRouteButton = document.querySelector(".btn-see-route");
let selectedLocationsData = [];

async function initSelectedLocationsPage() {
  const allLocations = await getLocationsData();
  const selectedIds = getSelectedLocations();

  const selectedLocations = allLocations.filter((location) => {
    return selectedIds.includes(location.id.toString());
  });

  selectedLocationsData = selectedLocations;

  renderLocations(selectedLocationsData, true);
}

async function handleRemoveAction(locationId) {
  const wasRemoved = removeLocation(locationId);

  if (wasRemoved) {
    closeLocationModal();
    await initSelectedLocationsPage();
  }
}

async function handleShowMapClick() {
  if (!startRouteButton) return;

  if (selectedLocationsData.length === 0) {
    customAlert("Selecione locais no roteiro antes de ver o mapa!");
    return;
  }

  startRouteButton.disabled = true;
  startRouteButton.innerHTML =
    '<i class="bi bi-arrow-clockwise spinner-border spinner-border-sm"></i> Obtendo Localização...';

  let userLocation = null;

  const getUserLocation = new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        // Se a localização falhar ou for negada
        (error) => {
          reject(new Error("Localização negada ou falha na obtenção."));
        }
      );
    } else {
      reject(new Error("Geolocation não é suportado por este navegador."));
    }
  });

  try {
    // Tenta obter a localização (se falhar, vai para o catch)
    userLocation = await getUserLocation;

    startRouteButton.innerHTML =
      '<i class="bi bi-arrow-clockwise spinner-border spinner-border-sm"></i> Carregando Mapa...';
  } catch (error) {
    console.warn(
      "Localização do usuário não obtida. Usando o primeiro local como origem."
    );
    // Se falhar, userLocation permanece null, e o initMap usará o fallback.
    alert(
      "Não foi possível obter sua localização. A rota será calculada a partir do primeiro local da sua lista."
    );
  }

  try {
    const googleMaps = await loadGoogleMaps(GOOGLE_MAPS_API_KEY, MAP_ID);

    // Inicia o mapa (userLocation pode ser null, o initMap lida com isso)
    await initMap(
      googleMaps,
      ".selected-locations-content",
      selectedLocationsData,
      userLocation
    );

    startRouteButton.style.display = "none";
    if (locationsListContainer) {
      locationsListContainer.style.display = "none";
    }
  } catch (error) {
    console.error("Erro fatal ao carregar o mapa:", error);
    alert(`Erro fatal: ${error.message} A rota não pode ser exibida.`);

    startRouteButton.disabled = false;
    startRouteButton.innerHTML =
      '<i class="bi bi-map"></i> Ver Roteiro no Mapa';
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await initSelectedLocationsPage();

  document.body.addEventListener("click", async (event) => {
    const actionButton = event.target.closest(
      ".btn-card, .button-add-container button"
    );

    if (actionButton) {
      event.stopPropagation();
      await handleRemoveAction(actionButton.dataset.locationId);
    } else {
      await handleActionClick(event);
    }
  });

  if (startRouteButton) {
    startRouteButton.addEventListener("click", handleShowMapClick);
  }

  const backButton = document.getElementById("back-link");

  if (backButton) {
    backButton.addEventListener("click", () => {
      window.history.back();
    });
  }
});