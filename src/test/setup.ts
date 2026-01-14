import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;

  constructor(type: string, props: any) {
    super(type, props);
    this.button = props?.button || 0;
    this.ctrlKey = props?.ctrlKey || false;
    this.metaKey = props?.metaKey || false;
    this.shiftKey = props?.shiftKey || false;
    this.altKey = props?.altKey || false;
  }
}

// Polyfill PointerEvent for Radix UI
window.PointerEvent = MockPointerEvent as any;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();

// ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

