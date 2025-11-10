import { getLocationsData } from "../modules/dataManager.js"; // Função para obter os dados completos das localizações
import {
  getSelectedLocations,
  removeLocation,
} from "../modules/selectedLocationsManager.js"; // Funções para gerenciar os locais selecionados
import { renderLocations } from "../modules/renderCardList.js"; // Função para listar os locais
import { closeLocationModal } from "../modules/locationModal.js"; // Função para abrir o modal de detalhes
import { GOOGLE_MAPS_API_KEY } from "../config/config.js";
import { loadGoogleMaps } from "../utils/loadGoogleMaps.js";
import { initMap } from "../modules/mapController.js";
import { handleActionClick } from "../modules/locationCardInteractions.js"; // Função para lidar com cliques de ação no card

const locationsListContainer = document.getElementById("locations-list");
const startRouteButton = document.querySelector(".btn-see-route");
let selectedLocationsData = [];

// Filtra os locais e renderiza apenas os selecionados pelo usuário.
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
    // Se a remoção for bem-sucedida no localStorage
    closeLocationModal();

    // Força a re-renderização da página completa
    await initSelectedLocationsPage();
  }
}

function handleModalClick(event) {
  const actionButton = event.target.closest(
    ".btn-card, .button-add-container button"
  );
  if (actionButton) {
    const locationId = actionButton.dataset.locationId;

    // Ação deve ser sempre REMOVER nesta página
    handleRemoveAction(locationId);
  }
}

async function handleShowMapClick() {
  if (!startRouteButton) return; // Adicione a verificação de dados logo no início:

  if (selectedLocationsData.length === 0) {
    alert("Selecione locais no roteiro antes de ver o mapa!");
    return;
  } // Mostra um feedback de carregamento

  startRouteButton.disabled = true;
  startRouteButton.innerHTML =
    '<i class="bi bi-arrow-clockwise spinner-border spinner-border-sm"></i> Carregando Mapa...';

  try {
    const googleMaps = await loadGoogleMaps(GOOGLE_MAPS_API_KEY); // Passa o array global preenchido

    initMap(googleMaps, ".selected-locations-content", selectedLocationsData); // Esconde o botão e a lista de cards, deixando o mapa visível

    startRouteButton.style.display = "none";

    if (locationsListContainer) {
      locationsListContainer.style.display = "none";
    }
  } catch (error) {
    console.error("Erro ao carregar o mapa:", error);
    alert("Não foi possível carregar o mapa. Tente novamente.");
    startRouteButton.disabled = false;
    startRouteButton.innerHTML =
      '<i class="bi bi-map"></i> Ver Roteiro no Mapa';
  }
}

document.addEventListener("DOMContentLoaded", async (event) => {
  await initSelectedLocationsPage();

  // Anexa o listener de ação para o botão do card e o botão do modal
  document.body.addEventListener("click", async (event) => {
    const actionButton = event.target.closest(
      ".btn-card, .button-add-container button"
    );

    if (actionButton) {
      // Se for clique no botão, chamamos a lógica de remoção centralizada
      event.stopPropagation();
      await handleRemoveAction(actionButton.dataset.locationId);
    } else {
      // Caso contrário, usa o handleActionClick para abrir o modal
      await handleActionClick(event);
    }
  });

  if (startRouteButton) {
    startRouteButton.addEventListener("click", handleShowMapClick);
  }

  // Adiciona listener para o botão de Voltar
  const backButton = document.getElementById("back-link");

  if (backButton) {
    backButton.addEventListener("click", () => {
      window.history.back();
    });
  }
});
