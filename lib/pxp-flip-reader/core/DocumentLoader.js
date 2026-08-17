/**
 * PXP Flip Reader
 * Copyright (c) 2026 PXP / Project Owner.
 * All rights reserved.
 */

export class DocumentLoader {
  constructor() {
    this.cache = new Map();
  }

  async load(source) {
    if (!source) {
      throw new Error('A document source is required.');
    }

    if (this.cache.has(source)) {
      return this.cache.get(source);
    }

    const document = {
      source,
      pageCount: 1,
      pages: [],
    };

    this.cache.set(source, document);
    return document;
  }

  invalidate(source) {
    if (source) {
      this.cache.delete(source);
      return;
    }

    this.cache.clear();
  }
}
