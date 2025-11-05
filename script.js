document.addEventListener('DOMContentLoaded', function() {
    const unregisteredBtn = document.getElementById('unregisteredBtn');
    const registeredBtn = document.getElementById('registeredBtn');
    const unregisteredForm = document.getElementById('unregisteredForm');
    const registeredForm = document.getElementById('registeredForm');
    
    // NHS Number validation for unregistered form
    const nhsInput = document.getElementById('eid'); // Changed from eidInput to nhsInput
    const charCount = document.getElementById('charCount');
    const validationMessage = document.getElementById('validationMessage');
    const patientForm = document.getElementById('patientForm');
    
    // Email and DoB validation for registered form
    const regEmail = document.getElementById('regEmail');
    const dobInput = document.getElementById('dob');
    const emailValidationMessage = document.getElementById('emailValidationMessage');
    const dobValidationMessage = document.getElementById('dobValidationMessage');
    const registeredPatientForm = document.getElementById('registeredPatientForm');
    
    // Switch between forms
    unregisteredBtn.addEventListener('click', function() {
        unregisteredBtn.classList.add('active');
        registeredBtn.classList.remove('active');
        unregisteredForm.classList.add('active');
        registeredForm.classList.remove('active');
    });
    
    registeredBtn.addEventListener('click', function() {
        registeredBtn.classList.add('active');
        unregisteredBtn.classList.remove('active');
        registeredForm.classList.add('active');
        unregisteredForm.classList.remove('active');
    });
    
    // NHS Number validation for unregistered form
    nhsInput.addEventListener('input', function() {
        const value = nhsInput.value;
        const length = value.length;
        
        // Update character count - changed from 32 to 10
        charCount.textContent = `${length}/10`;
        
        // Validate only numbers
        if (value && !/^\d+$/.test(value)) {
            nhsInput.classList.add('invalid');
            charCount.classList.add('invalid');
            validationMessage.textContent = 'Please enter numbers only (0-9)';
            validationMessage.className = 'validation-message invalid';
            return;
        }
        
        // Validate length - changed from 32 to 10
        if (length === 10) {
            nhsInput.classList.remove('invalid');
            nhsInput.classList.add('valid');
            charCount.classList.remove('invalid');
            charCount.classList.add('valid');
            validationMessage.textContent = 'Valid NHS Number format';
            validationMessage.className = 'validation-message valid';
        } else if (length > 0) {
            nhsInput.classList.remove('valid');
            nhsInput.classList.add('invalid');
            charCount.classList.remove('valid');
            charCount.classList.add('invalid');
            validationMessage.textContent = `NHS Number must be exactly 10 digits. Currently: ${length}`;
            validationMessage.className = 'validation-message invalid';
        } else {
            nhsInput.classList.remove('valid', 'invalid');
            charCount.classList.remove('valid', 'invalid');
            validationMessage.textContent = '';
            validationMessage.className = 'validation-message';
        }
    });
    
    // Email validation for registered form
    regEmail.addEventListener('input', function() {
        const value = regEmail.value;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (value && emailPattern.test(value)) {
            regEmail.classList.remove('invalid');
            regEmail.classList.add('valid');
            emailValidationMessage.textContent = 'Valid email format';
            emailValidationMessage.className = 'validation-message valid';
        } else if (value) {
            regEmail.classList.remove('valid');
            regEmail.classList.add('invalid');
            emailValidationMessage.textContent = 'Please enter a valid email address (e.g., name@example.com)';
            emailValidationMessage.className = 'validation-message invalid';
        } else {
            regEmail.classList.remove('valid', 'invalid');
            emailValidationMessage.textContent = '';
            emailValidationMessage.className = 'validation-message';
        }
    });
    
    // Date of Birth validation for registered form
    dobInput.addEventListener('input', function() {
        const value = dobInput.value;
        const dobPattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        
        if (value && dobPattern.test(value)) {
            // Additional validation for actual date
            const parts = value.split('/');
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            
            // Check if date is valid
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
                dobInput.classList.remove('invalid');
                dobInput.classList.add('valid');
                dobValidationMessage.textContent = 'Valid date format';
                dobValidationMessage.className = 'validation-message valid';
            } else {
                dobInput.classList.remove('valid');
                dobInput.classList.add('invalid');
                dobValidationMessage.textContent = 'Please enter a valid date';
                dobValidationMessage.className = 'validation-message invalid';
            }
        } else if (value) {
            dobInput.classList.remove('valid');
            dobInput.classList.add('invalid');
            dobValidationMessage.textContent = 'Please use dd/mm/yyyy format (e.g., 15/05/1990)';
            dobValidationMessage.className = 'validation-message invalid';
        } else {
            dobInput.classList.remove('valid', 'invalid');
            dobValidationMessage.textContent = '';
            dobValidationMessage.className = 'validation-message';
        }
    });
    
    // Unregistered form submission
    patientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nhsValue = nhsInput.value;
        
        // Validate NHS Number - changed from 32 to 10
        if (nhsValue.length !== 10) {
            validationMessage.textContent = 'Error: NHS Number must be exactly 10 digits.';
            validationMessage.className = 'validation-message invalid';
            nhsInput.focus();
            return;
        }
        
        if (!/^\d+$/.test(nhsValue)) {
            validationMessage.textContent = 'Error: NHS Number must contain only numbers (0-9).';
            validationMessage.className = 'validation-message invalid';
            nhsInput.focus();
            return;
        }
        
        // If valid, show success message
        validationMessage.textContent = 'Success! Form submitted with valid NHS Number.';
        validationMessage.className = 'validation-message valid';
        
        // In a real application, you would submit the form here
        console.log('Unregistered patient form submitted with valid NHS Number:', nhsValue);
        
        // Reset form after 2 seconds (optional)
        setTimeout(() => {
            patientForm.reset();
            nhsInput.classList.remove('valid');
            charCount.textContent = '0/10';
            charCount.classList.remove('valid');
            validationMessage.textContent = '';
        }, 2000);
    });
    
    // Registered form submission
    registeredPatientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailValue = regEmail.value;
        const dobValue = dobInput.value;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const dobPattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        
        // Validate email
        if (!emailPattern.test(emailValue)) {
            emailValidationMessage.textContent = 'Error: Please enter a valid email address.';
            emailValidationMessage.className = 'validation-message invalid';
            regEmail.focus();
            return;
        }
        
        // Validate date of birth
        if (!dobPattern.test(dobValue)) {
            dobValidationMessage.textContent = 'Error: Please use dd/mm/yyyy format.';
            dobValidationMessage.className = 'validation-message invalid';
            dobInput.focus();
            return;
        }
        
        // Additional validation for actual date
        const parts = dobValue.split('/');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        const date = new Date(year, month - 1, day);
        if (!(date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day)) {
            dobValidationMessage.textContent = 'Error: Please enter a valid date.';
            dobValidationMessage.className = 'validation-message invalid';
            dobInput.focus();
            return;
        }
        
        // If valid, show success message
        emailValidationMessage.textContent = 'Success! Patient verified.';
        emailValidationMessage.className = 'validation-message valid';
        
        // In a real application, you would submit the form here
        console.log('Registered patient form submitted with:', {
            phone: document.getElementById('regPhone').value,
            email: emailValue,
            dob: dobValue
        });
        
        // Reset form after 2 seconds (optional)
        setTimeout(() => {
            registeredPatientForm.reset();
            regEmail.classList.remove('valid');
            dobInput.classList.remove('valid');
            emailValidationMessage.textContent = '';
            dobValidationMessage.textContent = '';
        }, 2000);
    });
});