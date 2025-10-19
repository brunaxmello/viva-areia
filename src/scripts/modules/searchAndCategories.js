// MÓDULO DE LÓGICA: Gerencia o estado dos filtros (pesquisa e categorias), usando o dataManager e o renderCardList.

import { getLocationsData } from "./dataManager.js";
import { renderLocations } from "./renderCardList.js";
import { updateAllCardButtons } from "../modules/renderCardList.js"; // Função para atualizar o estado dos botões dos cards

const CATEGORY_ICONS = {
  gastronomia: "bi-fork-knife",
  natureza: "bi-tree-fill",
  historia: "bi-book-fill",
  engenhos: "bi-house-door-fill",
  cultura: "bi-camera-reels-fill",

  // Ícone para a opção padrão
  Todas: "bi-grid-fill",
};
const searchInput = document.getElementById("search-input");
const searchForm = document.querySelector(".search-box");
const categoriesContainer = document.querySelector(".categories");

let activeCategory = "Todas";
let allLocations = [];

// OBTEM AS CATEGORIAS DO JSON
function getUniqueCategories(locations) {
  const categoriesSet = new Set();
  locations.forEach((location) => {
    if (location.categorias && Array.isArray(location.categorias)) {
      location.categorias.forEach((cat) => categoriesSet.add(cat));
    }
  });
  return ["Todas", ...Array.from(categoriesSet).sort()];
}

// RENDERIZA AS CATEGORIAS NA TELA
function renderCategories(categories) {
  categoriesContainer.innerHTML = "";

  const buttonsHTML = categories
    .map((category) => {
      const isActive = category === activeCategory;

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
            </button>
        `;
    })
    .join("");

  categoriesContainer.innerHTML = buttonsHTML;
}

// LÓGICA DE FILTRAGEM DA BARRA DE PESQUISA E CATEGORIAS
function applyFilters() {
  const searchTerm = searchInput.value;
  const normalizedTerm = searchTerm.toLowerCase().trim();

  // 1. FILTRO DE BUSCA
  let filteredBySearch = allLocations;

  if (normalizedTerm !== "") {
    filteredBySearch = allLocations.filter((location) => {
      const nameMatch = location.nome.toLowerCase().includes(normalizedTerm);
      const descriptionMatch = location.descricao
        .toLowerCase()
        .includes(normalizedTerm);
      return nameMatch || descriptionMatch;
    });
  }

  // 2. FILTRO DE CATEGORIA
  let finalFilteredList = filteredBySearch;

  if (activeCategory !== "Todas") {
    finalFilteredList = filteredBySearch.filter((location) => {
      return location.categorias.includes(activeCategory);
    });
  }

  renderLocations(finalFilteredList);

  updateAllCardButtons();
}

// LÓGICA DE CLIQUE NAS CATEGORIAS
function handleCategoryClick(category) {
  if (category === activeCategory) {
    activeCategory = "Todas";
  } else {
    activeCategory = category;
  }

  renderCategories(getUniqueCategories(allLocations));

  applyFilters();
}

// INICIALIZAÇÃO DO MÓDULO
export async function initSearchAndCategories() {
  allLocations = await getLocationsData();

  renderLocations(allLocations);
  renderCategories(getUniqueCategories(allLocations));

  searchInput.addEventListener("input", (event) => {
    applyFilters();
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  categoriesContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".btn-category");
    if (button) {
      handleCategoryClick(button.dataset.category);
    }
  });
}
