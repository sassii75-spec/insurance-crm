const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "insurance-crm-31ff4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearClients() {
  const snapshot = await getDocs(collection(db, 'clients'));
  let count = 0;
  for (const docSnapshot of snapshot.docs) {
    await deleteDoc(doc(db, 'clients', docSnapshot.id));
    count++;
  }
  console.log(`Successfully deleted ${count} clients.`);
  process.exit(0);
}

clearClients().catch(console.error);
