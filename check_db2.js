const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "insurance-crm-31ff4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snapshot = await getDocs(collection(db, 'clients'));
  console.log(`Found ${snapshot.size} clients in total.`);
  
  let found = 0;
  snapshot.forEach(doc => {
    if (doc.data().name.includes('심지연')) {
      console.log('Found 심지연:', doc.data());
      found++;
    }
  });
  console.log(`Found ${found} matches for 심지연`);
}
check().catch(console.error);
