import * as firebaseAdmin from "firebase-admin";

// Initialize Firebase if it hasn't been initialized already
if (!firebaseAdmin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{"type":"service_account","project_id":"your-project-id"}',
    );

    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccount as firebaseAdmin.ServiceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export const storage = firebaseAdmin.storage();
export const bucket = storage.bucket();
