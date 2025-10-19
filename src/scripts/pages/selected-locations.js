import { getLocationsData } from '../modules/dataManager.js';
import { getSelectedLocations, removeLocation } from '../modules/selectedLocationsManager.js';
import { renderLocations } from '../modules/renderCardList.js';

const routesListContainer = document.getElementById("routes-list");

/**
 * Filtra os locais e renderiza apenas os selecionados pelo usuário.
 */
async function initSelectedRoutesPage() {
    // 1. Carrega todos os dados
    const allLocations = await getLocationsData(); 
    
    // 2. Obtém os IDs salvos
    const selectedIds = getSelectedLocations(); 

    // 3. Filtra a lista
    const selectedLocations = allLocations.filter(location => {
        // Garante que a comparação seja consistente (ex: string vs string)
        return selectedIds.includes(location.id.toString()); 
    });

    // 4. Renderiza a lista filtrada (reutiliza o renderizador)
    renderLocations(selectedLocations);
}

/**
 * Lógica de remoção de item na própria página de rotas selecionadas.
 */
async function handleRemoveClick(event) {
    const button = event.target.closest(".btn-card");
    if (button) {
        const locationId = button.dataset.locationId;
        
        // 1. Alterna o estado (remove o ID do localStorage)
        removeLocation(locationId);
        
        // 2. Re-renderiza a página para refletir a remoção
        initSelectedRoutesPage(); 
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initSelectedRoutesPage();
    
    // Adiciona listener para remover locais da lista
    if (routesListContainer) {
        // [AJUSTE]: O listener deve ser ASYNC
        routesListContainer.addEventListener('click', async (event) => {
            await handleRemoveClick(event);
        });
    }
});