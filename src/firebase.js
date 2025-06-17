    // smart-irrigation-frontend/src/firebaseConfig.js
    import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";

    const firebaseConfig = {
      apiKey: "AIzaSyBzIoKuzdSzumEhOLWS3UnwA_4T4MPmMZ0",
      authDomain: "smart-irrgation-dashboard.firebaseapp.com",
      projectId: "smart-irrgation-dashboard",
      storageBucket: "smart-irrgation-dashboard.appspot.com",
      messagingSenderId: "1083833426909",
      appId: "1:1083833426909:web:6acbf578d5121b3720cc34",
      measurementId: "G-ZMDN9LCS14" // This is new, good to include
    };

    const app = initializeApp(firebaseConfig);
    export const auth = getAuth(app);
    