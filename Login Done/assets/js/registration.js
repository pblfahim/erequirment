
function togglePassword(fieldId, iconId) {
    const field = document.getElementById(fieldId);
    const icon = document.getElementById(iconId);

    if (field.type === "password") {
        field.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        field.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registrationForm");
    const applicantName = document.getElementById("applicantName");
    const dob = document.getElementById("dob");
    const password = document.getElementById("passwordField");
    const confirmPassword = document.getElementById("confirmPassword");
    const submitBtn = document.getElementById("submitBtn");
    const btnText = document.getElementById("btnText");
    const btnIcon = document.getElementById("btnIcon");
    const statusAlert = document.getElementById("statusAlert");

    // Regular expression matching standard Bangladeshi banking compliance patterns
    function validatePasswordStyle(pass) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/.test(pass);
    }

    function validateNameStyle(name) {
        return /^[a-zA-Z\s\.\-]+$/.test(name.trim()) && name.trim().length >= 3;
    }

    function calculateAge(birthDateString) {
        const birthDate = new Date(birthDateString);
        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function runFieldValidation(field, condition, feedbackElement = null, customMessage = "") {
        if (field.value.trim() === "") {
            field.classList.remove("is-valid", "is-invalid");
            return false;
        }

        if (condition) {
            field.classList.remove("is-invalid");
            field.classList.add("is-valid");
            return true;
        } else {
            field.classList.remove("is-valid");
            field.classList.add("is-invalid");
            if (feedbackElement && customMessage) {
                feedbackElement.textContent = customMessage;
            }
            return false;
        }
    }

    function validateForm() {
        // 1. Name validation
        const isNameValid = runFieldValidation(
            applicantName,
            validateNameStyle(applicantName.value),
            document.getElementById("nameFeedback"),
            "Please enter a valid full name using only English letters, dots, or hyphens (Min 3 characters)."
        );

        // 2. Age / Date of Birth Validation (More than 18 to 65 years parameter updates)
        let isDobValid = false;
        if (dob.value !== "") {
            const dateParts = dob.value.split("-");
            const yearStr = dateParts[0];
            const dobFeedback = document.getElementById("dobFeedback");

            // Hard check ensuring year value string consists strictly of 4 numerical digits
            if (!/^\d{4}$/.test(yearStr)) {
                dob.classList.remove("is-valid");
                dob.classList.add("is-invalid");
                dobFeedback.textContent = "Please enter a valid 4-digit calendar year.";
            } else {
                const age = calculateAge(dob.value);

                // Enforcing strict parameter boundaries (Age must be greater than 18 and up to 65)
                if (age <= 18 || age > 65) {
                    dob.classList.remove("is-valid");
                    dob.classList.add("is-invalid");
                    dobFeedback.textContent = `Age restriction policy error: Your age is ${age}. Candidates must be more than 18 and up to 65 years old.`;
                } else {
                    dob.classList.remove("is-invalid");
                    dob.classList.add("is-valid");
                    isDobValid = true;
                }
            }
        } else {
            dob.classList.remove("is-valid", "is-invalid");
        }

        // 3. Password Complex Metrics Validation
        const isPasswordValid = runFieldValidation(password, validatePasswordStyle(password.value));

        // 4. Confirm Password Match Validation
        let isConfirmMatch = false;
        if (confirmPassword.value !== "") {
            if (password.value === confirmPassword.value) {
                confirmPassword.classList.remove("is-invalid");
                confirmPassword.classList.add("is-valid");
                isConfirmMatch = true;
            } else {
                confirmPassword.classList.remove("is-valid");
                confirmPassword.classList.add("is-invalid");
            }
        } else {
            confirmPassword.classList.remove("is-valid", "is-invalid");
        }

        // Global Button State Assessment
        const formIsValid = isNameValid && isDobValid && isPasswordValid && isConfirmMatch;
        submitBtn.disabled = !formIsValid;

        if (formIsValid) {
            submitBtn.classList.add("active");
        } else {
            submitBtn.classList.remove("active");
        }
    }

    // Dynamic verification listener for raw keyboard values
    dob.addEventListener("input", (e) => {
        if (dob.value !== "") {
            const dateParts = dob.value.split("-");
            // If the user attempts typing more than a 4 digit sequence manually, slice off the remainder
            if (dateParts[0] && dateParts[0].length > 4) {
                dateParts[0] = dateParts[0].substring(0, 4);
                dob.value = dateParts.join("-");
            }
        }
        validateForm();
    });

    // Attaching validation logic to tracking input handlers
    applicantName.addEventListener("input", validateForm);
    dob.addEventListener("change", validateForm);
    password.addEventListener("input", validateForm);
    confirmPassword.addEventListener("input", validateForm);

    // Form Submit Interceptor
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        submitBtn.disabled = true;
        btnText.textContent = "Processing Profile...";
        btnIcon.className = "fa-solid fa-spinner fa-spin ms-1";
        statusAlert.classList.add("d-none");

        setTimeout(() => {
            const trackingYear = new Date().getFullYear();
            const randomizedSerial = Math.floor(100000 + Math.random() * 900000);
            const applicantId = `PBL-${trackingYear}-${randomizedSerial}`;

            statusAlert.className = "alert alert-success animate__animated animate__fadeIn";
            statusAlert.innerHTML = `
                <div class="d-flex">
                    <i class="fa-solid fa-circle-check fs-4 me-2 mt-1"></i>
                    <div>
                        <strong>Account Registration Successful!</strong><br>
                        Your permanent Profile Reference ID is: <strong class="text-decoration-underline">${applicantId}</strong>.<br>
                        <span class="small text-dark mt-1 d-block">Please record this Identification Number carefully. It serves as your primary credential along with your password to log in and track active applications.</span>
                    </div>
                </div>
            `;

            form.reset();

            applicantName.classList.remove("is-valid", "is-invalid");
            dob.classList.remove("is-valid", "is-invalid");
            password.classList.remove("is-valid", "is-invalid");
            confirmPassword.classList.remove("is-valid", "is-invalid");

            btnText.textContent = "Create Account";
            btnIcon.className = "fa-solid fa-arrow-right-long ms-1";

            window.scrollTo({ top: 0, behavior: 'smooth' });

        }, 1800);
    });
});