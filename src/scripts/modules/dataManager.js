// Este módulo se concentra unicamente em buscar e armazenar os dados crus.

let allLocations = [];

const locationsListContainer = document.getElementById("locations-list");

async function loadLocationsData() {
  try {
    const response = await fetch("/src/data/locations.json");
    if (!response.ok) {
      throw new Error("Erro ao carregar o arquivo JSON: " + response.status);
    }
    allLocations = await response.json();
  } catch (error) {
    console.error("Erro ao carregar os dados das localizações:", error);
    if (locationsListContainer) {
      locationsListContainer.innerHTML =
        '<p class="message-error">Não foi possível carregar os locais turísticos no momento. Tente novamente mais tarde.</p>';
    }
  }
}

// Exporta a função para obter os dados das localizações
export async function getLocationsData() {
    if (allLocations.length === 0) {
        await loadLocationsData();
    }
    // Retorna uma cópia para evitar modificação acidental
    return [...allLocations]; 
}

// Função para obter os dados completos do local pelo ID
export async function getLocationDataById(locationId) {

  // Garante que os dados estejam carregados 
  await loadLocationsData();
  
  // Busca na lista completa de locais carregados
  return allLocations.find((loc) => loc.id.toString() === locationId);
}