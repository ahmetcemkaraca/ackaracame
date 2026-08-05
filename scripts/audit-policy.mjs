const SEVERITY = new Map([
  ['info', 0],
  ['low', 1],
  ['moderate', 2],
  ['high', 3],
  ['critical', 4]
]);

const sorted = (values) => [...values].sort((left, right) => left.localeCompare(right));

const assertExactSet = (actual, expected, label) => {
  const actualValues = sorted(new Set(actual));
  const expectedValues = sorted(new Set(expected));
  if (JSON.stringify(actualValues) !== JSON.stringify(expectedValues)) {
    throw new Error(
      `${label} changed. Expected [${expectedValues.join(', ')}], received [${actualValues.join(', ')}].`
    );
  }
};

const advisoryIdFromUrl = (url) => {
  if (typeof url !== 'string') return null;
  const match = url.match(/\/advisories\/(GHSA-[a-z0-9-]+)$/iu);
  return match?.[1] ?? null;
};

export const assertZeroVulnerabilities = (report, label) => {
  if (!report || typeof report !== 'object' || !report.metadata?.vulnerabilities) {
    throw new Error(`${label} audit did not return vulnerability metadata.`);
  }
  const total = report.metadata.vulnerabilities.total;
  if (total !== 0) {
    throw new Error(`${label} dependency graph contains ${total} known vulnerabilities.`);
  }
};

export const validateDevelopmentAuditException = ({ report, policy, now = new Date() }) => {
  if (!report || typeof report !== 'object' || !report.vulnerabilities) {
    throw new Error('The complete root audit did not return a vulnerability map.');
  }
  if (policy.schemaVersion !== 1) throw new Error('Unsupported dependency audit policy schema.');
  if (typeof policy.owner !== 'string' || policy.owner.trim().length < 3) {
    throw new Error('The dependency audit exception must have an accountable owner.');
  }
  if (typeof policy.rationale !== 'string' || policy.rationale.trim().length < 80) {
    throw new Error('The dependency audit exception must include a concrete rationale.');
  }
  const reviewDeadline = Date.parse(`${policy.reviewBy}T23:59:59.999Z`);
  if (!Number.isFinite(reviewDeadline) || now.getTime() > reviewDeadline) {
    throw new Error(`The dependency audit exception expired on ${policy.reviewBy}.`);
  }
  const maximum = SEVERITY.get(policy.maximumSeverity);
  if (maximum === undefined) throw new Error('Invalid maximum audit exception severity.');

  const entries = Object.entries(report.vulnerabilities);
  const affectedPackages = entries.map(([packageName]) => packageName);
  const advisoryIds = [];
  for (const [packageName, vulnerability] of entries) {
    const severity = SEVERITY.get(vulnerability.severity);
    if (severity === undefined || severity > maximum) {
      throw new Error(`${packageName} exceeds the ${policy.maximumSeverity} exception ceiling.`);
    }
    if (vulnerability.isDirect && packageName !== 'firebase-tools') {
      throw new Error(`Unexpected directly vulnerable dependency: ${packageName}.`);
    }
    for (const cause of vulnerability.via ?? []) {
      if (cause && typeof cause === 'object') {
        const advisoryId = advisoryIdFromUrl(cause.url);
        if (!advisoryId) throw new Error(`${packageName} has an advisory without an exact GHSA ID.`);
        advisoryIds.push(advisoryId);
      }
    }
  }

  assertExactSet(affectedPackages, policy.affectedPackages, 'Allowed affected package set');
  if (entries.length > 0 && advisoryIds.length === 0) {
    throw new Error('Vulnerabilities were reported without a traceable advisory ID.');
  }
  assertExactSet(advisoryIds, policy.advisories, 'Allowed advisory set');
  return {
    advisoryIds: sorted(new Set(advisoryIds)),
    affectedPackages: sorted(affectedPackages),
    reviewBy: policy.reviewBy
  };
};

export const validateFirebaseToolsLock = ({ rootManifest, lockfile, functionsManifest, policy }) => {
  const expectedVersion = policy.firebaseToolsVersion;
  if (rootManifest.devDependencies?.['firebase-tools'] !== expectedVersion) {
    throw new Error(`firebase-tools must be an exact ${expectedVersion} root devDependency.`);
  }
  if (rootManifest.dependencies?.['firebase-tools']) {
    throw new Error('firebase-tools must never be a web runtime dependency.');
  }
  if (
    functionsManifest.dependencies?.['firebase-tools']
    || functionsManifest.devDependencies?.['firebase-tools']
  ) {
    throw new Error('firebase-tools must never enter the deployed Functions dependency graph.');
  }
  const locked = lockfile.packages?.['node_modules/firebase-tools'];
  if (locked?.version !== expectedVersion || !locked.integrity?.startsWith('sha512-')) {
    throw new Error('firebase-tools is not exact-version and integrity bound in package-lock.json.');
  }
};
