import { validateProductionEnvironment } from './production-env.mjs';

try {
  validateProductionEnvironment(process.env);
  console.log('Production Firebase web and Functions parameters are complete and internally consistent.');
} catch (error) {
  console.error(`Production environment validation failed: ${error.message}`);
  process.exitCode = 1;
}
