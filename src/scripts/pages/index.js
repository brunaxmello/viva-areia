// JS específico para a página inicial. Inicializa a página principal, ativando a busca, categorias e tela de boas-vindas.

import { initWelcomeScreen } from "../modules/welcomeScreen.js"; // Função para inicializar a tela de boas-vindas no mobile ou no desktop
import { initSearchAndCategories } from "../modules/searchAndCategories.js"; // Função para inicializar a busca, filtros e listagem de locais
import { getSelectedLocations } from "../modules/selectedLocationsManager.js"; // Função para obter os locais selecionados
import { updateAllCardButtons } from "../modules/renderCardList.js"; // Função para atualizar o estado dos botões dos cards
import { getLocationDataById } from "../modules/dataManager.js"; // Função para obter dados do local pelo ID
import { openLocationModal } from "../modules/locationModal.js"; // Função para abrir o modal de detalhes do local 
import {
  addLocation,
  removeLocation,
  isLocationSelected
} from "../modules/selectedLocationsManager.js"; // Funções para gerenciar locais selecionados
import { toggleCardButton } from "../modules/renderCardList.js"; // Função para atualizar o botão do card

const locationsListContainer = document.getElementById("locations-list"); // Container que envolve os cards de localizações tanto em home quanto em selected-routes
const navigateButton = document.querySelector(".btn-see-script");

// Função para ir ao roteiro com os locais selecionados
async function handleNavigateClick() {
  const count = getSelectedLocations().length;

  if (count === 0) {
    alert("Adicione pelo menos um ponto turístico ao seu roteiro!");
    return;
  }

  window.location.href = "./selected-locations.html";
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

document.addEventListener("DOMContentLoaded", async () => {
  // Inicializa o comportamento da tela de boas-vindas
  initWelcomeScreen();

  // Inicializa a tela de busca, filtros e listagem de locais
  await initSearchAndCategories();

  // Listener para os cards de localizações
  if (locationsListContainer) {
    locationsListContainer.addEventListener("click", handleCardClick);
  }

  // Atualiza o estado dos botões dos cards
  updateAllCardButtons();

  // Listener para o botão fixo
  if (navigateButton) {
    navigateButton.addEventListener("click", handleNavigateClick);
  }
});

window.addEventListener('pageshow', (event) => {
    // A propriedade persisted indica se a página foi restaurada do cache do navegador (back/forward)
    if (event.persisted) {
        console.log("Página restaurada do cache. Sincronizando estado dos botões...");
        // Força a verificação do localStorage e atualiza os botões visuais (Adicionar/Remover)
        updateAllCardButtons();
    }
});