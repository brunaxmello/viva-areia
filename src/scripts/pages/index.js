import { initWelcomeScreen } from "../modules/welcomeScreen.js";
import {
  initSearchAndCategories,
  allLocations,
} from "../modules/searchAndCategories.js";
// import { openLocationModal } from "../modules/locationModal.js";
import { addLocation, removeLocation, isLocationSelected, getSelectedLocations } from "../modules/selectedLocationsManager.js";

const routesListContainer = document.getElementById("routes-list");

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

// Função para obter os dados completos do local pelo ID
function getLocationDataById(locationId) {
  // Busca na lista completa de locais carregados
  return allLocations.find((loc) => loc.id.toString() === locationId);
}

// Função para lidar com o clique no card/botão
function handleCardClick(event) {
  const addButton = event.target.closest(".btn-card");
  const card = event.target.closest(".card-location");

  if (!card) {
    return; // Clicou fora de qualquer card
  }

  const locationId = card.dataset.locationId;

  if (addButton) {
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
    const locationData = getLocationDataById(locationId);

    if (locationData) {
      openLocationModal(locationData);
    } else {
      console.error(`Dados do local ID ${locationId} não encontrados.`);
    }
  }
}

const navigateButton = document.querySelector(".btn-see-script");
function handleNavigateClick() {
  const count = getSelectedLocations().length;

  if (count === 0) {
    alert("Adicione pelo menos um ponto turístico ao seu roteiro!");
    return;
  }

  window.location.href = "./src/pages/selected-routes.html";
}

document.addEventListener("DOMContentLoaded", () => {
  initWelcomeScreen();
  initSearchAndCategories();

  setTimeout(updateAllCardButtons, 100);

  // Listener para os cards de localizações
  if (routesListContainer) {
    routesListContainer.addEventListener("click", handleCardClick);
  }

  // Listener para o botão fixo
  if (navigateButton) {
    navigateButton.addEventListener("click", handleNavigateClick);
  }
});
