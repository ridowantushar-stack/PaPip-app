import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

const STORAGE_KEY = 'papip_firebase_config';

export function getSavedFirebaseConfig(): FirebaseCustomConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse saved Firebase config', e);
  }
  return null;
}

export function saveFirebaseConfig(config: FirebaseCustomConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  // Reset instances so next access reinitializes
  appInstance = null;
  authInstance = null;
  firestoreInstance = null;
}

export function clearFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
  appInstance = null;
  authInstance = null;
  firestoreInstance = null;
}

export function initFirebase(): { app: FirebaseApp | null; auth: Auth | null; db: Firestore | null } {
  if (appInstance && authInstance && firestoreInstance) {
    return { app: appInstance, auth: authInstance, db: firestoreInstance };
  }

  const customConfig = getSavedFirebaseConfig();
  if (customConfig && customConfig.apiKey && customConfig.projectId) {
    try {
      if (!getApps().length) {
        appInstance = initializeApp(customConfig);
      } else {
        appInstance = getApps()[0];
      }
      authInstance = getAuth(appInstance);
      firestoreInstance = customConfig.firestoreDatabaseId
        ? getFirestore(appInstance, customConfig.firestoreDatabaseId)
        : getFirestore(appInstance);

      // Validate connection to Firestore as requested by guidelines
      testConnection(firestoreInstance);

      return { app: appInstance, auth: authInstance, db: firestoreInstance };
    } catch (err) {
      console.warn('Could not initialize Firebase with custom config:', err);
    }
  }

  return { app: null, auth: null, db: null };
}

async function testConnection(db: Firestore) {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or configuration requires validation.');
    }
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = authInstance;
  const user = currentAuth?.currentUser;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.uid,
      email: user?.email,
      emailVerified: user?.emailVerified,
      isAnonymous: user?.isAnonymous,
      tenantId: user?.tenantId,
      providerInfo: user?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
