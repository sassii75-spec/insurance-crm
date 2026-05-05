const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "insurance-crm-31ff4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snapshot = await getDocs(collection(db, 'users'));
  const users = [];
  snapshot.forEach(doc => {
    users.push({ id: doc.id, name: doc.data().name });
  });
  console.log(users);
}
check().catch(console.error);
