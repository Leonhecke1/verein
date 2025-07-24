
document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('darkToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const html = document.documentElement;
      const theme = html.getAttribute('data-bs-theme');
      html.setAttribute('data-bs-theme', theme === 'light' ? 'dark' : 'light');
    });
  }
});
