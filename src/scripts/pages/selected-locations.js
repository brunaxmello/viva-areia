// JS específico para a página de rotas selecionadas. Inicializa a página, filtrando e exibindo apenas os locais salvos no localStorage.

import {
  getLocationsData,
  getLocationDataById,
} from "../modules/dataManager.js"; // Função para obter os dados completos das localizações
import {
  getSelectedLocations,
  removeLocation,
} from "../modules/selectedLocationsManager.js"; // Funções para gerenciar os locais selecionados
import { renderLocations } from "../modules/renderCardList.js"; // Função para listar os locais (é usada tanto no home como no selected-locations)
import { openLocationModal } from "../modules/locationModal.js"; // Função para abrir o modal de detalhes do local (é usada tanto no home como no selected-locations)

const locationsListContainer = document.getElementById("locations-list");

// Filtra os locais e renderiza apenas os selecionados pelo usuário.
async function initSelectedLocationsPage() {
  const allLocations = await getLocationsData();

  const selectedIds = getSelectedLocations();

  const selectedLocations = allLocations.filter((location) => {
    return selectedIds.includes(location.id.toString());
  });

  renderLocations(selectedLocations, true);
}

// Gerencia os eventos de clique (remover e abrir modal) nos cards de localização no selected-locations.js.
async function handlePageClick(event) {
  const button = event.target.closest(".btn-card");
  const cardElement = event.target.closest(".card-location");

  if (!cardElement) {
    return; // Sai se o clique não for em um botão dentro de um card
  }

  const locationId = cardElement.dataset.locationId;

  if (button) {
    event.stopPropagation(); // Evita que o clique no botão dispare outros eventos
    const wasRemoved = removeLocation(locationId);

    if (wasRemoved) {
      cardElement.remove(); // Remove o card da interface

      const remainingCards =
        locationsListContainer.querySelectorAll(".card-location");
      if (remainingCards.length === 0) {
        locationsListContainer.innerHTML =
          '<p class="message-info">Nenhum local selecionado no seu roteiro.</p>';
      }
    }
  } else {
    // Clicou no card (fora do botão), abre o modal de detalhes

    const locationData = await getLocationDataById(locationId);

    if (locationData) {
      openLocationModal(locationData);
    } else {
      console.error(`Dados do local ID ${locationId} não encontrados.`);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSelectedLocationsPage();

  // Adiciona listener para remover locais da lista
  if (locationsListContainer) {
    locationsListContainer.addEventListener(
      "click",
      async (event) => {
        await handlePageClick(event);
      },
      true
    );
  }
});
