const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "insurance-crm-31ff4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateClients() {
  const snapshot = await getDocs(collection(db, 'clients'));
  let count = 0;
  for (const docSnapshot of snapshot.docs) {
    await updateDoc(doc(db, 'clients', docSnapshot.id), { status: 'active' });
    count++;
  }
  console.log(`Successfully updated ${count} clients to active status.`);
  process.exit(0);
}

updateClients().catch(console.error);
