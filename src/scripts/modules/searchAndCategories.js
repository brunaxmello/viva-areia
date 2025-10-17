/* === SEARCH BAR END CATEGORIES === */

const CATEGORY_ICONS = {
  gastronomia: "bi-fork-knife",
  natureza: "bi-tree-fill",
  historia: "bi-book-fill",
  engenhos: "bi-house-door-fill",
  cultura: "bi-camera-reels-fill",

  // Ícone para a opção padrão
  Todas: "bi-grid-fill",
};

let activeCategory = "Todas";
let allLocations = [];

const routesListContainer = document.getElementById("routes-list");
const searchInput = document.getElementById("search-input");
const searchForm = document.querySelector(".search-box");
const categoriesContainer = document.querySelector(".categories");

// RENDERIZAR LOCAIS NA TELA
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
                </div>
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

// CARREGAR DADOS E INICIAR A APLICAÇÃO
export async function initSearchAndCategories() {
  try {
    const response = await fetch("src/data/locations.json");
    if (!response.ok) {
      throw new Error("Erro ao carregar o arquivo JSON: " + response.status);
    }
    allLocations = await response.json();
    renderLocations(allLocations);
    renderCategories(getUniqueCategories(allLocations));
  } catch (error) {
    console.error("Erro ao carregar os dados das localizações:", error);
    routesListContainer.innerHTML =
      '<p class="message-error">Não foi possível carregar os locais turísticos no momento. Tente novamente mais tarde.</p>';
  }

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