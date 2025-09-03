import * as firebaseAdmin from "firebase-admin";

// Check if we're in a CI environment or missing required env vars
const isCI = process.env.CI === "true" || process.env.NODE_ENV === "test";
const hasRequiredEnvVars = process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_STORAGE_BUCKET;

// Initialize Firebase if it hasn't been initialized already and we have the required env vars
if (!firebaseAdmin.apps.length && hasRequiredEnvVars) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccount as firebaseAdmin.ServiceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    if (!isCI) {
      throw error; // Only throw in non-CI environments
    }
  }
}

// Wrap exports in try-catch to handle potential initialization failures
let storage: firebaseAdmin.storage.Storage | null = null;
let bucket: ReturnType<firebaseAdmin.storage.Storage["bucket"]> | null = null;

if (hasRequiredEnvVars) {
  try {
    storage = firebaseAdmin.storage();
    bucket = storage.bucket();
  } catch (error) {
    console.error("Firebase storage initialization error:", error);
    if (!isCI) {
      console.warn("Firebase storage not available - some features may not work");
    }
  }
} else if (!isCI) {
  console.warn("Firebase environment variables not configured - Firebase features will be disabled");
}

export { storage, bucket };
