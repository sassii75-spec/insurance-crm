const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "insurance-crm-31ff4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snapshot = await getDocs(collection(db, 'clients'));
  const names = [];
  snapshot.forEach(doc => {
    names.push(doc.data().name);
  });
  console.log(names.join(', '));
}
check().catch(console.error);
