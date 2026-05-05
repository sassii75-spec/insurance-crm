const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "insurance-crm-31ff4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snapshot = await getDocs(collection(db, 'clients'));
  let count = 0;
  snapshot.forEach(doc => {
    if (count < 5) {
      console.log(`Name: ${doc.data().name}, userId: ${doc.data().userId}`);
      count++;
    }
  });
}
check().catch(console.error);
