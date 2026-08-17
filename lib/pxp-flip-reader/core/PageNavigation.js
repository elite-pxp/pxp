/**
 * PXP Flip Reader
 * Copyright (c) 2026 PXP / Project Owner.
 * All rights reserved.
 */

export class PageNavigation {
  clampPage(page, pageCount) {
    if (!Number.isFinite(page)) {
      throw new TypeError('page number must be a finite number');
    }

    if (pageCount <= 0) {
      return 1;
    }

    return Math.min(Math.max(1, Math.round(page)), pageCount);
  }

  next(page, pageCount) {
    return this.clampPage(page + 1, pageCount);
  }

  previous(page, pageCount) {
    return this.clampPage(page - 1, pageCount);
  }
}
