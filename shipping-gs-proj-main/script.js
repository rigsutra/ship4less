const menuButton = document.getElementById('menuButton');
const sideMenu = document.getElementById('sideMenu');
const closeButton = document.getElementById('closeButton');

menuButton.addEventListener('click', () => {
    sideMenu.classList.toggle('show');
});

closeButton.addEventListener('click', () => {
    sideMenu.classList.toggle('show');
});

