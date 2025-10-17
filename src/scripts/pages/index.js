import { initWelcomeScreen } from "../modules/welcomeScreen.js";
import { initSearchAndCategories } from "../modules/searchAndCategories.js";

document.addEventListener("DOMContentLoaded", () => {
  initWelcomeScreen();
  initSearchAndCategories();
});