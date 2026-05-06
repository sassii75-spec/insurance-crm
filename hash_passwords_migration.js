const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
const crypto = require('crypto');

const firebaseConfig = {
  projectId: "insurance-crm-31ff4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.webcrypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function migratePasswords() {
  const snapshot = await getDocs(collection(db, 'users'));
  let count = 0;
  for (const docSnapshot of snapshot.docs) {
    const userData = docSnapshot.data();
    // 평문으로 추정되는 비밀번호(64자 미만)만 해싱
    if (userData.password && userData.password.length < 64) {
      const hashedPassword = await hashPassword(userData.password, userData.id);
      await updateDoc(doc(db, 'users', docSnapshot.id), { password: hashedPassword });
      console.log(`Hashed password for user: ${userData.id}`);
      count++;
    }
  }
  console.log(`Successfully migrated ${count} users' passwords.`);
  process.exit(0);
}

migratePasswords().catch(console.error);
