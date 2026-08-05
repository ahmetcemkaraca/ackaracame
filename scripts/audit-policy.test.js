import { describe, expect, it } from 'vitest';
import {
  assertZeroVulnerabilities,
  validateDevelopmentAuditException,
  validateFirebaseToolsLock
} from './audit-policy.mjs';

const policy = {
  schemaVersion: 1,
  owner: 'repository-owner',
  reviewBy: '2026-10-31',
  firebaseToolsVersion: '15.25.1',
  maximumSeverity: 'moderate',
  rationale: 'A sufficiently detailed risk decision explaining the exact non-runtime tool path and compensating controls for the temporary exception.',
  advisories: ['GHSA-8988-4f7v-96qf'],
  affectedPackages: ['firebase-tools', 'transitive-package']
};

const report = {
  vulnerabilities: {
    'firebase-tools': {
      severity: 'moderate',
      isDirect: true,
      via: ['transitive-package']
    },
    'transitive-package': {
      severity: 'moderate',
      isDirect: false,
      via: [{ url: 'https://github.com/advisories/GHSA-8988-4f7v-96qf' }]
    }
  }
};

describe('dependency audit policy', () => {
  it('accepts only the exact, reviewed deploy-tool advisory closure', () => {
    expect(validateDevelopmentAuditException({
      report,
      policy,
      now: new Date('2026-08-04T00:00:00Z')
    })).toMatchObject({ advisoryIds: ['GHSA-8988-4f7v-96qf'] });
  });

  it('rejects new advisories, package drift, excessive severity, and expiry', () => {
    expect(() => validateDevelopmentAuditException({
      report: {
        vulnerabilities: {
          ...report.vulnerabilities,
          surprise: { severity: 'moderate', isDirect: false, via: [] }
        }
      },
      policy,
      now: new Date('2026-08-04T00:00:00Z')
    })).toThrow(/package set changed/u);
    expect(() => validateDevelopmentAuditException({
      report: {
        vulnerabilities: {
          ...report.vulnerabilities,
          'transitive-package': {
            severity: 'high',
            isDirect: false,
            via: [{ url: 'https://github.com/advisories/GHSA-8988-4f7v-96qf' }]
          }
        }
      },
      policy,
      now: new Date('2026-08-04T00:00:00Z')
    })).toThrow(/exceeds/u);
    expect(() => validateDevelopmentAuditException({
      report,
      policy,
      now: new Date('2026-11-01T00:00:00Z')
    })).toThrow(/expired/u);
  });

  it('requires clean runtime reports', () => {
    expect(() => assertZeroVulnerabilities({
      metadata: { vulnerabilities: { total: 1 } }
    }, 'Runtime')).toThrow(/known vulnerabilities/u);
    expect(() => assertZeroVulnerabilities({
      metadata: { vulnerabilities: { total: 0 } }
    }, 'Runtime')).not.toThrow();
  });

  it('keeps the exact CLI outside both runtime dependency graphs', () => {
    expect(() => validateFirebaseToolsLock({
      rootManifest: { devDependencies: { 'firebase-tools': '15.25.1' } },
      lockfile: {
        packages: {
          'node_modules/firebase-tools': { version: '15.25.1', integrity: 'sha512-exact' }
        }
      },
      functionsManifest: { dependencies: {} },
      policy
    })).not.toThrow();
    expect(() => validateFirebaseToolsLock({
      rootManifest: { dependencies: { 'firebase-tools': '15.25.1' } },
      lockfile: { packages: {} },
      functionsManifest: { dependencies: {} },
      policy
    })).toThrow(/devDependency/u);
  });
});
