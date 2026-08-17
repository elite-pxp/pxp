/**
 * PXP Flip Reader
 * Copyright (c) 2026 PXP / Project Owner.
 * All rights reserved.
 */

export class ThumbnailPanel {
  constructor() {
    this.items = [];
  }

  setItems(items) {
    this.items = Array.isArray(items) ? items : [];
    return this.items;
  }

  open(index) {
    if (!Number.isInteger(index)) {
      throw new TypeError('Thumbnail index must be an integer.');
    }

    return Math.max(0, Math.min(index, this.items.length - 1));
  }
}
