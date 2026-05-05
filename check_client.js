const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "insurance-crm-31ff4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snapshot = await getDocs(collection(db, 'clients'));
  snapshot.forEach(doc => {
    if (doc.data().name === '최윤석') {
      console.log(doc.data());
    }
  });
}
check().catch(console.error);
