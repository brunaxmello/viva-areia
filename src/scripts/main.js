// JS usado tanto em home quanto em selected-routes

import { getLocationDataById } from "./modules/dataManager.js"; // Função para obter dados do local pelo ID
import { openLocationModal } from "./modules/locationModal.js"; // Função para abrir o modal de detalhes do local 
import {
  addLocation,
  removeLocation,
  isLocationSelected
} from "./modules/selectedLocationsManager.js"; // Funções para gerenciar locais selecionados

const locationsListContainer = document.getElementById("locations-list"); // Container que envolve os cards de localizações tanto em home quanto em selected-routes

// Função que troca o texto e a aparência do botão do card
function toggleCardButton(buttonElement, isAdded) {
  if (isAdded) {
    // Estado: Já adicionado
    buttonElement.innerHTML = 'Remover <i class="bi bi-dash-lg"></i>';
    buttonElement.classList.add("btn-remove-location");
  } else {
    // Estado: Padrão (Adicionar)
    buttonElement.innerHTML = 'Adicionar <i class="bi bi-plus-lg"></i>';
    buttonElement.classList.remove("btn-remove-location");
  }
}

// Função para atualizar o estado de todos os botões dos cards
function updateAllCardButtons() {
  document.querySelectorAll(".btn-card").forEach((button) => {
    const locationId = button.dataset.locationId;
    const isSelected = isLocationSelected(locationId);
    toggleCardButton(button, isSelected);
  });
}

// Função para lidar com o clique no card/botão
async function handleCardClick(event) {
  const addButton = event.target.closest(".btn-card");
  const card = event.target.closest(".card-location");

  if (!card) {
    return; // Clicou fora de qualquer card
  }

  const locationId = card.dataset.locationId;

  if (addButton) {
    // Clicou no botão de adicionar/remover

    event.stopPropagation();
    let isAdded = isLocationSelected(locationId);
    let actionSuccessful;

    if (isAdded) {
      // Se já foi adicionado, remove
      actionSuccessful = removeLocation(locationId);
      isAdded = false;
    } else {
      // Se não foi adicionado, adiciona
      actionSuccessful = addLocation(locationId);
      isAdded = true;
    }

    // Se a ação foi bem-sucedida, atualiza o botão
    if (actionSuccessful) {
      toggleCardButton(addButton, isAdded);
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

  setTimeout(updateAllCardButtons, 100);

  // Listener para os cards de localizações
  if (locationsListContainer) {
    locationsListContainer.addEventListener("click", handleCardClick);
  }

});
