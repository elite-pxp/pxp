/**
 * PXP Flip Reader
 * Copyright (c) 2026 PXP / Project Owner.
 * All rights reserved.
 */

export class KeyboardController {
  handle(event, reader) {
    if (!event || !reader) {
      return null;
    }

    const key = event.key || '';

    if (key === 'ArrowRight' || key === 'PageDown') {
      reader.nextPage();
      return 'next';
    }

    if (key === 'ArrowLeft' || key === 'PageUp') {
      reader.previousPage();
      return 'previous';
    }

    if (key === '+' || key === '=') {
      reader.zoomIn();
      return 'zoom-in';
    }

    if (key === '-' || key === '_') {
      reader.zoomOut();
      return 'zoom-out';
    }

    return null;
  }
}
