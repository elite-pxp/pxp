/**
 * PXP Flip Reader
 * Copyright (c) 2026 PXP / Project Owner.
 * All rights reserved.
 */

export class PageRenderer {
  constructor() {
    this.root = null;
    this.pageCount = 1;
  }

  attach(root) {
    this.root = root;
    return this;
  }

  renderState({ currentPage = 1, pageCount = 1, fitMode = 'page', zoom = 1 } = {}) {
    this.pageCount = pageCount;

    if (!this.root) {
      return {
        currentPage,
        pageCount,
        fitMode,
        zoom,
      };
    }

    const surface = this.root.querySelector('.pxp-flip-reader__page-surface');
    if (surface) {
      surface.setAttribute('data-page', String(currentPage));
      surface.setAttribute('data-fit-mode', fitMode);
      surface.setAttribute('data-zoom', String(zoom));
      surface.style.transform = `scale(${zoom})`;
    }

    return {
      currentPage,
      pageCount,
      fitMode,
      zoom,
    };
  }
}
