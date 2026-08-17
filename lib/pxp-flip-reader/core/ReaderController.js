/**
 * PXP Flip Reader
 * Copyright (c) 2026 PXP / Project Owner.
 * All rights reserved.
 */

import { DocumentLoader } from './DocumentLoader.js';
import { PageNavigation } from './PageNavigation.js';
import { ZoomController } from './ZoomController.js';
import { KeyboardController } from './KeyboardController.js';
import { GestureController } from './GestureController.js';
import { FullscreenController } from './FullscreenController.js';
import { AnimationController } from './AnimationController.js';
import { ReaderUI } from './ReaderUI.js';
import { PageRenderer } from './PageRenderer.js';

export class ReaderController {
  constructor(config = {}) {
    this.config = {
      container: config.container || '#reader',
      source: config.source || '',
      pageCount: config.pageCount || 1,
      pageFlip: config.pageFlip ?? true,
      zoomStep: config.zoomStep ?? 0.25,
      minZoom: config.minZoom ?? 0.5,
      maxZoom: config.maxZoom ?? 2.5,
      loadingLabel: config.loadingLabel ?? 'Loading document…',
      errorLabel: config.errorLabel ?? 'Unable to load document.',
      onPageChange: config.onPageChange || null,
    };

    this.documentLoader = new DocumentLoader();
    this.pageNavigation = new PageNavigation();
    this.zoomController = new ZoomController();
    this.zoomController.step = this.config.zoomStep;
    this.zoomController.minZoom = this.config.minZoom;
    this.zoomController.maxZoom = this.config.maxZoom;
    this.keyboardController = new KeyboardController();
    this.gestureController = new GestureController();
    this.fullscreenController = new FullscreenController();
    this.animationController = new AnimationController({ enabled: this.config.pageFlip });

    this.source = this.config.source;
    this.pageCount = this.config.pageCount;
    this.currentPage = 1;
    this.status = 'ready';
    this.error = '';
    this.fitMode = 'page';
    this.zoom = 1;
    this.container = this.resolveContainer(this.config.container);
    this.pageRenderer = new PageRenderer();
    this.pageRenderer.attach(this.container);
    this.ui = new ReaderUI(this);

    this.initialize();
  }

  resolveContainer(container) {
    if (!container) {
      return null;
    }

    if (typeof container === 'string') {
      return globalThis.document?.querySelector(container) || null;
    }

    return container;
  }

  initialize() {
    this.ui.render();
    this.bindGlobalEvents();

    if (this.source) {
      this.openDocument(this.source);
    }
  }

  bindGlobalEvents() {
    if (typeof globalThis.window !== 'undefined') {
      globalThis.window.addEventListener('keydown', (event) => this.handleKeydown(event));
      globalThis.window.addEventListener('fullscreenchange', () => this.fullscreenController.syncState(this));
    }
  }

  async openDocument(source) {
    this.setStatus('loading', this.config.loadingLabel);
    this.source = source;

    try {
      const document = await this.documentLoader.load(source);
      this.pageCount = document.pageCount || this.pageCount || 1;
      this.currentPage = this.pageNavigation.clampPage(this.currentPage, this.pageCount);
      this.setStatus('ready');
      this.ui.updateDocumentInfo();
      this.pageRenderer.attach(this.container);
      this.pageRenderer.renderState({
        currentPage: this.currentPage,
        pageCount: this.pageCount,
        fitMode: this.fitMode,
        zoom: this.zoom,
      });
      this.emitPageChange();
      return document;
    } catch (error) {
      this.setStatus('error', error.message || this.config.errorLabel);
      this.error = error.message || this.config.errorLabel;
      throw error;
    }
  }

  openPage(pageNumber) {
    if (!Number.isFinite(Number(pageNumber))) {
      throw new TypeError('page number must be a number');
    }

    const normalized = this.pageNavigation.clampPage(Number(pageNumber), this.pageCount);
    this.currentPage = normalized;
    this.ui.updateDocumentInfo();
    this.pageRenderer.attach(this.container);
    this.pageRenderer.renderState({
      currentPage: this.currentPage,
      pageCount: this.pageCount,
      fitMode: this.fitMode,
      zoom: this.zoom,
    });
    this.emitPageChange();
    return this.currentPage;
  }

  nextPage() {
    this.openPage(this.pageNavigation.next(this.currentPage, this.pageCount));
    return this.currentPage;
  }

  previousPage() {
    this.openPage(this.pageNavigation.previous(this.currentPage, this.pageCount));
    return this.currentPage;
  }

  zoomIn() {
    this.zoom = this.zoomController.zoomIn();
    this.ui.updateZoomInfo();
    return this.zoom;
  }

  zoomOut() {
    this.zoom = this.zoomController.zoomOut();
    this.ui.updateZoomInfo();
    return this.zoom;
  }

  setFitMode(mode) {
    this.fitMode = this.zoomController.setFitMode(mode);
    this.ui.updateZoomInfo();
    return this.fitMode;
  }

  toggleFullscreen() {
    return this.fullscreenController.toggle(this.container);
  }

  handleKeydown(event) {
    const action = this.keyboardController.handle(event, this);
    if (action) {
      this.emitPageChange();
    }
    return action;
  }

  setStatus(status, message = '') {
    this.status = status;
    this.error = status === 'error' ? message : '';
    this.ui.updateStatus(message || this.status);
  }

  emitPageChange() {
    if (typeof this.config.onPageChange === 'function') {
      this.config.onPageChange({
        currentPage: this.currentPage,
        pageCount: this.pageCount,
        status: this.status,
        zoom: this.zoom,
        fitMode: this.fitMode,
      });
    }

    this.pageRenderer.attach(this.container);
    this.pageRenderer.renderState({
      currentPage: this.currentPage,
      pageCount: this.pageCount,
      fitMode: this.fitMode,
      zoom: this.zoom,
    });
  }

  destroy() {
    this.ui.destroy();
  }

  get zoom() {
    return this.zoomController.zoom;
  }

  set zoom(value) {
    this.zoomController.setZoom(value);
  }

  get pageFlip() {
    return this.animationController.enabled;
  }

  set pageFlip(value) {
    this.animationController.enabled = Boolean(value);
  }
}
