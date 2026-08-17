/**
 * PXP Flip Reader
 * Copyright (c) 2026 PXP / Project Owner.
 * All rights reserved.
 */

export class AnimationController {
  constructor({ enabled = true, duration = 220 } = {}) {
    this.enabled = Boolean(enabled);
    this.duration = duration;
  }

  apply(element) {
    if (!element) {
      return;
    }

    if (!this.enabled) {
      element.style.transition = 'none';
      return;
    }

    element.style.transition = `transform ${this.duration}ms ease, opacity ${this.duration}ms ease`;
  }
}
