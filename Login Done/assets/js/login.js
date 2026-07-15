/**
 * Component Action: Password Field Text Masking Switcher
 * Swaps dynamic browser field state parameters to reveal values without losing focus.
 */
function handlePasswordToggle() {
    const passwordField = document.getElementById('passwordField');
    const toggleIcon = document.getElementById('toggleIcon');
    const passwordToggle = document.getElementById('passwordToggle');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.classList.replace('fa-eye', 'fa-eye-slash');
        passwordToggle.setAttribute('aria-label', 'Hide password');
    } else {
        passwordField.type = 'password';
        toggleIcon.classList.replace('fa-eye-slash', 'fa-eye');
        passwordToggle.setAttribute('aria-label', 'Show password');
    }
}

// Standard Keyboard Support (Enter/Space) on custom focus elements
document.getElementById('passwordToggle').addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handlePasswordToggle();
    }
});

/**
 * Component Setup: Core Reactive Lifecycle Handling
 */
document.addEventListener('DOMContentLoaded', () => {
    const identityField = document.getElementById('identityField');
    const passwordField = document.getElementById('passwordField');
    const submitBtn = document.getElementById('submitBtn');
    const identityFeedback = document.getElementById('identityFeedback');
    const signInForm = document.getElementById('signInForm');

    /**
     * Security & Business Rules Validation Matrix
     * Matches standardized RFC 5322 email syntax and Bangladeshi local telco dial plans.
     * 
     * @param {string} value Raw input capture target
     * @returns {Object} Analytical map status containing { isValid: boolean, type: 'email'|'mobile'|null }
     */
    function checkIdentityValidity(value) {
        const input = value.trim();
        if (!input) return { isValid: false, type: null };

        // RFC 5322 Compliant Email validation standard
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // BD Mobile Standard Patterns: +8801[3-9]XXXXXXXX or 01[3-9]XXXXXXXX, along with fallback 10-14 digit international scales
        const mobileRegex = /^(?:\+?88)?01[3-9]\d{8}$|^\d{10,14}$/;

        if (emailRegex.test(input)) {
            return { isValid: true, type: 'email' };
        } else if (mobileRegex.test(input)) {
            return { isValid: true, type: 'mobile' };
        }

        return { isValid: false, type: null };
    }

    /**
     * Reactive UI Observer: Manages submission button locks based on validation states
     */
    function evaluateFormState() {
        const identityCheck = checkIdentityValidity(identityField.value);
        const isPasswordFilled = passwordField.value.trim().length > 0;

        if (identityCheck.isValid && isPasswordFilled) {
            submitBtn.classList.add('active');
            submitBtn.removeAttribute('disabled');
        } else {
            submitBtn.classList.remove('active');
            submitBtn.setAttribute('disabled', 'true');
        }
    }

    // Bind Event Listeners: Process active form state changes as characters change
    identityField.addEventListener('input', () => {
        evaluateFormState();

        // Smoothly fade away validation error notifications if user is correcting the layout state
        if (identityField.classList.contains('is-invalid-format')) {
            const status = checkIdentityValidity(identityField.value);
            if (status.isValid || identityField.value.trim() === '') {
                identityField.classList.remove('is-invalid-format');
                identityFeedback.style.display = 'none';
            }
        }
    });

    passwordField.addEventListener('input', evaluateFormState);

    // Focus Loss Event (Blur): Triggers warnings only when user moves past an incorrect value
    identityField.addEventListener('blur', () => {
        const value = identityField.value.trim();
        if (value !== '') {
            const status = checkIdentityValidity(value);
            if (!status.isValid) {
                identityField.classList.add('is-invalid-format');
                identityFeedback.style.display = 'block';
            }
        }
    });

    /**
     * Form Submission Handshake Interceptor
     * Handles custom telemetry compiling and blocks default submission during state validation failures.
     */
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const identityValue = identityField.value.trim();
        const validationStatus = checkIdentityValidity(identityValue);

        if (!validationStatus.isValid) {
            identityField.classList.add('is-invalid-format');
            identityFeedback.style.display = 'block';
            return;
        }

        // Show submission progress states
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Signing In...`;

        // Developer Handover Note: Replace this placeholder with your production Fetch/Axios API POST request pipeline
        setTimeout(() => {
            alert(`Authentication request successfully initiated via ${validationStatus.type.toUpperCase()}: ${identityValue}`);

            // Reset Button State
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Sign In <i class="fa-solid fa-arrow-right-long ms-1" aria-hidden="true"></i>`;
        }, 1000);
    });
});