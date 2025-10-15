const exploreButton = document.getElementById('explore-button');
const welcomeScreen = document.getElementById('welcome-screen');
const mainView = document.getElementById('main-view');
const desktopBreakpoint = window.matchMedia('(min-width: 768px)');


exploreButton.addEventListener('click', () => {
    if (desktopBreakpoint.matches) {
        mainView.scrollIntoView({ behavior: 'smooth' });
        console.log('clicou');
        console.log(mainView);
    } else {
        welcomeScreen.style.display = 'none';
        mainView.style.display = 'block';
        
    }
})