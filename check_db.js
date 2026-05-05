const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "insurance-crm-31ff4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snapshot = await getDocs(collection(db, 'clients'));
  console.log(`Found ${snapshot.size} clients.`);
  if (snapshot.size > 0) {
    console.log(snapshot.docs[0].data());
  }
}
check().catch(console.error);
