/**
 * PXP Flip Reader
 * Copyright (c) 2026 PXP / Project Owner.
 * All rights reserved.
 */

export class ReaderUI {
  constructor(reader) {
    this.reader = reader;
    this.root = null;
    this.statusNode = null;
    this.pageInfoNode = null;
    this.zoomInfoNode = null;
  }

  render() {
    const container = this.reader.container;
    if (!container) {
      return;
    }

    this.root = document.createElement('div');
    this.root.className = 'pxp-flip-reader';
    this.root.setAttribute('role', 'region');
    this.root.setAttribute('aria-label', 'PXP flip reader');

    this.root.innerHTML = `
      <div class="pxp-flip-reader__toolbar">
        <button type="button" class="pxp-flip-reader__button" data-action="prev" aria-label="Previous page">Prev</button>
        <button type="button" class="pxp-flip-reader__button" data-action="next" aria-label="Next page">Next</button>
        <button type="button" class="pxp-flip-reader__button" data-action="zoom-out" aria-label="Zoom out">-</button>
        <button type="button" class="pxp-flip-reader__button" data-action="zoom-in" aria-label="Zoom in">+</button>
        <button type="button" class="pxp-flip-reader__button" data-action="fullscreen" aria-label="Toggle fullscreen">Full</button>
      </div>
      <div class="pxp-flip-reader__viewport" aria-live="polite">
        <div class="pxp-flip-reader__page-surface"></div>
      </div>
      <div class="pxp-flip-reader__status-bar">
        <span class="pxp-flip-reader__status">Ready</span>
        <span class="pxp-flip-reader__page-info">1 / 1</span>
        <span class="pxp-flip-reader__zoom-info">100%</span>
      </div>
    `;

    container.appendChild(this.root);
    this.attachInteractions();
    this.statusNode = this.root.querySelector('.pxp-flip-reader__status');
    this.pageInfoNode = this.root.querySelector('.pxp-flip-reader__page-info');
    this.zoomInfoNode = this.root.querySelector('.pxp-flip-reader__zoom-info');
    this.updateDocumentInfo();
    this.updateZoomInfo();
    this.updateStatus('Ready');
  }

  attachInteractions() {
    this.root.addEventListener('click', (event) => {
      const target = event.target;
      const action = target?.dataset?.action;

      switch (action) {
        case 'prev':
          this.reader.previousPage();
          break;
        case 'next':
          this.reader.nextPage();
          break;
        case 'zoom-in':
          this.reader.zoomIn();
          break;
        case 'zoom-out':
          this.reader.zoomOut();
          break;
        case 'fullscreen':
          this.reader.toggleFullscreen();
          break;
        default:
          break;
      }
    });
  }

  updateDocumentInfo() {
    if (!this.pageInfoNode) {
      return;
    }

    this.pageInfoNode.textContent = `${this.reader.currentPage} / ${this.reader.pageCount}`;
  }

  updateZoomInfo() {
    if (!this.zoomInfoNode) {
      return;
    }

    this.zoomInfoNode.textContent = `${Math.round(this.reader.zoom * 100)}%`;
  }

  updateStatus(message) {
    if (!this.statusNode) {
      return;
    }

    this.statusNode.textContent = message || 'Ready';
  }

  destroy() {
    if (this.root && this.root.remove) {
      this.root.remove();
    }
  }
}
