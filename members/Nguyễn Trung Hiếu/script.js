document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page-view');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const pageId = button.getAttribute('data-page');

            navButtons.forEach(btn => btn.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));

            const targetPage = document.getElementById('page-' + pageId);
            if (targetPage) {
                targetPage.classList.add('active');
            }

            button.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
});