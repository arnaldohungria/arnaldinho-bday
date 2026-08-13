const firebaseConfig = {
  apiKey: "AIzaSyCjDYrMs8P-k1N4G_ohAOrnMBwGSjncRRI",
  authDomain: "arnaldinho-bday.firebaseapp.com",
  projectId: "arnaldinho-bday",
  storageBucket: "arnaldinho-bday.firebasestorage.app",
  messagingSenderId: "653102150689",
  appId: "1:653102150689:web:d38fb949c69d5365239f60"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
