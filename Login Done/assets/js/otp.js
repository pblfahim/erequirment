document.addEventListener("DOMContentLoaded", () => {
    /** 
     * ==========================================
     * DOM COMPONENT HOOK TARGETS & REGEX MANIFESTS
     * ==========================================
     */
    const form = document.getElementById("authFlowForm");
    const phoneField = document.getElementById("phoneNumberField");
    const otpWrapper = document.getElementById("otpWrapper");
    const otpField = document.getElementById("otpField");
    const submitBtn = document.getElementById("submitBtn");
    const changeNumBtn = document.getElementById("changeNumBtn");
    const resendBtn = document.getElementById("resendBtn");
    const countdownEl = document.getElementById("countdown");
    const timerContainer = document.getElementById("timerContainer");
    const formTitle = document.getElementById("formTitle");
    const formSubtitle = document.getElementById("formSubtitle");

    /**
     * Regex: Bangladesh Mobile Operator Validation Pattern
     * Format: 1[3-9]XXXXXXXX -> Matches 1 followed by 3-9, followed by 8 arbitrary digits
     * Evaluates inputs excluding standard leading '0' as prefixed by standard HTML markup +880.
     */
    const bdRegex = /^1[3-9]\d{8}$/;

    /**
     * Finite State Machine Machine Tracker
     * Flow Paths: 'PHONE' (Default Entry Level) -> 'OTP' (Awaiting Authentication Validation)
     */
    let currentStep = "PHONE";
    let timerInterval = null;

    /**
     * UI State Engine Wrapper: Standardized Button Transitions
     * Avoids DOM inconsistencies by managing button validation classes and spinner attributes globally.
     */
    function updateButtonState(isEnabled, text, showIcon = true) {
        submitBtn.disabled = !isEnabled;
        submitBtn.classList.toggle("active", isEnabled);
        submitBtn.innerHTML = `${text} ${showIcon ? '<i class="fa-solid fa-arrow-right-long ms-1" aria-hidden="true"></i>' : ''}`;
    }

    /**
     * Input Sanitization Pipeline: Standardizes keyboard interaction inputs to digits only
     * Runs dynamically on "input" triggers to maintain visual state matches immediately.
     */
    function handlePhoneInput() {
        // Strip all alpha-character spaces instantly on input runtime
        phoneField.value = phoneField.value.replace(/\D/g, "").substring(0, 10);
        const isValid = bdRegex.test(phoneField.value);

        phoneField.classList.toggle("is-valid", isValid);
        phoneField.classList.toggle("is-invalid", !isValid && phoneField.value.length === 10);

        if (currentStep === "PHONE") {
            updateButtonState(isValid, "Send OTP");
        }
    }

    function handleOtpInput() {
        otpField.value = otpField.value.replace(/\D/g, "").substring(0, 6);
        const isValid = otpField.value.length === 6;

        otpField.classList.toggle("is-valid", isValid);

        // Keep input field looking neutral while user actively keys in verification codes
        if (otpField.value.length > 0 && !isValid) {
            otpField.classList.remove("is-invalid");
        }

        if (currentStep === "OTP") {
            updateButtonState(isValid, "Verify & Proceed", false);
        }
    }

    /**
     * Countdown Timer Loop Engine
     * Emits a standard 60-second window to prevent API endpoint abuse and throttle requests.
     */
    function startTimer() {
        clearInterval(timerInterval); // Safe guard: clear existing runloops to prevent overlapping intervals
        let duration = 60;
        countdownEl.textContent = duration;
        timerContainer.classList.remove("d-none");
        resendBtn.classList.add("d-none");

        timerInterval = setInterval(() => {
            duration--;
            countdownEl.textContent = duration;
            if (duration <= 0) {
                clearInterval(timerInterval);
                timerContainer.classList.add("d-none");
                resendBtn.classList.remove("d-none");
            }
        }, 1000);
    }

    /**
     * UI State Transition: Switch Form view structure to OTP verification mode
     */
    function changeStepToOtp() {
        currentStep = "OTP";
        phoneField.disabled = true; // Protect pre-validated source during active OTP process
        formTitle.textContent = "Verify Mobile.";
        formSubtitle.innerHTML = `Enter the verification code sent to <strong>+880 ${phoneField.value}</strong>`;

        // Add Bootstrap show class to execute localized CSS layout transformations smoothly
        otpWrapper.classList.add("show");
        otpField.required = true;
        otpField.focus();

        updateButtonState(false, "Verify & Proceed", false);
        startTimer();
    }

    /**
     * UI State Transition: Fallback reset flow sequence back to phone configuration entry
     */
    function resetToPhoneStep() {
        currentStep = "PHONE";
        clearInterval(timerInterval);

        phoneField.disabled = false;
        phoneField.focus();
        formTitle.textContent = "Create account.";
        formSubtitle.innerHTML = 'Have an account? <a href="index.html">Log in</a>';

        otpWrapper.classList.remove("show");
        otpField.required = false;
        otpField.value = "";
        otpField.classList.remove("is-valid", "is-invalid");

        handlePhoneInput();
    }

    /**
     * Central Interceptor Pipeline: Manages submit actions, loading animations, and simulated API workflows
     */
    function processFormSubmission(e) {
        e.preventDefault();

        if (currentStep === "PHONE") {
            if (!bdRegex.test(phoneField.value)) {
                phoneField.classList.add("is-invalid");
                return;
            }

            // Display processing indicator during initial mock network handshake
            updateButtonState(false, '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...', false);
            setTimeout(changeStepToOtp, 1200);

        } else if (currentStep === "OTP") {
            if (otpField.value.length !== 6) {
                otpField.classList.add("is-invalid");
                return;
            }

            // Display processing indicator during target verification payload verification
            updateButtonState(false, '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verifying...', false);

            setTimeout(() => {
                alert("🎉 Account Registration Successful!");
                form.reset();
                phoneField.classList.remove("is-valid");
                resetToPhoneStep();
            }, 1500);
        }
    }

    // Input element tracking listeners
    phoneField.addEventListener("input", handlePhoneInput);
    otpField.addEventListener("input", handleOtpInput);
    changeNumBtn.addEventListener("click", resetToPhoneStep);
    form.addEventListener("submit", processFormSubmission);

    // Resend action handler
    resendBtn.addEventListener("click", () => {
        resendBtn.classList.add("d-none");
        startTimer();
        // Developer Diagnostic log: Track transaction sequences in staging console environments
        console.log(`OTP Transaction Log: Resending sequence triggered successfully to destination target +880${phoneField.value}`);
    });
});