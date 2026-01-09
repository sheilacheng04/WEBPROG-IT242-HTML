import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

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
                // Send data to Firebase Firestore
                await addDoc(collection(db, "feedback"), {
                    name: this.form.name,
                    email: this.form.email,
                    message: this.form.message,
                    timestamp: new Date()
                });
                
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
