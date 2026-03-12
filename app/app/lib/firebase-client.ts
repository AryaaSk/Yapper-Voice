import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

export function onBalanceChange(callback: (balance: number) => void): () => void {
  const balanceRef = ref(db, "smart_friend/wallet/balance");
  const unsubscribe = onValue(balanceRef, (snapshot) => {
    callback(snapshot.val() ?? 0);
  });
  return unsubscribe;
}
