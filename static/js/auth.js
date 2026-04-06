// static/js/auth.js

// 1. Your Web App's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtEDFl3kw1UEZKapqnQFvybJRzv7R-eAY",
    authDomain: "rag-document-6bce4.firebaseapp.com",
    projectId: "rag-document-6bce4",
    storageBucket: "rag-document-6bce4.firebasestorage.app",
    messagingSenderId: "823859150456",
    appId: "1:823859150456:web:f2b0ebbc60b21130ba778d",
    measurementId: "G-Y8JV09RGRB"
};

// 2. Initialize Firebase (This works because of the 'compat' scripts in your HTML)
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// 3. Google Sign-In Logic
const googleBtn = document.getElementById('google-login');
if (googleBtn) {
    googleBtn.onclick = () => {
        auth.signInWithPopup(provider)
            .then((result) => {
                console.log("Success:", result.user);
                window.location.href = "/dashboard";
            })
            .catch((error) => {
                console.error("Error during login:", error);
                alert("Login failed: " + error.message);
            });
    };
}

// 4. Email/Password Login Logic
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                window.location.href = "/dashboard";
            })
            .catch((err) => {
                alert(err.message);
            });
    };
}

// ... (Your existing Firebase Config and Google Login logic stays the same) ...

// 5. New: Signup Logic
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("User Created:", userCredential.user);
                alert("Account created successfully! Please log in.");
                window.location.href = "/login"; // Redirect back to login
            })
            .catch((err) => {
                console.error("Signup Error:", err.code);
                alert("Registration failed: " + err.message);
            });
    };
}