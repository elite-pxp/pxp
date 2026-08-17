/**
 * PXP Flip Reader
 * Copyright (c) 2026 PXP / Project Owner.
 * All rights reserved.
 */

import { ReaderController } from './core/ReaderController.js';

export class PXPFlipReader extends ReaderController {
  constructor(config = {}) {
    super(config);
    return this;
  }
}

export function createPXPFlipReader(config = {}) {
  return new PXPFlipReader(config);
}

export { ReaderController } from './core/ReaderController.js';
export { DocumentLoader } from './core/DocumentLoader.js';
export { PageRenderer } from './core/PageRenderer.js';
export { PageNavigation } from './core/PageNavigation.js';
export { ThumbnailPanel } from './core/ThumbnailPanel.js';
export { ZoomController } from './core/ZoomController.js';
export { FullscreenController } from './core/FullscreenController.js';
export { GestureController } from './core/GestureController.js';
export { KeyboardController } from './core/KeyboardController.js';
export { AnimationController } from './core/AnimationController.js';
export { ReaderUI } from './core/ReaderUI.js';

export default PXPFlipReader;
