/**
 * PXP Flip Reader
 * Copyright (c) 2026 PXP / Project Owner.
 * All rights reserved.
 */

export class GestureController {
  constructor() {
    this.touchStartX = 0;
    this.touchStartY = 0;
  }

  onTouchStart(event) {
    const touch = event?.touches?.[0] || event;
    this.touchStartX = touch.clientX || 0;
    this.touchStartY = touch.clientY || 0;
  }

  onTouchEnd(event, reader) {
    const touch = event?.changedTouches?.[0] || event;
    const deltaX = (touch.clientX || 0) - this.touchStartX;
    const deltaY = Math.abs((touch.clientY || 0) - this.touchStartY);

    if (Math.abs(deltaX) > 30 && deltaY < 50) {
      if (deltaX < 0) {
        reader.nextPage();
      } else {
        reader.previousPage();
      }
    }
  }
}
