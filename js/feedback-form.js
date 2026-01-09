import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyASjoUiz0P0ihvWV9U19RhxKzRQY9b6jkU",
  authDomain: "feedback-form-9a587.firebaseapp.com",
  projectId: "feedback-form-9a587",
  storageBucket: "feedback-form-9a587.firebasestorage.app",
  messagingSenderId: "1074450828044",
  appId: "1:1074450828044:web:92850ebef10e6ca1acd729"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load existing feedback from Firebase on page load
async function loadExistingFeedback() {
    try {
        const feedbackQuery = query(collection(db, "feedback"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(feedbackQuery);
        
        const feedbackArray = [];
        querySnapshot.forEach((doc) => {
            feedbackArray.push(doc.data());
        });
        
        // Wait for feedback-circles.js to be ready, then load circles
        const checkAndLoad = () => {
            if (typeof window.loadFeedbackCircles === 'function') {
                window.loadFeedbackCircles(feedbackArray);
            } else {
                setTimeout(checkAndLoad, 100);
            }
        };
        checkAndLoad();
        
    } catch (error) {
        console.error('Error loading feedback:', error);
    }
}

// Load feedback when DOM is ready
document.addEventListener('DOMContentLoaded', loadExistingFeedback);

const { createApp } = Vue;

createApp({
    data() {
        return {
            form: {
                name: '',
                email: '',
                message: ''
            },
            isSubmitting: false,
            successMessage: '',
            errorMessage: ''
        };
    },
    methods: {
        async submitForm() {
            this.isSubmitting = true;
            this.successMessage = '';
            this.errorMessage = '';

            try {
                const feedbackData = {
                    name: this.form.name,
                    email: this.form.email,
                    message: this.form.message,
                    timestamp: new Date()
                };
                
                // Send data to Firebase Firestore
                await addDoc(collection(db, "feedback"), feedbackData);
                
                // Add the feedback circle immediately
                if (typeof window.addFeedbackCircle === 'function') {
                    window.addFeedbackCircle(feedbackData);
                }
                
                this.successMessage = 'Your message has been sent! Thanks for reaching out.';
                this.form = { name: '', email: '', message: '' };
                
                // Clear success message after 4 seconds
                setTimeout(() => {
                    this.successMessage = '';
                }, 4000);
            } catch (error) {
                this.errorMessage = 'Failed to send message. Please try again.';
                console.error('Form submission error:', error);
            } finally {
                this.isSubmitting = false;
            }
        }
    }
}).mount('#app-feedback-form');
