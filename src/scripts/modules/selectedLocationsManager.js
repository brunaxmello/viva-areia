// MÓDULO DE ESTADO: Gerencia a persistência dos locais selecionados do usuário (IDs) via localStorage.

const STORAGE_KEY = "vivaAreiaSelectedLocations";

// Inicializa a lista de locais selecionados do localStorage
function getSelectedLocations() {
  const json = localStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

// Salva a lista de locais selecionadas no localStorage
function saveLocations(locations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
}

// Verifica se um local está na lista de selecionados
export function isLocationSelected(locationId) {
  const locations = getSelectedLocations();
  return locations.includes(locationId);
}

// Adiciona um local à lista de selecionados
export function addLocation(locationId) {
  let locations = getSelectedLocations();

  if (!locations.includes(locationId)) {
    locations.push(locationId);
    saveLocations(locations);
    return true;
  }

  return false; // Já estava na lista
}

// Remove um local da lista de selecionados
export function removeLocation(locationId) {
  let locations = getSelectedLocations();
  const index = locations.indexOf(locationId);

  if (index > -1) {
    locations.splice(index, 1);
    saveLocations(locations);
    return true;
  }

  return false; // Não estava na lista
}

export { getSelectedLocations };
