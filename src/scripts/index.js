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
  routesListContainer.innerHTML = "";

  if (locations.length === 0) {
    routesListContainer.innerHTML = `<p class="message-info">Nenhum local encontrado para sua pesquisa.</p>`;
    return;
  }

  locations.forEach((location) => {
    const cardHTML = `
            <div class="card-location">
                <div class="image-card-location">
                    <img loading="lazy" src="${
                      location.imagem
                    }" alt="Imagem de ${location.nome}">
                </div>
                <div class="card-info">
                    <div class="card-info-content">
                        <h3>${location.nome}</h3>
                        <p>${location.descricao.substring(0, 80)}...</p>
                    </div>
                    <button class="btn btn-primary btn-add-location">Adicionar +</button>
                </div>
            </div>
        `;
    routesListContainer.innerHTML += cardHTML;
  });
}

// 2. LÓGICA DE FILTRAGEM
function applyFilters() {
  const searchTerm = searchInput.value;

  if (allLocations.length === 0) {
    console.warn("Dados ainda não carregados. allLocations está vazia.");
    return [];
  }
  const normalizedTerm = searchTerm.toLowerCase().trim();

  if (normalizedTerm === "") {
    return allLocations;
  }

  // Filtra pelo termo de busca
  const filteredBySearch = allLocations.filter((location) => {
    const nameMatch = location.nome.toLowerCase().includes(normalizedTerm);
    const descriptionMatch = location.descricao
      .toLowerCase()
      .includes(normalizedTerm);
    return nameMatch || descriptionMatch;
  });

  // Filtra pelas Categorias Ativas
  let finalFilteredList = filteredBySearch;

  if (activeCategories.length > 0) {
    finalFilteredList = filteredBySearch.filter((location) => {
      return location.categorias.some((cat) => activeCategories.includes(cat));
    });
  }

  renderLocations(finalFilteredList);
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
    const uniqueCategories = getUniqueCategories(allLocations);
    renderCategories(uniqueCategories);
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
    applyFilters();
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  categoriesContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".btn-category");
    if (button) {
      const category = button.dataset.category;
      handleCategoryClick(category);
    }
  });
});

/* === CATEGORIES FILTERING === */

const CATEGORY_ICONS = {
  gastronomia: "bi-fork-knife",
  natureza: "bi-tree-fill",
  historia: "bi-book-fill",
  engenhos: "bi-house-door-fill",
  cultura: "bi-camera-reels-fill",

  // Ícone para a opção padrão
  Todas: "bi-grid-fill",
};
let activeCategories = [];
const categoriesContainer = document.querySelector(".categories");

// 1. OBTEM AS CATEGORIAS DO JSON
function getUniqueCategories(locations) {
  const categoriesSet = new Set();
  locations.forEach((location) => {
    if (location.categorias && Array.isArray(location.categorias)) {
      location.categorias.forEach((cat) => categoriesSet.add(cat));
    }
  });
  return ["Todas", ...Array.from(categoriesSet).sort()];
}

// 2. RENDERIZA AS CATEGORIAS NA TELA
function renderCategories(categories) {
  categoriesContainer.innerHTML = "";

  const buttonsHTML = categories
    .map((category) => {
      const isActive =
        activeCategories.includes(category) ||
        (category === "Todas" && activeCategories.length === 0);

      const iconClass = CATEGORY_ICONS[category] || "bi-question-diamond-fill";

      return `
            <button class="btn btn-category ${
              isActive ? "active" : ""
            }" data-category="${category}">
                <div class="icon-category"> 
                    <i class="bi ${iconClass}" aria-hidden="true"></i>
                </div>
                    <span class="category-name">${
                      category.charAt(0).toUpperCase() + category.slice(1)
                    }</span>
                </div>
            </button>
        `;
    })
    .join("");

  categoriesContainer.innerHTML = buttonsHTML;
}

// 3. LÓGICA DE CLIQUE NAS CATEGORIAS
function handleCategoryClick(category) {
  if (category === "Todas") {
    activeCategories = [];
  } else {
    const index = activeCategories.indexOf(category);
    if (index > -1) {
      activeCategories.splice(index, 1);
    } else {
      activeCategories.push(category);
    }
  }

  renderCategories(getUniqueCategories(allLocations));

  applyFilters();
}

console.log(document.querySelector(".title-section-explore"));
