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
                // Simulate form submission (replace with actual backend call)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Here you would typically send the data to a backend
                // Example:
                // const response = await fetch('/api/feedback', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(this.form)
                // });
                
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
