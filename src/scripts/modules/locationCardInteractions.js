// MÓDULO UI: Responsável por construir o HTML do botão de adicionar/remover para os cards e modais de localizações.

import { getLocationDataById } from "../modules/dataManager.js"; // Função para obter dados do local pelo ID
import { openLocationModal } from "../modules/locationModal.js"; // Função para abrir o modal de detalhes do local
import {
  addLocation,
  removeLocation,
  isLocationSelected,
  getSelectedLocations, // ← ADICIONADO
} from "../modules/selectedLocationsManager.js"; // Funções para gerenciar locais selecionados
import { updateLocationCounter } from "../modules/badgeLocationCounter.js"; // Função para atualizar o contador de locais selecionados
import { customAlert } from "../modules/customAlert.js"; // ← ADICIONADO



// Gera o HTML do botão de adicionar/remover para os cards e modais de localizações
export function getAddRemoveButtonHtml(locationId, isRemovablePage, isSelected = false) {
    const isRemovableState = isRemovablePage || isSelected;

    // Classe base: btn-card é essencial para a delegação de eventos
    const baseClasses = "btn btn-primary btn-card";
    
    // 1. ESTADO REMOVER (Usado em selected-locations.html ou se já estiver no localStorage)
    if (isRemovableState) {
        return `<button class="${baseClasses} btn-remove-location" data-location-id="${locationId}">
                    Remover <i class="bi bi-dash-lg"></i>
                </button>`;
    }

    // 2. ESTADO PADRÃO (Adicionar)
    return `<button class="${baseClasses}" data-location-id="${locationId}">
                Adicionar <i class="bi bi-plus-lg"></i>
            </button>`;
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


// Função Unificada para tratar cliques no Card e Botões (Lista e Modal)
export async function handleActionClick(event) {
  // Detecta o botão de ação (união das classes de botão no card e no modal)
  const actionButton = event.target.closest(
    ".btn-card, .button-add-container button"
  );
  const card = event.target.closest(".card-location");

  // Determina o ID do local, priorizando o botão se clicado
  const locationId =
    actionButton?.dataset.locationId || card?.dataset.locationId;

  if (!locationId) return;

  if (actionButton) {
    // >> LÓGICA DE ADICIONAR/REMOVER (Botão do Card OU Botão do Modal) <<

    event.stopPropagation();
    let isAdded = isLocationSelected(locationId);
    let actionSuccessful;

    if (isAdded) {
      actionSuccessful = removeLocation(locationId);
      isAdded = false;
    } else {
      actionSuccessful = addLocation(locationId);
      isAdded = true;
      
    
      const selectedCount = getSelectedLocations().length;
      if (selectedCount === 1) {
        customAlert("Primeiro ponto adicionado!\nVeja seu roteiro completo clicando no botão abaixo e continue montando sua viagem.");
      }
    }

    if (actionSuccessful) {
      // Atualiza o botão CLICADO (seja no card ou no modal)
      toggleCardButton(actionButton, isAdded);

      // Sincroniza a listagem inteira (necessário se o clique veio do modal)
      updateAllCardButtons();

      updateLocationCounter();
    }
  } else if (card) {
    // >> LÓGICA DE ABRIR MODAL (Clique no Card) <<

    const locationData = await getLocationDataById(locationId);

    if (locationData) {
      openLocationModal(locationData);
    } else {
      console.error(`Dados do local ID ${locationId} não encontrados.`);
    }
  }
}