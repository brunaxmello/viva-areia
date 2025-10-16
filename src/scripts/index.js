/* === WELCOME SCREEN === */

const exploreButton = document.getElementById("explore-button");
const welcomeScreen = document.getElementById("welcome-screen");
const mainView = document.getElementById("main-view");
const desktopBreakpoint = window.matchMedia("(min-width: 768px)");

exploreButton.addEventListener("click", () => {
  if (desktopBreakpoint.matches) {
    mainView.scrollIntoView({ behavior: "smooth" });
    console.log("clicou");
    console.log(mainView);
  } else {
    welcomeScreen.style.display = "none";
    mainView.style.display = "block";
  }
});

/* === SEARCH BAR === */

let allLocations = [];
const routesListContainer = document.getElementById("routes-list");
const searchInput = document.getElementById("search-input");
const searchForm = document.querySelector(".search-box");

// 1. RENDERIZAR LOCAIS NA TELA
function renderLocations(locations) {
  
  routesListContainer.innerHTML = '';

  if (locations.length === 0) {
    routesListContainer.innerHTML = `<p class="message-info">Nenhum local encontrado para sua pesquisa.</p>`;
    return;
  }

  locations.forEach((location) => {
    const cardHTML = `
            <div class="card-local">
                <img src="${location.imagem}" alt="Imagem de ${location.nome}">
                <div class="card-info">
                    <h3>${location.nome}</h3>
                    <p>${location.descricao.substring(0, 80)}...</p>
                    <button class="btn-adicionar">Adicionar +</button>
                </div>
            </div>
        `;
    routesListContainer.innerHTML += cardHTML;
  });
}

// 2. LÓGICA DE FILTRAGEM
function filterLocations(searchTerm) {
    if (allLocations.length === 0) {
        console.warn("Dados ainda não carregados. allLocations está vazia.");
        return [];
    }
  const normalizedTerm = searchTerm.toLowerCase().trim();

  if (normalizedTerm === "") {
    return allLocations;
  }

  const filtered = allLocations.filter((location) => {
    const nameMatch = location.nome.toLowerCase().includes(normalizedTerm);
    const descriptionMatch = location.descricao
      .toLowerCase()
      .includes(normalizedTerm);
    return nameMatch || descriptionMatch;
  });

  return filtered;
}

// 3. CARREGAR DADOS E INICIAR A APLICAÇÃO
async function fetchAndInitialize() {
  try {
    const response = await fetch("src/data/locations.json");
    if (!response.ok) {
      throw new Error(
        "Erro ao carregar o arquivo JSON! status: " + response.status
      );
    }
    allLocations = await response.json();
    renderLocations(allLocations);
  } catch (error) {
    console.error("Erro ao carregar os dados das localizações:", error);
    routesListContainer.innerHTML =
      '<p class="message-error">Não foi possível carregar os locais turísticos no momento. Tente novamente mais tarde.</p>';
  }
}

// 4. CONFIGURAÇÃO DE EVENTOS
document.addEventListener("DOMContentLoaded", () => {

  fetchAndInitialize();

  searchInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value;
    const filteredList = filterLocations(searchTerm);
    renderLocations(filteredList);
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
});
