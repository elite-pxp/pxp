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
  let seriesTimer;
  let resumeTimer;

  const stopSeriesLoop = () => {
    window.clearInterval(seriesTimer);
    seriesTimer = undefined;
  };

  const startSeriesLoop = () => {
    stopSeriesLoop();
    if (!seriesMarquee || !mobileQuery.matches || reducedMotionQuery.matches) return;

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
  mobileQuery.addEventListener('change', startSeriesLoop);
  reducedMotionQuery.addEventListener('change', startSeriesLoop);
  startSeriesLoop();
});
