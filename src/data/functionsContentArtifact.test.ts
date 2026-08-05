import { describe, expect, it } from 'vitest';

import functionsContent from '../../functions/data/canonical-content.json';
import { parseContentBundle } from '../domain/content';
import { fallbackContentBundle } from './portfolio';

describe('canonical Functions content artifact', () => {
  it('is schema-valid and exactly matches the public bundled fallback', () => {
    const artifact = parseContentBundle(functionsContent);
    expect(artifact).toEqual(fallbackContentBundle);
    // This immutable source must not inherit generated-content.json precedence:
    // a stale but schema-valid 2/0 production snapshot cannot shrink recovery.
    expect(artifact.projects).toHaveLength(8);
    expect(artifact.journal).toHaveLength(2);
  });
});
