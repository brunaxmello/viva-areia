// MÓDULO UI: Modal customizado para substituir alert() nativo e acessível

let customAlertOverlay = null;
let lastFocusedElementForAlert = null;
let alertKeyHandler = null;

function initCustomAlert() {
  if (customAlertOverlay) return;

  customAlertOverlay = document.createElement("div");
  customAlertOverlay.className = "custom-alert-overlay";
  customAlertOverlay.innerHTML = `
    <div class="custom-alert-container" role="alertdialog" aria-modal="true" aria-hidden="true" tabindex="-1">
      <button class="custom-alert-close" aria-label="Fechar alerta">
        <i class="bi bi-x-lg"></i>
      </button>
      <div class="custom-alert-content" aria-live="polite">
        <div class="custom-alert-icon">
          <i class="bi bi-check-lg"></i>
        </div>
        <div class="custom-alert-text">
          <h2 class="custom-alert-title"></h2>
          <p class="custom-alert-message"></p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(customAlertOverlay);

  const container = customAlertOverlay.querySelector(".custom-alert-container");
  const closeBtn = customAlertOverlay.querySelector(".custom-alert-close");

  // Fecha ao clicar no botão de fechar
  closeBtn.addEventListener("click", closeCustomAlert);

  // Fecha ao clicar fora do container (no overlay)
  customAlertOverlay.addEventListener("click", (e) => {
    if (e.target === customAlertOverlay) {
      closeCustomAlert();
    }
  });

  // Fecha o modal ao pressionar ESC ou ENTER
  alertKeyHandler = function (e) {
    if ((e.key === "Escape" || e.key === "Enter") && customAlertOverlay.classList.contains("active")) {
      closeCustomAlert();
    }
  };
  document.addEventListener("keydown", alertKeyHandler);
}

export function customAlert(title) {
  initCustomAlert();

  const container = customAlertOverlay.querySelector(".custom-alert-container");
  const titleElement = customAlertOverlay.querySelector(".custom-alert-title");
  const messageElement = customAlertOverlay.querySelector(".custom-alert-message");
  
  // Separar título e mensagem se houver quebra de linha
  const parts = title.split('\n');
  titleElement.textContent = parts[0];
  messageElement.textContent = parts.slice(1).join('\n');
  
  container.setAttribute("aria-hidden", "false");

  // Guarda o foco atual para restaurar depois
  lastFocusedElementForAlert = document.activeElement;

  requestAnimationFrame(() => {
    customAlertOverlay.classList.add("active");
    container.focus();
  });

  document.body.style.overflow = "hidden";
}

function closeCustomAlert() {
  if (!customAlertOverlay) return;

  const container = customAlertOverlay.querySelector(".custom-alert-container");
  customAlertOverlay.classList.remove("active");
  container.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  // Remove listener de teclado
  if (alertKeyHandler) {
    document.removeEventListener("keydown", alertKeyHandler);
    alertKeyHandler = null;
  }

  // Restaura o foco para o elemento que estava antes do alerta
  if (lastFocusedElementForAlert && typeof lastFocusedElementForAlert.focus === "function") {
    lastFocusedElementForAlert.focus();
  }
  lastFocusedElementForAlert = null;
}