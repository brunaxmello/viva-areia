// MÓDULO UI: Componente responsável por gerenciar a exibição, o conteúdo e o estado do Modal de detalhes do local.

import { isLocationSelected } from "../modules/selectedLocationsManager.js"; // Import necessário para verificar seleção
import { getAddRemoveButtonHtml } from "../modules/locationCardInteractions.js"; // Função para gerar o HTML do botão de adicionar/remover

let modalOverlay = null;
let lastFocusedElement = null;
let modalKeyDownHandler = null;

function initModal() {
  if (modalOverlay) return;
  modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";
  modalOverlay.innerHTML = `
    <div class="modal-container">
      <button class="modal-close" aria-label="Fechar modal">
        <i class="bi bi-x-lg"></i>
      </button>
      <div class="modal-content">
        <img class="modal-image" src="" alt="">
        <div class="modal-header">
          <h2 class="modal-title"></h2>
          <p class="modal-description"></p>
          <div class="modal-categories"></div>
        </div>
        
        <div class="modal-section">
          <h3 class="modal-section-title">Informações</h3>
          <div class="modal-info-grid"></div>
        </div>
        
        <div class="modal-section modal-attractions-section">
          <h3 class="modal-section-title">Atrações</h3>
          <ul class="modal-attractions-list"></ul>
        </div>
        
        <div class="modal-section">
          <h3 class="modal-section-title">Contato</h3>
          <div class="modal-contact-grid"></div>
        </div>
        
        <div class="modal-section">
          <h3 class="modal-section-title">Visita</h3>
          <div class="modal-visit-badge"></div>
        </div>

        <div class="button-add-container"></div>
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
      li.innerHTML = `
        <i class="bi bi-check-lg attraction-icon" aria-hidden="true"></i>
        <span class="attraction-text">${attraction}</span>
      `;
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

  //  Configura o botão de adicionar com o ID do local
  const btnAddContainer = modal.querySelector(".button-add-container");
  const locationId = locationData.id;

  // Determina o estado inicial (já selecionado ou não)
  const alreadySelected = isLocationSelected(locationId);

  // Gera o HTML do botão usando o módulo compartilhado
  // Passamos false para isRemovablePage (pois é o modal)
  const modalButtonHTML = getAddRemoveButtonHtml(
      locationId, 
      false, // Não é a página de remoção
      alreadySelected 
  );

  btnAddContainer.innerHTML = modalButtonHTML;

  // Mostra o modal
  requestAnimationFrame(() => {
    modalOverlay.classList.add("active");
    const modalContainer = modal.querySelector('.modal-container');
    if (modalContainer) {
      modalContainer.setAttribute('role', 'dialog');
      modalContainer.setAttribute('aria-modal', 'true');
      modalContainer.setAttribute('tabindex', '-1');
      // Linka título e descrição para leitores de tela
      const titleEl = modal.querySelector('.modal-title');
      const descEl = modal.querySelector('.modal-description');
      if (titleEl && !titleEl.id) titleEl.id = `modal-title-${locationId}`;
      if (descEl && !descEl.id) descEl.id = `modal-desc-${locationId}`;
      modalContainer.setAttribute('aria-labelledby', titleEl.id);
      modalContainer.setAttribute('aria-describedby', descEl.id);
    }
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  });

  // Guarda o elemento que tinha foco antes de abrir
  lastFocusedElement = document.activeElement;

  // Manipulador de teclado para trap de foco e fechar com ESC
  modalKeyDownHandler = function (e) {
    if (e.key === "Escape") {
      closeLocationModal();
      return;
    }

    if (e.key === "Tab") {
      const focusable = modal.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  document.addEventListener("keydown", modalKeyDownHandler);

  document.body.style.overflow = "hidden";
}

// Fecha o modal
export function closeLocationModal() {
  if (!modalOverlay) return;

  modalOverlay.classList.remove("active");

  // Restaura o scroll do body
  document.body.style.overflow = "";
  // Remove listener de teclado do modal
  if (modalKeyDownHandler) {
    document.removeEventListener("keydown", modalKeyDownHandler);
    modalKeyDownHandler = null;
  }

  // Retorna o foco para o elemento anterior
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
  lastFocusedElement = null;
}
