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


// Função para atualizar o contador de locais selecionados
function updateLocationCounter() {
  const counter = document.getElementById("location-counter");
  if (!counter) return;
  
  const count = getSelectedLocations().length;
  counter.textContent = count;
  
  // Mostra o contador apenas se houver locais selecionados
  if (count > 0) {
    counter.classList.add("show");
  } else {
    counter.classList.remove("show");
  }
}


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
      updateLocationCounter(); // Atualiza o contador
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


//  Botão “Adicionar” dentro do modal
function handleModalAddButton(event) {
  const button = event.target.closest(".modal-add-button");
  if (!button) return;

  const locationId = button.dataset.locationId;
  if (!locationId) return;

  const alreadySelected = isLocationSelected(locationId);

  // Sempre será adicionar, pois o modal só tem o botão de adicionar
  const success = addLocation(locationId);

  if (success) {
    updateLocationCounter();

    // Se quiser trocar o texto do botão para “Adicionado ✓”
    button.innerHTML = `Adicionado <i class="bi bi-check-lg"></i>`;
    button.disabled = true;

    // Atualizar os cards (se existirem na tela)
    updateAllCardButtons();
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

  //  Listener global para o botão do modal
  document.body.addEventListener("click", handleModalAddButton);

  // Atualiza o estado dos botões dos cards
  updateAllCardButtons();

  // Inicializa o contador de locais selecionados
  updateLocationCounter();

  // Listener para o botão fixo
  if (navigateButton) {
    navigateButton.addEventListener("click", handleNavigateClick);
  }
});


// Mantém botões e contador sincronizados quando volta da navegação
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        updateAllCardButtons();
        updateLocationCounter();
    }
});
