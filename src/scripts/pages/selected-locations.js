// JS específico para a página de rotas selecionadas. Inicializa a página, filtrando e exibindo apenas os locais salvos no localStorage.

import { getLocationsData } from '../modules/dataManager.js'; // Função para obter os dados completos das localizações
import { getSelectedLocations, removeLocation } from '../modules/selectedLocationsManager.js'; // Funções para gerenciar os locais selecionados
import { renderLocations } from '../modules/renderCardList.js'; // Função para listar os locais (é usada tanto no home como no selected-locations)

const locationsListContainer = document.getElementById("locations-list");


// Filtra os locais e renderiza apenas os selecionados pelo usuário.
async function initSelectedLocationsPage() {

    const allLocations = await getLocationsData(); 
    
    const selectedIds = getSelectedLocations(); 

    const selectedLocations = allLocations.filter(location => {
        return selectedIds.includes(location.id.toString()); 
    });

    renderLocations(selectedLocations, true);
}

// Lógica de remoção de item na própria página de rotas selecionadas.
async function handleRemoveClick(event) {
    const button = event.target.closest(".btn-card");
    if (button) {
        const locationId = button.dataset.locationId;
        
        // 1. Alterna o estado (remove o ID do localStorage)
        removeLocation(locationId);
        
        // 2. Re-renderiza a página para refletir a remoção
        initSelectedLocationsPage(); 
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initSelectedLocationsPage();
    
    // Adiciona listener para remover locais da lista
    if (locationsListContainer) {
        // [AJUSTE]: O listener deve ser ASYNC
        locationsListContainer.addEventListener('click', async (event) => {
            await handleRemoveClick(event);
        });
    }
});