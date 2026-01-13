import { describe, it, expect } from 'vitest';
import { slugify } from '@/lib/utils';

describe('slugify', () => {
  it('converts text to lowercase', () => {
    expect(slugify('Hello')).toBe('hello');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('handles multiple spaces and hyphens', () => {
    expect(slugify('Hello   World--Again')).toBe('hello-world-again');
  });

  it('trims hyphens from start and end', () => {
    expect(slugify('-Hello World-')).toBe('hello-world');
  });
});
