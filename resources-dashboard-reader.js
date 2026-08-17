import { PXPFlipReader } from './lib/pxp-flip-reader/index.js';

const container = document.querySelector('#pxp-study-reader');
let reader = null;
let activeNote = null;

const renderPage = () => {
  if (!reader || !activeNote) return;
  const surface = container.querySelector('.pxp-flip-reader__page-surface');
  if (!surface) return;
  const message = 'Open Study Notes to read this week’s complete teaching notes in the community.';
  surface.innerHTML = `<article class="pxp-reader-sheet"><span>${activeNote.month}</span><small>Powered X Prayer</small><h4>${activeNote.title}</h4><p>${message}</p><b>${activeNote.date || ''}</b></article>`;
  surface.classList.remove('is-turning');
  requestAnimationFrame(() => surface.classList.add('is-turning'));
};

const initializeReader = note => {
  activeNote = note;
  if (!reader) {
    reader = new PXPFlipReader({
      container,
      pageCount: 1,
      pageFlip: true,
      onPageChange: renderPage,
    });
    container.addEventListener('touchstart',event => reader.gestureController.onTouchStart(event),{passive:true});
    container.addEventListener('touchend',event => reader.gestureController.onTouchEnd(event,reader),{passive:true});
  }
  reader.source = note.source;
  reader.pageCount = 1;
  reader.openPage(1);
  reader.setStatus('Preview ready');
  renderPage();
};

window.addEventListener('pxp:study-note-selected',event => initializeReader(event.detail));
