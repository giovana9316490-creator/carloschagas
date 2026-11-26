
const menuButton = document.querySelector('.menu-btn');
const nav = document.querySelector('nav');

if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
        nav.classList.toggle('open');
    });
}

document.querySelectorAll('nav a').forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    }
});

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(element => {
    observer.observe(element);
});

const year = document.querySelector('#year');

if (year) {
    year.textContent = new Date().getFullYear();
}

