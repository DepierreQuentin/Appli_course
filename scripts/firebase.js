import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_Q5YjD0ylCRsGTbg0l0LOozRv0axUJns",
  authDomain: "appli-course-86aa1.firebaseapp.com",
  projectId: "appli-course-86aa1",
  storageBucket: "appli-course-86aa1.firebasestorage.app",
  messagingSenderId: "822913515926",
  appId: "1:822913515926:web:5c81cd7be5bc31b0759db7"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
