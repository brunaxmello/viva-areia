// MÓDULO DE DADOS: responsável por buscar, armazenar e fornecer os dados do JSON.

let allLocations = [];

// Carrega os dados das localizações a partir do arquivo JSON
async function loadLocationsData() {
  try {
    const response = await fetch("../src/data/locations.json");
    if (!response.ok) {
      throw new Error("Erro ao carregar o arquivo JSON: " + response.status);
    }
    allLocations = await response.json();
  } catch (error) {
    console.error("Erro ao carregar os dados das localizações:", error);
  }
}

// Função para obter os dados das localizações
export async function getLocationsData() {
    if (allLocations.length === 0) {
        await loadLocationsData();
    }
    // Retorna uma cópia para evitar modificação acidental
    return [...allLocations]; 
}

//  Função para obter os dados completos do local pelo ID
export async function getLocationDataById(locationId) {

  // Garante que os dados estejam carregados 
  await loadLocationsData();
  
  // Busca na lista completa de locais carregados
  return allLocations.find((loc) => loc.id.toString() === locationId);
}