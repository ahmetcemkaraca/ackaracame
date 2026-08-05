import { decodeHashTargetId } from './App';

describe('route fragment parsing', () => {
  it('decodes a valid element id without treating it as a CSS selector', () => {
    expect(decodeHashTargetId('#section%20one')).toBe('section one');
    expect(decodeHashTargetId('#work%3Afeatured')).toBe('work:featured');
  });

  it('fails safely for empty and malformed fragments', () => {
    expect(decodeHashTargetId('')).toBeNull();
    expect(decodeHashTargetId('#')).toBeNull();
    expect(decodeHashTargetId('#%')).toBeNull();
  });
});
