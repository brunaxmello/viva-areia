// JS específico para a página inicial. Inicializa a página principal, ativando a busca, categorias e tela de boas-vindas.

import { initWelcomeScreen } from "../modules/welcomeScreen.js"; // Função para inicializar a tela de boas-vindas no mobile ou no desktop
import { initSearchAndCategories } from "../modules/searchAndCategories.js"; // Função para inicializar a busca, filtros e listagem de locais
import { getSelectedLocations } from "../modules/selectedLocationsManager.js"; // Função para obter os locais selecionados

const navigateButton = document.querySelector(".btn-see-script");

// Função para ir ao roteiro com os locais selecionados
async function handleNavigateClick() {
  const count = getSelectedLocations().length;

  if (count === 0) {
    alert("Adicione pelo menos um ponto turístico ao seu roteiro!");
    return;
  }

  window.location.href = "./src/pages/selected-locations.html";
}

document.addEventListener("DOMContentLoaded", () => {
  // Inicializa o comportamento da tela de boas-vindas
  initWelcomeScreen();

  // Inicializa a tela de busca, filtros e listagem de locais
  initSearchAndCategories();

  // Listener para o botão fixo
  if (navigateButton) {
    navigateButton.addEventListener("click", handleNavigateClick);
  }
});
