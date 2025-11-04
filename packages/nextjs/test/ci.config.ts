/**
 * CI-specific configuration for tests
 */
export const CI_CONFIG = {
  // Base URL for tests
  baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",

  // Timeout settings for CI
  timeouts: {
    test: 60 * 1000, // 60 seconds per test
    action: 30 * 1000, // 30 seconds per action
    navigation: 30 * 1000, // 30 seconds for navigation
  },

  // Retry settings
  retries: process.env.CI ? 2 : 0,

  // Browser settings
  headless: process.env.CI ? true : false,

  // Video recording
  video: process.env.CI ? "retain-on-failure" : "off",

  // Screenshot settings
  screenshot: "only-on-failure",

  // Trace collection
  trace: "on-first-retry",
} as const;

export const isCI = !!process.env.CI;
