// Progressive scroll animations: dynamic connecting lines and card reveals
function updateTimelineScroll() {
  const windowHeight = window.innerHeight;
  const triggerPoint = windowHeight * 0.78; // activates when elements reach ~78% down the viewport

  // 1. Reveal timeline nodes and cards smoothly
  document.querySelectorAll('.timeline-node, .stack-item-card').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      el.classList.add('in-view');
    }
  });

  // 2. Animate the vertical line downward as you scroll
  document.querySelectorAll('.timeline-vertical').forEach((timeline) => {
    const line = timeline.querySelector('.timeline-line');
    if (!line) return;

    const timelineRect = timeline.getBoundingClientRect();
    const timelineTop = timelineRect.top;
    const timelineHeight = timelineRect.height;

    if (timelineTop < triggerPoint) {
      const scrollDistance = triggerPoint - timelineTop;
      const progressPercent = Math.min(
        100,
        Math.max(0, (scrollDistance / (timelineHeight - 40)) * 100)
      );
      line.style.height = `${progressPercent}%`;
    } else {
      line.style.height = '0%';
    }
  });
}

// Event listeners
window.addEventListener('scroll', updateTimelineScroll, { passive: true });
window.addEventListener('resize', updateTimelineScroll);
window.addEventListener('DOMContentLoaded', updateTimelineScroll);