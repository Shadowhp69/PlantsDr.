/**
 * =============================================================================
 * Sleek Farm Assistant - Login Page JavaScript
 * This script handles the UI logic for the login page, including form
 * submission, basic validation, and theme toggling.
 * =============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------------------
    //  UI Element Selection
    // -------------------------------------------------------------------------
    const body = document.body;
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginMessage = document.getElementById('loginMessage');

    /**
     * =========================================================================
     * Theme Toggling
     * Handles the logic for switching between light and dark modes.
     * =========================================================================
     */
    themeToggleBtn.addEventListener('click', () => {
        // Toggle the 'dark-mode' class on the body
        body.classList.toggle('dark-mode');
        
        // Update the icon based on the current mode
        const isDarkMode = body.classList.contains('dark-mode');
        themeToggleBtn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    /**
     * =========================================================================
     * Login Form Handling
     * Manages form submission, performs basic validation, and displays messages.
     * =========================================================================
     */
    loginForm.addEventListener('submit', (e) => {
        // Prevent the default form submission behavior
        e.preventDefault();

        // Get form input values
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Clear previous messages
        loginMessage.classList.add('hidden');
        loginMessage.innerHTML = '';

        // Simple validation
        if (!email || !password) {
            loginMessage.classList.remove('hidden');
            loginMessage.innerHTML = `<p style="color: red;">Please enter both email and password.</p>`;
            return;
        }

        // --- Placeholder for actual login logic ---
        // In a real application, you would send this data to a server for authentication.
        // For example, using the Firebase Auth library.

        // Simulate a successful login
        loginMessage.classList.remove('hidden');
        loginMessage.innerHTML = `<p style="color: green;">Login successful! Redirecting...</p>`;
        
        // Simulate redirection to the main page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

        // --- Example of a failed login message (for demonstration) ---
        // if (email !== 'test@example.com' || password !== 'password123') {
        //     loginMessage.classList.remove('hidden');
        //     loginMessage.innerHTML = `<p style="color: red;">Invalid email or password. Please try again.</p>`;
        // }
    });
});
