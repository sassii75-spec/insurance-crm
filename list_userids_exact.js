const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "insurance-crm-31ff4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snapshot = await getDocs(collection(db, 'clients'));
  const userIds = new Set();
  snapshot.forEach(doc => {
    userIds.add(doc.data().userId);
  });
  console.log(Array.from(userIds).map(id => `'${id}'`));
}
check().catch(console.error);
