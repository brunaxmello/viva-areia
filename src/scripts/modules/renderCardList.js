const locationsListContainer = document.getElementById("locations-list");

// Recebe uma lista de locais e renderiza os cards na tela
export function renderLocations(locations) {
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
    const cardHTML = `
            <div class="card-location" data-location-id="${location.id}">
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
                    <button class="btn btn-primary btn-card" data-location-id="${
                      location.id
                    }">Adicionar <i class="bi bi-plus-lg"></i></button>
                </div>
            </div>
        `;
    locationsListContainer.innerHTML += cardHTML;
  });
}
