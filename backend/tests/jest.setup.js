// Runs before any test file is loaded. Ensures tests never silently depend
// on a local .env file existing (which won't be present in CI, since .env
// is correctly gitignored) — the test suite must be fully self-contained.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'ci_test_secret_do_not_use_in_production';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
