import { initWelcomeScreen } from "../modules/welcomeScreen.js";
import { initSearchAndCategories } from "../modules/searchAndCategories.js";
import { getSelectedLocations } from "../modules/selectedLocationsManager.js";

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
