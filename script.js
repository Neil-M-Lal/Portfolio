// Fade in cards smoothly as they scroll into view
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active-in');
      }
    });
  },
  { threshold: 0.08 }
);

document.querySelectorAll('.glass-card, .section-header, .hero-title').forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  observer.observe(el);
});

// Class trigger on intersection
window.addEventListener('scroll', () => {
  document.querySelectorAll('.active-in').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
});