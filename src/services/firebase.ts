import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc, Timestamp, getDocs, writeBatch } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJNLN6gpQiPEoBuQIkF09DZqsVExOMLxE",
  authDomain: "meu-caixa-7b093.firebaseapp.com",
  projectId: "meu-caixa-7b093",
  storageBucket: "meu-caixa-7b093.firebasestorage.app",
  messagingSenderId: "505462172462",
  appId: "1:505462172462:web:f4a4dc3fb61b3a4f7468bf",
  measurementId: "G-N9QBCHQPT1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth functions
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Firestore collections
const TRANSACTIONS_COLLECTION = 'transactions';
const CATEGORIES_COLLECTION = 'categories';

// Transaction functions
export interface FirestoreTransaction {
  userId: string; // Used in queries and object spreads (TS6133 false positive)
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Category functions
export interface FirestoreCategory {
  userId: string;
  id: string;
  label: string;
  icon: string;
  type: 'income' | 'expense';
  color: string;
  isCustom: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CategoryData {
  id: string;
  label: string;
  icon: string;
  type: 'income' | 'expense';
  color: string;
  isCustom: boolean;
}

export async function addCategory(
  userId: string,
  data: Omit<FirestoreCategory, 'userId' | 'createdAt' | 'updatedAt' | 'id'>
): Promise<string> {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
}

export async function updateCategory(
  _userId: string,
  categoryId: string,
  data: Partial<Omit<FirestoreCategory, 'userId' | 'createdAt' | 'id'>>
): Promise<void> {
  await updateDoc(doc(db, CATEGORIES_COLLECTION, categoryId), {
    ...data,
    updatedAt: Timestamp.now()
  });
}

export async function deleteCategory(_userId: string, categoryId: string): Promise<void> {
  await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
}

export function subscribeToUserCategories(
  userId: string,
  callback: (categories: CategoryData[]) => void
) {
  const q = query(
    collection(db, CATEGORIES_COLLECTION),
    where('userId', '==', userId),
    orderBy('type'),
    orderBy('label')
  );
  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map(doc => {
      const data = doc.data() as FirestoreCategory;
      return {
        id: doc.id,
        label: data.label,
        icon: data.icon,
        type: data.type,
        color: data.color,
        isCustom: data.isCustom
      };
    });
    callback(categories);
  });
}

export async function getUserCategories(userId: string): Promise<CategoryData[]> {
  const q = query(
    collection(db, CATEGORIES_COLLECTION),
    where('userId', '==', userId),
    orderBy('type'),
    orderBy('label')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data() as FirestoreCategory;
    return {
      id: doc.id,
      label: data.label,
      icon: data.icon,
      type: data.type,
      color: data.color,
      isCustom: data.isCustom
    };
  });
}

export async function addTransaction(
  userId: string,
  data: Omit<FirestoreTransaction, 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<FirestoreTransaction, 'userId' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, TRANSACTIONS_COLLECTION, id), {
    ...data,
    updatedAt: Timestamp.now()
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, id));
}

export function subscribeToUserTransactions(
  userId: string,
  callback: (transactions: Array<FirestoreTransaction & { id: string }>) => void
) {
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirestoreTransaction & { id: string }));
    callback(transactions);
  });
}

export async function getUserTransactions(userId: string): Promise<(FirestoreTransaction & { id: string })[]> {
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FirestoreTransaction & { id: string }));
}

// Batch operations for offline sync
export async function batchWriteTransactions(
  userId: string,
  transactions: Omit<FirestoreTransaction, 'userId' | 'createdAt' | 'updatedAt'>[]
): Promise<void> {
  const batch = writeBatch(db);
  const now = Timestamp.now();

  transactions.forEach(t => {
    const ref = doc(collection(db, TRANSACTIONS_COLLECTION));
    batch.set(ref, { ...t, userId, createdAt: now, updatedAt: now });
  });

  await batch.commit();
}