// Função para atualizar o contador de locais selecionados

import { getSelectedLocations } from "../modules/selectedLocationsManager.js"; // Função para obter os locais selecionados

export function updateLocationCounter() {
  const counter = document.getElementById("location-counter");
  if (!counter) return;
  const count = getSelectedLocations().length;
  counter.textContent = count; // Mostra o contador apenas se houver locais selecionados
  if (count > 0) {
    counter.classList.add("show");
  } else {
    counter.classList.remove("show");
  }
}