// MÓDULO UI: Controla o comportamento e a transição da tela de boas-vindas no modo mobile.

export function initWelcomeScreen() {
  const exploreButton = document.getElementById("explore-button");
  const welcomeScreen = document.getElementById("welcome-screen");
  const mainView = document.getElementById("main-view");
  const desktopBreakpoint = window.matchMedia("(min-width: 768px)");

  exploreButton.addEventListener("click", () => {
    if (desktopBreakpoint.matches) {
      mainView.scrollIntoView({ behavior: "smooth" });
    } else {
      welcomeScreen.style.display = "none";
      mainView.style.display = "block";
    }
  });
}
