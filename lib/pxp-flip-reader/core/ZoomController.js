/**
 * PXP Flip Reader
 * Copyright (c) 2026 PXP / Project Owner.
 * All rights reserved.
 */

export class ZoomController {
  constructor() {
    this.minZoom = 0.5;
    this.maxZoom = 2.5;
    this.step = 0.25;
    this.zoom = 1;
    this.fitMode = 'page';
  }

  setZoom(value) {
    this.zoom = Math.min(Math.max(value, this.minZoom), this.maxZoom);
    return this.zoom;
  }

  zoomIn() {
    return this.setZoom(this.zoom + this.step);
  }

  zoomOut() {
    return this.setZoom(this.zoom - this.step);
  }

  reset() {
    this.zoom = 1;
    this.fitMode = 'page';
    return this.zoom;
  }

  setFitMode(mode) {
    if (!['page', 'width', 'auto'].includes(mode)) {
      throw new Error('Unsupported fit mode.');
    }

    this.fitMode = mode;
    return this.fitMode;
  }
}
