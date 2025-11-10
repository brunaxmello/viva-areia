// MÓDULO UI: Responsável por construir, injetar e atualizar o HTML dos cards de localização. É agnóstico a dados e filtros.

import { isLocationSelected } from "../modules/selectedLocationsManager.js"; // Funções para gerenciar locais selecionados
import { getAddRemoveButtonHtml } from "../modules/locationCardInteractions.js"; // Função para gerar o HTML do botão de adicionar/remover

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

    const isSelected = isLocationSelected(locationId);

    const buttonHTML = getAddRemoveButtonHtml(locationId, isRemovablePage, isSelected);

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
