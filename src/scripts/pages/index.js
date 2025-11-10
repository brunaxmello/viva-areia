// JS específico para a página inicial. Inicializa a página principal, ativando a busca, categorias e tela de boas-vindas.

import { initWelcomeScreen } from "../modules/welcomeScreen.js"; // Função para inicializar a tela de boas-vindas no mobile ou no desktop
import { initSearchAndCategories } from "../modules/searchAndCategories.js"; // Função para inicializar a busca, filtros e listagem de locais
import { getSelectedLocations } from "../modules/selectedLocationsManager.js"; // Função para obter os locais selecionados
import { updateAllCardButtons, handleActionClick } from "../modules/locationCardInteractions.js"; // Função para atualizar o estado dos botões dos cards
import { updateLocationCounter } from "../modules/badgeLocationCounter.js"; // Função para atualizar o contador de locais selecionados

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

document.addEventListener("DOMContentLoaded", async () => {
  // Inicializa o comportamento da tela de boas-vindas
  initWelcomeScreen(); // Inicializa a tela de busca, filtros e listagem de locais

  await initSearchAndCategories(); // Listener para os cards de localizações

 // Listener global para TODAS as interações com cards e botões
  document.body.addEventListener("click", handleActionClick);

  updateAllCardButtons(); // Inicializa o contador de locais selecionados

  updateLocationCounter(); // Listener para o botão fixo

  if (navigateButton) {
    navigateButton.addEventListener("click", handleNavigateClick);
  }
});

// Mantém botões e contador sincronizados quando volta da navegação
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    updateAllCardButtons();
    updateLocationCounter();
  }
});