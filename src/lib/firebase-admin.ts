import * as admin from 'firebase-admin';

// Check if credentials are set. If not, run in mock mode
export const isFirebaseAdminMock =
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY ||
  process.env.FIREBASE_CLIENT_EMAIL.includes('your-firebase');

if (!isFirebaseAdminMock && admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

export const adminAuth = !isFirebaseAdminMock ? admin.auth() : null;

// Helper to verify the secure session cookie
export async function verifyFirebaseSession(sessionCookie: string) {
  if (isFirebaseAdminMock) {
    if (sessionCookie === 'mock-jwt-token' || sessionCookie === 'mock-session-cookie') {
      return { uid: 'mock-owner', email: 'merchant@reviewboost.com' };
    }
    throw new Error('Invalid mock session cookie');
  }

  if (!adminAuth) {
    throw new Error('Firebase Admin SDK not initialized');
  }

  // Verifies the session cookie. Will throw if expired or revoked
  const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  return decodedToken;
}
