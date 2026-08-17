/**
 * PXP Flip Reader
 * Copyright (c) 2026 PXP / Project Owner.
 * All rights reserved.
 */

export class FullscreenController {
  async toggle(element) {
    if (!element) {
      return false;
    }

    if (document.fullscreenElement === element) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      return false;
    }

    if (element.requestFullscreen) {
      await element.requestFullscreen();
      return true;
    }

    return false;
  }

  syncState(reader) {
    if (reader) {
      reader.isFullscreen = Boolean(document.fullscreenElement);
    }
    return reader?.isFullscreen ?? false;
  }
}
