// JS específico para a página de rotas selecionadas. Inicializa a página, filtrando e exibindo apenas os locais salvos no localStorage.

import {
  getLocationsData,
  getLocationDataById,
} from "../modules/dataManager.js"; // Função para obter os dados completos das localizações
import {
  getSelectedLocations,
  removeLocation,
  isLocationSelected,
} from "../modules/selectedLocationsManager.js"; // Funções para gerenciar os locais selecionados
import { renderLocations } from "../modules/renderCardList.js"; // Função para listar os locais (é usada tanto no home como no selected-locations)
import { closeLocationModal } from "../modules/locationModal.js"; // Função para abrir o modal de detalhes do local (é usada tanto no home como no selected-locations)
import { handleActionClick } from "../modules/locationCardInteractions.js"; // Função unificada para tratar cliques no Card e Botões (Lista e Modal)

const locationsListContainer = document.getElementById("locations-list");

// Filtra os locais e renderiza apenas os selecionados pelo usuário.
async function initSelectedLocationsPage() {
  const allLocations = await getLocationsData();

  const selectedIds = getSelectedLocations();

  const selectedLocations = allLocations.filter((location) => {
    return selectedIds.includes(location.id.toString());
  });

  renderLocations(selectedLocations, true);
}

async function handleRemoveAction(locationId) {
    const wasRemoved = removeLocation(locationId); 
    
    if (wasRemoved) {
        // Se a remoção for bem-sucedida no localStorage
        closeLocationModal(); 
        
        // Força a re-renderização da página completa
        await initSelectedLocationsPage(); 
    }
}

function handleModalClick(event) {
    const actionButton = event.target.closest(".btn-card, .button-add-container button");
    if (actionButton) {
        const locationId = actionButton.dataset.locationId;
        
        // Ação deve ser sempre REMOVER nesta página
        handleRemoveAction(locationId); 
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initSelectedLocationsPage(); 
    
    // Anexa o listener de ação para o botão do card e o botão do modal
    document.body.addEventListener('click', async (event) => {
        
        const actionButton = event.target.closest(".btn-card, .button-add-container button");
        
        if (actionButton) {
             // Se for clique no botão, chamamos a lógica de remoção centralizada
             event.stopPropagation();
             await handleRemoveAction(actionButton.dataset.locationId);
        } else {
             // Caso contrário, usa o handleActionClick para abrir o modal
             await handleActionClick(event);
        }
    });
});