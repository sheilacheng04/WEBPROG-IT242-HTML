// Feedback Circles System with Drag and Physics
// This file works with feedback-form.js which handles Firebase

class FeedbackCircles {
    constructor() {
        this.container = document.querySelector('.feedback-circles-container');
        this.form = document.querySelector('.feedback-form');
        this.feedbackData = [];
        this.circles = [];
        this.draggingCircle = null;
        this.dragOffset = { x: 0, y: 0 };
        this.init();
    }

    init() {
        if (!this.container) return;
        
        // Setup drag functionality
        this.setupDragListeners();
        
        // Start physics simulation
        this.startPhysicsLoop();
        
        // Expose method globally so feedback-form.js can call it
        window.addFeedbackCircle = (feedback) => {
            this.createFeedbackCircle(feedback);
        };
        
        // Expose method to load all circles from Firebase
        window.loadFeedbackCircles = (feedbackArray) => {
            feedbackArray.forEach(feedback => {
                this.createFeedbackCircle(feedback);
            });
        };
    }

    setupDragListeners() {
        // Mouse events
        this.container.addEventListener('mousedown', (e) => this.handleDragStart(e));
        document.addEventListener('mousemove', (e) => this.handleDragMove(e));
        document.addEventListener('mouseup', () => this.handleDragEnd());
        
        // Touch events for mobile
        this.container.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });
        document.addEventListener('touchend', () => this.handleDragEnd());
    }

    handleDragStart(e) {
        const target = e.target.closest('.feedback-circle');
        if (!target) return;
        
        e.preventDefault();
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const rect = target.getBoundingClientRect();
        this.dragOffset = {
            x: clientX - rect.left - rect.width / 2,
            y: clientY - rect.top - rect.height / 2
        };
        
        this.draggingCircle = target;
        target.classList.add('dragging');
        
        // Pause animation while dragging
        target.style.animationPlayState = 'paused';
        
        // Store velocity for physics
        const circleData = this.circles.find(c => c.element === target);
        if (circleData) {
            circleData.lastX = rect.left + rect.width / 2;
            circleData.lastY = rect.top + rect.height / 2;
            circleData.velocityX = 0;
            circleData.velocityY = 0;
        }
    }

    handleDragMove(e) {
        if (!this.draggingCircle) return;
        
        e.preventDefault();
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const containerRect = this.container.getBoundingClientRect();
        const circleRect = this.draggingCircle.getBoundingClientRect();
        
        // Calculate new position relative to container
        let newX = clientX - containerRect.left - this.dragOffset.x;
        let newY = clientY - containerRect.top - this.dragOffset.y;
        
        // Keep within bounds
        const radius = circleRect.width / 2;
        newX = Math.max(radius, Math.min(containerRect.width - radius, newX));
        newY = Math.max(radius, Math.min(containerRect.height - radius, newY));
        
        // Update position
        this.draggingCircle.style.left = newX + 'px';
        this.draggingCircle.style.top = newY + 'px';
        this.draggingCircle.style.transform = 'none';
        
        // Calculate velocity for physics
        const circleData = this.circles.find(c => c.element === this.draggingCircle);
        if (circleData && circleData.lastX !== undefined) {
            circleData.velocityX = newX - circleData.lastX;
            circleData.velocityY = newY - circleData.lastY;
            circleData.lastX = newX;
            circleData.lastY = newY;
        }
        
        // Check for collisions with other circles
        this.checkCollisions(this.draggingCircle, newX, newY);
    }

    handleDragEnd() {
        if (!this.draggingCircle) return;
        
        this.draggingCircle.classList.remove('dragging');
        
        // Resume animation after a delay
        setTimeout(() => {
            if (this.draggingCircle) {
                this.draggingCircle.style.animationPlayState = 'running';
            }
        }, 1000);
        
        this.draggingCircle = null;
    }

    checkCollisions(draggedCircle, dragX, dragY) {
        const circles = Array.from(this.container.querySelectorAll('.feedback-circle'));
        const radius = 40; // Half of circle width (80px / 2)
        const influenceRadius = 150; // Water displacement effect radius
        
        circles.forEach(otherCircle => {
            if (otherCircle === draggedCircle) return;
            
            const rect = otherCircle.getBoundingClientRect();
            const containerRect = this.container.getBoundingClientRect();
            
            // Get current position
            const otherX = rect.left + rect.width / 2 - containerRect.left;
            const otherY = rect.top + rect.height / 2 - containerRect.top;
            
            // Calculate distance
            const dx = dragX - otherX;
            const dy = dragY - otherY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Water-like displacement effect - circles move away as dragged circle approaches
            if (distance < influenceRadius && distance > 0) {
                const angle = Math.atan2(-dy, -dx); // Direction to move away
                
                // Calculate push force based on distance (closer = stronger push)
                // Use inverse square for more realistic water displacement
                const distanceRatio = 1 - (distance / influenceRadius);
                const pushForce = distanceRatio * distanceRatio * 8; // Quadratic falloff
                
                // Calculate push direction
                const pushX = Math.cos(angle) * pushForce;
                const pushY = Math.sin(angle) * pushForce;
                
                // Store velocity for this circle
                const circleData = this.circles.find(c => c.element === otherCircle);
                if (circleData) {
                    circleData.velocityX = (circleData.velocityX || 0) + pushX;
                    circleData.velocityY = (circleData.velocityY || 0) + pushY;
                }
                
                // Apply immediate push with smooth transition
                const currentTransform = otherCircle.style.transform || 'translate(0, 0)';
                const translateMatch = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                let currentX = 0, currentY = 0;
                
                if (translateMatch) {
                    currentX = parseFloat(translateMatch[1]) || 0;
                    currentY = parseFloat(translateMatch[2]) || 0;
                }
                
                const newX = currentX + pushX;
                const newY = currentY + pushY;
                
                // Get container bounds
                const maxX = containerRect.width - radius * 2;
                const maxY = containerRect.height - radius * 2;
                
                // Keep within bounds
                const boundedX = Math.max(-otherX + radius, Math.min(maxX - otherX + radius, newX));
                const boundedY = Math.max(-otherY + radius, Math.min(maxY - otherY + radius, newY));
                
                otherCircle.style.transition = 'transform 0.15s ease-out';
                otherCircle.style.transform = `translate(${boundedX}px, ${boundedY}px)`;
                
                // Visual feedback based on proximity (closer = more intense)
                const intensity = distanceRatio * 0.8;
                otherCircle.style.borderColor = `rgba(100, 180, 255, ${0.4 + intensity * 0.4})`;
                otherCircle.style.background = `rgba(100, 180, 255, ${0.15 + intensity * 0.15})`;
                
                // Reset visual feedback when out of range
                if (distance > influenceRadius * 0.9) {
                    setTimeout(() => {
                        otherCircle.style.borderColor = '';
                        otherCircle.style.background = '';
                    }, 200);
                }
            } else {
                // Reset visual feedback when too far
                otherCircle.style.borderColor = '';
                otherCircle.style.background = '';
            }
        });
    }

    startPhysicsLoop() {
        setInterval(() => {
            this.circles.forEach(circleData => {
                if (circleData.element === this.draggingCircle) return;
                if (!circleData.velocityX && !circleData.velocityY) return;
                
                // Apply water-like friction (slower deceleration for fluid feel)
                circleData.velocityX *= 0.92;
                circleData.velocityY *= 0.92;
                
                // Stop if velocity is very small
                if (Math.abs(circleData.velocityX) < 0.05) circleData.velocityX = 0;
                if (Math.abs(circleData.velocityY) < 0.05) circleData.velocityY = 0;
            });
        }, 30);
    }

    addFeedback() {
        const name = this.form.querySelector('input[type="text"]').value;
        const email = this.form.querySelector('input[type="email"]').value;
        const message = this.form.querySelector('textarea').value;

        if (!name || !email || !message) return;

        const feedback = { name, email, message };
        this.feedbackData.push(feedback);
        
        this.createFeedbackCircle(feedback);
        
        // Reset form
        this.form.reset();
        
        // Show success message
        this.showSuccessMessage();
    }

    createFeedbackCircle(feedback) {
        const circle = document.createElement('div');
        circle.className = 'feedback-circle';
        
        const nameEl = document.createElement('div');
        nameEl.className = 'feedback-circle-name';
        nameEl.textContent = feedback.name;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'feedback-circle-message';
        messageEl.textContent = feedback.message;
        
        circle.appendChild(nameEl);
        circle.appendChild(messageEl);
        
        // Store circle data for physics
        const circleData = {
            element: circle,
            feedback: feedback,
            velocityX: 0,
            velocityY: 0
        };
        this.circles.push(circleData);
        
        // Add click event to show full message
        circle.addEventListener('click', (e) => {
            // Only show modal if not dragging
            if (!circle.classList.contains('dragging')) {
                this.showFullFeedback(feedback);
            }
        });
        
        this.container.appendChild(circle);
        
        // Add entrance animation
        circle.style.opacity = '0';
        circle.style.transform = 'scale(0)';
        
        setTimeout(() => {
            circle.style.transition = 'all 0.5s ease';
            circle.style.opacity = '1';
            circle.style.transform = 'scale(1)';
        }, 100);
    }

    showFullFeedback(feedback) {
        // Create modal with bigger overlay
        const modal = document.createElement('div');
        modal.className = 'feedback-modal';
        modal.innerHTML = `
            <div class="feedback-modal-content">
                <button class="feedback-modal-close">&times;</button>
                <h3>${feedback.name}</h3>
                <p class="feedback-modal-email">${feedback.email}</p>
                <p class="feedback-modal-message">${feedback.message}</p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal on click
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('feedback-modal-close')) {
                modal.remove();
            }
        });
    }

    showSuccessMessage() {
        const successMsg = document.createElement('div');
        successMsg.className = 'feedback-success';
        successMsg.textContent = 'Your feedback has been added to the aquarium!';
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(100, 180, 255, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.style.opacity = '0';
            successMsg.style.transform = 'translateX(400px)';
            successMsg.style.transition = 'all 0.3s ease';
            setTimeout(() => successMsg.remove(), 300);
        }, 3000);
    }

    addDemoFeedback() {
        // Demo feedback removed - now loading from Firebase
        // Circles are loaded via window.loadFeedbackCircles() from feedback-form.js
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FeedbackCircles();
});
