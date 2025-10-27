// MÓDULO UI: Componente responsável por gerenciar a exibição, o conteúdo e o estado do Modal de detalhes do local.

let modalOverlay = null;

function initModal() {
  if (modalOverlay) return;
  modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";
  modalOverlay.innerHTML = `
    <div class="modal-container">
      <button class="modal-close" aria-label="Fechar modal">
        <i class="bi bi-x-lg"></i>
      </button>
      <img class="modal-image" src="" alt="">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title"></h2>
          <p class="modal-description"></p>
          <div class="modal-categories"></div>
        </div>
        
        <div class="modal-section">
          <h3 class="modal-section-title">
            <i class="bi bi-info-circle-fill"></i>
            Informações
          </h3>
          <div class="modal-info-grid"></div>
        </div>
        
        <div class="modal-section modal-attractions-section">
          <h3 class="modal-section-title">
            <i class="bi bi-star-fill"></i>
            Atrações
          </h3>
          <ul class="modal-attractions-list"></ul>
        </div>
        
        <div class="modal-section">
          <h3 class="modal-section-title">
            <i class="bi bi-telephone-fill"></i>
            Contato
          </h3>
          <div class="modal-contact-grid"></div>
        </div>
        
        <div class="modal-section">
          <h3 class="modal-section-title">
            <i class="bi bi-ticket-perforated-fill"></i>
            Visita
          </h3>
          <div class="modal-visit-badge"></div>
        </div>
        
        <a class="btn btn-primary modal-map-button" href="" target="_blank">
          <i class="bi bi-geo-alt-fill"></i>
          Ver no mapa
        </a>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const closeButton = modalOverlay.querySelector(".modal-close");
  closeButton.addEventListener("click", closeLocationModal);

  // Fecha o modal ao clicar fora dele
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeLocationModal();
    }
  });

  // Fecha o modal ao pressionar ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
      closeLocationModal();
    }
  });
}

export function openLocationModal(locationData) {
  initModal();

  const modal = modalOverlay;
  const image = modal.querySelector(".modal-image");
  image.src = locationData.imagem;
  image.alt = `Imagem de ${locationData.nome}`;

  // Título e descrição
  modal.querySelector(".modal-title").textContent = locationData.nome;
  modal.querySelector(".modal-description").textContent =
    locationData.descricao;

  // Categorias
  const categoriesContainer = modal.querySelector(".modal-categories");
  categoriesContainer.innerHTML = "";
  if (locationData.categorias && locationData.categorias.length > 0) {
    locationData.categorias.forEach((cat) => {
      const tag = document.createElement("span");
      tag.className = "modal-category-tag";
      tag.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categoriesContainer.appendChild(tag);
    });
  }

  // Informações
  const infoGrid = modal.querySelector(".modal-info-grid");
  infoGrid.innerHTML = "";

  if (locationData.informacoes) {
    const infoItems = [
      {
        icon: "bi-clock-fill",
        label: "Horário",
        text: locationData.informacoes.horario,
      },
      {
        icon: "bi-calendar-check-fill",
        label: "Dias abertos",
        text: locationData.informacoes["dias-abertos"],
      },
      {
        icon: "bi-backpack-fill",
        label: "O que levar",
        text: locationData.informacoes["o-que-levar"],
      },
      {
        icon: "bi-hourglass-split",
        label: "Tempo médio de visita",
        text: locationData.informacoes["tempo-medio-visita"],
      },
    ];

    infoItems.forEach((item) => {
      if (item.text) {
        const infoItem = document.createElement("div");
        infoItem.className = "modal-info-item";
        infoItem.innerHTML = `
          <i class="bi ${item.icon} modal-info-icon"></i>
          <div class="modal-info-content">
            <div class="modal-info-label">${item.label}</div>
            <div class="modal-info-text">${item.text}</div>
          </div>
        `;
        infoGrid.appendChild(infoItem);
      }
    });
  }

  // Atrações
  const attractionsList = modal.querySelector(".modal-attractions-list");
  attractionsList.innerHTML = "";

  if (locationData.atracoes && locationData.atracoes.length > 0) {
    locationData.atracoes.forEach((attraction) => {
      const li = document.createElement("li");
      li.textContent = attraction;
      attractionsList.appendChild(li);
    });
  } else {
    modal.querySelector(".modal-attractions-section").style.display = "none";
  }

  // Contato
  const contactGrid = modal.querySelector(".modal-contact-grid");
  contactGrid.innerHTML = "";

  if (locationData.contato) {
    if (locationData.contato.endereco) {
      const addressItem = document.createElement("div");
      addressItem.className = "modal-contact-item";
      addressItem.innerHTML = `
        <i class="bi bi-geo-alt-fill"></i>
        <span>${locationData.contato.endereco}</span>
      `;
      contactGrid.appendChild(addressItem);
    }

    if (locationData.contato.instagram) {
      const instaItem = document.createElement("div");
      instaItem.className = "modal-contact-item";
      instaItem.innerHTML = `
        <i class="bi bi-instagram"></i>
        <a href="https://instagram.com/${locationData.contato.instagram.replace(
          "@",
          ""
        )}" target="_blank">
          ${locationData.contato.instagram}
        </a>
      `;
      contactGrid.appendChild(instaItem);
    }
  }

  // Tipo de visita
  const visitBadge = modal.querySelector(".modal-visit-badge");
  if (locationData.visita && locationData.visita.tipo) {
    const icon =
      locationData.visita.tipo === "Gratuita"
        ? "bi-gift-fill"
        : "bi-ticket-perforated-fill";
    visitBadge.innerHTML = `
      <i class="bi ${icon}"></i>
      Entrada ${locationData.visita.tipo}
    `;
  }

  // Link do mapa
  const mapButton = modal.querySelector(".modal-map-button");
  if (locationData.mapa && locationData.mapa["link-mapa"]) {
    mapButton.href = locationData.mapa["link-mapa"];
  }

  // Mostra o modal
  requestAnimationFrame(() => {
    modalOverlay.classList.add("active");
  });

  document.body.style.overflow = "hidden";
}

// Fecha o modal
export function closeLocationModal() {
  if (!modalOverlay) return;

  modalOverlay.classList.remove("active");

  // Restaura o scroll do body
  document.body.style.overflow = "";
}
