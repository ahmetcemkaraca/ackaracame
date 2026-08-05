import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import {
  ensureFunctionsEnvironmentFile,
  removeGeneratedFunctionsEnvironmentFile
} from './functions-env-file.mjs';
import { validateProductionEnvironment } from './production-env.mjs';
import {
  assertBundledBootstrapRequest,
  createBundledBootstrapPlan,
  createFirebaseDeployPhases,
  installBundledBootstrap,
  parseBundledBootstrapMode,
  restoreBundledBootstrap
} from './bundled-bootstrap.mjs';
import { resolvePinnedFirebaseCli } from './pinned-firebase-cli.mjs';

const requireInput = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
};

let reportContext = null;
let deploymentActivated = false;
let functionsEnvironmentFile = null;
let bundledBootstrapInstallation = null;

const markWorkflowResultReported = () => {
  const outputPath = process.env.GITHUB_OUTPUT?.trim();
  if (!outputPath) return;
  appendFileSync(outputPath, 'result_reported=true\n', { encoding: 'utf8' });
};

const run = (command, args, env = process.env) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const error = new Error(`${command} exited with code ${result.status ?? 'unknown'}.`);
    error.exitCode = result.status ?? 1;
    throw error;
  }
};

const main = async () => {
  const productionEnvironment = validateProductionEnvironment(process.env);
  const projectId = requireInput('FIREBASE_PROJECT_ID');
  requireInput('ACKARACA_STORAGE_BUCKET');
  const contentRevision = requireInput('ACKARACA_CONTENT_REVISION');
  if (!/^(?:0|[1-9][0-9]*)$/u.test(contentRevision) || !Number.isSafeInteger(Number(contentRevision))) {
    throw new Error('ACKARACA_CONTENT_REVISION must be a non-negative safe integer.');
  }
  if (requireInput('CONFIRM_PRODUCTION_DEPLOY') !== `deploy:${projectId}`) {
    throw new Error(`CONFIRM_PRODUCTION_DEPLOY must equal deploy:${projectId}.`);
  }
  const bundledBootstrapEnabled = parseBundledBootstrapMode(
    process.env.ACKARACA_BOOTSTRAP_FROM_BUNDLED_CONTENT
  );
  let bundledBootstrapPlan = null;
  if (bundledBootstrapEnabled) {
    bundledBootstrapPlan = await createBundledBootstrapPlan({ projectId });
    assertBundledBootstrapRequest({
      rawMode: process.env.ACKARACA_BOOTSTRAP_FROM_BUNDLED_CONTENT,
      contentRevision,
      projectId,
      confirmation: process.env.CONFIRM_BUNDLED_BOOTSTRAP,
      plan: bundledBootstrapPlan
    });
  }
  functionsEnvironmentFile = ensureFunctionsEnvironmentFile({
    environment: productionEnvironment,
    projectRoot: process.cwd()
  });
  const firebaseCli = resolvePinnedFirebaseCli();
  run(firebaseCli.command, [...firebaseCli.argsPrefix, '--version']);
  run(process.execPath, ['functions/verify-owner-account.mjs'], {
    ...process.env,
    ACKARACA_OWNER_PREFLIGHT_MODE: bundledBootstrapEnabled ? 'bootstrap' : 'normal'
  });

  const deploymentId = process.env.MEDIA_DEPLOYMENT_ID?.trim()
    || `r${contentRevision}-${Date.now()}-${crypto.randomUUID()}`;
  if (!/^[a-zA-Z0-9_-]{8,100}$/u.test(deploymentId)) {
    throw new Error('MEDIA_DEPLOYMENT_ID must be 8-100 URL-safe characters when provided.');
  }
  const baseEnv = {
    ...process.env,
    ACKARACA_EXPORT_FIRESTORE: bundledBootstrapEnabled ? 'false' : 'true',
    CONFIRM_CONTENT_EXPORT: 'ACKARACA_PUBLIC_CONTENT',
    MEDIA_DEPLOYMENT_ID: deploymentId
  };
  reportContext = {
    baseEnv,
    projectId,
    revision: contentRevision,
    deploymentId,
    failureCode: 'production-deploy-failed'
  };
  if (bundledBootstrapPlan) {
    bundledBootstrapInstallation = installBundledBootstrap({ plan: bundledBootstrapPlan });
    console.log(
      `Installed validated bundled revision-0 content (${bundledBootstrapPlan.hash}) for this build.`
    );
  }
  reportContext.failureCode = 'build-failed';
  run('npm', ['run', 'build'], baseEnv);
  reportContext.failureCode = 'media-prepare-failed';
  run(process.execPath, ['functions/sync-media-publications.mjs', 'prepare'], {
    ...baseEnv,
    CONFIRM_MEDIA_PUBLICATION: `prepare:${deploymentId}:${projectId}`
  });

  try {
    // Bootstrap puts the static, Firestore-independent site in front first. A
    // partial first deploy can then leave new Hosting with the old backend, but
    // can never strand the legacy Firestore-dependent SPA behind the new
    // deny-by-default rules. Firebase supports Hosting rollback but not Rules
    // rollback, so this order is intentional and regression-tested.
    for (const phase of createFirebaseDeployPhases(bundledBootstrapEnabled)) {
      reportContext.failureCode = phase.failureCode;
      run(firebaseCli.command, [...firebaseCli.argsPrefix,
        'deploy',
        '--only',
        phase.targets,
        '--project',
        projectId
      ], baseEnv);
    }
  } catch (error) {
    try {
      run(process.execPath, ['functions/sync-media-publications.mjs', 'abort'], {
        ...baseEnv,
        CONFIRM_MEDIA_PUBLICATION: `abort:${deploymentId}:release-not-fully-deployed:${projectId}`
      });
    } catch (abortError) {
      console.error('Media deployment state could not be marked aborted:', abortError.message);
    }
    throw error;
  }

  try {
    reportContext.failureCode = 'media-finalize-failed';
    run(process.execPath, ['functions/sync-media-publications.mjs', 'finalize'], {
      ...baseEnv,
      CONFIRM_MEDIA_PUBLICATION: `finalize:${deploymentId}:all-resources-deployed:${projectId}`
    });
  } catch (error) {
    console.error(
      `Hosting is deployed and the union manifest remains safe. Re-run media finalization for ${deploymentId}.`
    );
    throw error;
  }
  deploymentActivated = true;
  try {
    run(process.execPath, ['functions/report-rebuild-result.mjs'], {
      ...baseEnv,
      REBUILD_DEPLOYMENT_RESULT: 'active',
      CONFIRM_REBUILD_RESULT: `report:${contentRevision}:active:${projectId}`
    });
  } catch (error) {
    console.error('The active deployment could not be reflected in rebuild status:', error.message);
  }
  console.log(`Production deployment ${deploymentId} completed and media manifests are exact.`);
};

try {
  await main();
} catch (error) {
  if (reportContext && !deploymentActivated) {
    try {
      run(process.execPath, ['functions/report-rebuild-result.mjs'], {
        ...reportContext.baseEnv,
        REBUILD_DEPLOYMENT_RESULT: 'failed',
        REBUILD_FAILURE_CODE: reportContext.failureCode,
        CONFIRM_REBUILD_RESULT:
          `report:${reportContext.revision}:failed:${reportContext.projectId}`
      });
      try {
        markWorkflowResultReported();
      } catch (markerError) {
        console.error('The workflow result marker could not be written:', markerError.message);
      }
    } catch (reportError) {
      console.error('The deployment failure could not be reflected in rebuild status:', reportError.message);
    }
  }
  console.error('Production deployment failed:', error.message);
  process.exitCode = Number.isInteger(error.exitCode) ? error.exitCode : 1;
} finally {
  try {
    if (bundledBootstrapInstallation) {
      restoreBundledBootstrap(bundledBootstrapInstallation);
      console.log('Restored the pre-deploy generated content snapshot.');
    }
  } catch (cleanupError) {
    console.error('Bundled bootstrap content could not be safely restored:', cleanupError.message);
    process.exitCode = 1;
  }
  try {
    removeGeneratedFunctionsEnvironmentFile(functionsEnvironmentFile ?? { created: false });
  } catch (cleanupError) {
    console.error('Generated Functions environment file could not be removed:', cleanupError.message);
    process.exitCode = 1;
  }
}
