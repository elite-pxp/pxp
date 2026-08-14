document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));

  const seriesMarquee = document.querySelector('.series-marquee');
  const mobileQuery = window.matchMedia('(max-width: 720px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointerQuery = window.matchMedia('(pointer: fine)');
  let seriesTimer;
  let resumeTimer;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let isSeriesDragging = false;
  let didSeriesDrag = false;

  const stopSeriesLoop = () => {
    window.clearInterval(seriesTimer);
    seriesTimer = undefined;
  };

  const startSeriesLoop = () => {
    stopSeriesLoop();
    if (!seriesMarquee || reducedMotionQuery.matches) return;

    seriesTimer = window.setInterval(() => {
      const cards = [...seriesMarquee.querySelectorAll('.series-set:first-child article')];
      if (cards.length < 2) return;

      const cardLefts = cards.map(card => card.offsetLeft);
      const currentIndex = cardLefts.reduce((closest, left, index) =>
        Math.abs(left - seriesMarquee.scrollLeft) < Math.abs(cardLefts[closest] - seriesMarquee.scrollLeft)
          ? index
          : closest, 0);
      const nextIndex = (currentIndex + 1) % cards.length;

      seriesMarquee.scrollTo({
        left: cardLefts[nextIndex],
        behavior: 'smooth'
      });
    }, 3600);
  };

  const pauseSeriesLoopForInteraction = () => {
    stopSeriesLoop();
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(startSeriesLoop, 4500);
  };

  ['pointerdown', 'touchstart', 'wheel'].forEach(eventName =>
    seriesMarquee?.addEventListener(eventName, pauseSeriesLoopForInteraction, { passive: true })
  );

  seriesMarquee?.addEventListener('pointerdown', event => {
    if (!finePointerQuery.matches || event.button !== 0) return;
    isSeriesDragging = true;
    didSeriesDrag = false;
    dragStartX = event.clientX;
    dragStartScroll = seriesMarquee.scrollLeft;
    seriesMarquee.classList.add('is-dragging');
    seriesMarquee.setPointerCapture(event.pointerId);
  });

  seriesMarquee?.addEventListener('pointermove', event => {
    if (!isSeriesDragging) return;
    const distance = event.clientX - dragStartX;
    if (Math.abs(distance) > 4) didSeriesDrag = true;
    seriesMarquee.scrollLeft = dragStartScroll - distance;
    event.preventDefault();
  });

  const endSeriesDrag = event => {
    if (!isSeriesDragging) return;
    isSeriesDragging = false;
    seriesMarquee.classList.remove('is-dragging');
    if (seriesMarquee.hasPointerCapture(event.pointerId)) {
      seriesMarquee.releasePointerCapture(event.pointerId);
    }
  };

  seriesMarquee?.addEventListener('pointerup', endSeriesDrag);
  seriesMarquee?.addEventListener('pointercancel', endSeriesDrag);
  seriesMarquee?.addEventListener('dragstart', event => event.preventDefault());
  seriesMarquee?.addEventListener('click', event => {
    if (!didSeriesDrag) return;
    event.preventDefault();
    event.stopPropagation();
    didSeriesDrag = false;
  }, true);

  mobileQuery.addEventListener('change', startSeriesLoop);
  reducedMotionQuery.addEventListener('change', startSeriesLoop);
  startSeriesLoop();
});
