const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "insurance-crm-31ff4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snapshot = await getDocs(collection(db, 'clients'));
  const counts = {};
  snapshot.forEach(doc => {
    const id = doc.data().userId;
    counts[id] = (counts[id] || 0) + 1;
  });
  console.log(counts);
}
check().catch(console.error);
