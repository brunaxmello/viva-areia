// MÓDULO UI: Responsável por construir, injetar e atualizar o HTML dos cards de localização. É agnóstico a dados e filtros.

import { isLocationSelected } from "../modules/selectedLocationsManager.js"; // Funções para gerenciar locais selecionados

const locationsListContainer = document.getElementById("locations-list");

// Recebe uma lista de locais e renderiza os cards na tela
export function renderLocations(locations, isRemovablePage = false) {
  if (!locationsListContainer) {
    console.error("Contêiner da lista de locais (ID) não encontrado no DOM.");
    return;
  }

  locationsListContainer.innerHTML = "";

  if (locations.length === 0) {
    locationsListContainer.innerHTML = `<p class="message-info">Nenhum local encontrado para sua pesquisa.</p>`;
    return;
  }

  locations.forEach((location) => {
    const locationId = location.id ? location.id.toString() : location.nome;

    const buttonHTML = isRemovablePage
      ? `<button class="btn btn-primary btn-card btn-remove-location" data-location-id="${locationId}">Remover <i class="bi bi-dash-lg"></i></button>`
      : `<button class="btn btn-primary btn-card" data-location-id="${locationId}">Adicionar <i class="bi bi-plus-lg"></i></button>`;

    const cardHTML = `
            <div class="card-location" data-location-id="${locationId}">
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
                    ${buttonHTML}
                </div>
            </div>
        `;
    locationsListContainer.innerHTML += cardHTML;
  });
}

// Função que troca o texto e a aparência do botão do card
export function toggleCardButton(buttonElement, isAdded) {
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
export function updateAllCardButtons() {
  document.querySelectorAll(".btn-card").forEach((button) => {
    const locationId = button.dataset.locationId;
    const isSelected = isLocationSelected(locationId);
    toggleCardButton(button, isSelected);
  });
}
