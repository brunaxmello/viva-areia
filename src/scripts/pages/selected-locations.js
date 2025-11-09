import {
  getLocationsData,
  getLocationDataById,
} from "../modules/dataManager.js"; // Função para obter os dados completos das localizações
import {
  getSelectedLocations,
  removeLocation,
} from "../modules/selectedLocationsManager.js"; // Funções para gerenciar os locais selecionados
import { renderLocations } from "../modules/renderCardList.js"; // Função para listar os locais
import { openLocationModal } from "../modules/locationModal.js"; // Função para abrir o modal de detalhes
import { GOOGLE_MAPS_API_KEY } from "../config/config.js";
import { loadGoogleMaps } from "../utils/loadGoogleMaps.js";
import { initMap } from "../modules/mapController.js";

const locationsListContainer = document.getElementById("locations-list");
const startRouteButton = document.querySelector(".btn-see-script");

let selectedLocationsData = [];

async function initSelectedLocationsPage() {
  const allLocations = await getLocationsData();
  const selectedIds = getSelectedLocations();

  // Filtra os locais completos
  selectedLocationsData = allLocations.filter((location) => {
    return selectedIds.includes(location.id.toString());
  });

  // Renderiza os cards na tela
  renderLocations(selectedLocationsData, true);

  // Se não houver locais, mostra mensagem
  if (selectedLocationsData.length === 0) {
    locationsListContainer.innerHTML =
      '<p class="message-info">Nenhum local selecionado no seu roteiro.</p>';
    // Esconde o botão do mapa se não houver locais
    if (startRouteButton) startRouteButton.style.display = "none";
  }
}

async function handlePageClick(event) {
  const button = event.target.closest(".btn-card");
  const cardElement = event.target.closest(".card-location");

  if (!cardElement) {
    return; // Sai se o clique não for em um botão dentro de um card
  }

  const locationId = cardElement.dataset.locationId;

  if (button) {
    // CLICOU NO BOTÃO 'REMOVER'
    event.stopPropagation();
    const wasRemoved = removeLocation(locationId);

    if (wasRemoved) {
      cardElement.remove(); // Remove o card da interface

      // ATUALIZA A LISTA DE DADOS
      selectedLocationsData = selectedLocationsData.filter(
        (loc) => loc.id.toString() !== locationId
      );

      // Verifica se a lista está vazia
      if (selectedLocationsData.length === 0) {
        locationsListContainer.innerHTML =
          '<p class="message-info">Nenhum local selecionado no seu roteiro.</p>';
        if (startRouteButton) startRouteButton.style.display = "none";
      }
    }
  } else {
    // CLICOU NO CARD (FORA DO BOTÃO) -> ABRE O MODAL
    const locationData = await getLocationDataById(locationId);
    if (locationData) {
      openLocationModal(locationData);
    } else {
      console.error(`Dados do local ID ${locationId} não encontrados.`);
    }
  }
}

async function handleShowMapClick() {
  if (!startRouteButton) return;

  // Mostra um feedback de carregamento
  startRouteButton.disabled = true;
  startRouteButton.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';

  try {
    // Carrega a API do Google Maps
    const googleMaps = await loadGoogleMaps(GOOGLE_MAPS_API_KEY);
    initMap(googleMaps, ".selected-locations-content", selectedLocationsData);

    // Esconde o botão flutuante (pois o mapa está visível)
    startRouteButton.style.display = "none";
    
    // O header ainda precisa ser visível, mas a lista de cards não
    if (locationsListContainer) {
      locationsListContainer.style.display = "none";
    }

  } catch (error) {
    console.error("Erro ao carregar o mapa:", error);
    alert("Não foi possível carregar o mapa. Tente novamente.");
    startRouteButton.disabled = false;
    startRouteButton.innerHTML = '<i class="bi bi-map"></i>';
  }
}

// === INICIALIZAÇÃO ===

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializa a lista de locais selecionados
  initSelectedLocationsPage();

  // 2. Adiciona listener para os cards (remover ou abrir modal)
  if (locationsListContainer) {
    locationsListContainer.addEventListener(
      "click",
      async (event) => {
        await handlePageClick(event);
      },
      true
    );
  }

  // 3. Adiciona listener para o botão de iniciar rota (mapa)
  if (startRouteButton) {
    startRouteButton.addEventListener("click", handleShowMapClick);
  }
});