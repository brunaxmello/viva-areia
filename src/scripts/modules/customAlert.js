// MÓDULO UI: Modal customizado para substituir alert() nativo

let customAlertOverlay = null;

function initCustomAlert() {
  if (customAlertOverlay) return;
  
  customAlertOverlay = document.createElement("div");
  customAlertOverlay.className = "custom-alert-overlay";
  customAlertOverlay.innerHTML = `
    <div class="custom-alert-container">
      <div class="custom-alert-content">
        <div class="custom-alert-icon">
          <i class="bi bi-check-lg"></i>
        </div>
        <div class="custom-alert-text">
          <h2 class="custom-alert-title"></h2>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(customAlertOverlay);

  // Fecha ao clicar no container do modal
  const container = customAlertOverlay.querySelector(".custom-alert-container");
  container.addEventListener("click", closeCustomAlert);

  // Fecha o modal ao clicar fora dele (no overlay)
  customAlertOverlay.addEventListener("click", (e) => {
    if (e.target === customAlertOverlay) {
      closeCustomAlert();
    }
  });

  // Fecha o modal ao pressionar ESC ou ENTER
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Escape" || e.key === "Enter") && customAlertOverlay.classList.contains("active")) {
      closeCustomAlert();
    }
  });
}

export function customAlert(title) {
  initCustomAlert();
  
  const titleElement = customAlertOverlay.querySelector(".custom-alert-title");
  titleElement.textContent = title;
  
  requestAnimationFrame(() => {
    customAlertOverlay.classList.add("active");
  });

  document.body.style.overflow = "hidden";
}

function closeCustomAlert() {
  if (!customAlertOverlay) return;

  customAlertOverlay.classList.remove("active");
  document.body.style.overflow = "";
}