// Progressive synchronized line drawing & node reveal
function updateTimelineScroll() {
  const windowHeight = window.innerHeight;
  // Trigger line roughly 75% down the viewport
  const triggerPoint = windowHeight * 0.75;

  // 1. Synchronized Timeline Line & Node Reveals
  document.querySelectorAll('.timeline-vertical').forEach((timeline) => {
    const line = timeline.querySelector('.timeline-line');
    const nodes = timeline.querySelectorAll('.timeline-node');
    if (!line) return;

    const timelineRect = timeline.getBoundingClientRect();
    const timelineTop = timelineRect.top;
    const timelineHeight = timelineRect.height;

    // Track scroll depth relative to the timeline start
    let drawnPx = 0;
    if (timelineTop < triggerPoint) {
      drawnPx = Math.max(0, triggerPoint - timelineTop);
      const maxHeight = timelineHeight - 30;
      const progressPercent = Math.min(100, (drawnPx / maxHeight) * 100);
      line.style.height = `${progressPercent}%`;
    } else {
      line.style.height = '0%';
    }

    // Reveal each card/node only when the drawn line reaches its top offset
    nodes.forEach((node) => {
      const nodeTopRelative = node.offsetTop;
      if (drawnPx >= nodeTopRelative - 20) {
        node.classList.add('in-view');
      } else {
        node.classList.remove('in-view'); // Re-hides smoothly if scrolling up
      }
    });
  });

  // 2. "What I Love Building" cards reveal
  document.querySelectorAll('.stack-item-card').forEach((card) => {
    const rect = card.getBoundingClientRect();
    if (rect.top < triggerPoint + 40) {
      card.classList.add('in-view');
    } else {
      card.classList.remove('in-view');
    }
  });
}

// Attach listeners
window.addEventListener('scroll', updateTimelineScroll, { passive: true });
window.addEventListener('resize', updateTimelineScroll);
window.addEventListener('DOMContentLoaded', updateTimelineScroll);