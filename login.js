document.addEventListener('DOMContentLoaded', function () {

    /* References */
    const nhsInput = document.getElementById('nhs');
    const charCount = document.getElementById('nhsCharCount');
    const validationMessage = document.getElementById('validationMessage');
    const patientForm = document.querySelector('form#patientForm');
    const emailInput = document.getElementById('email');
    const dobInput = document.getElementById('dob');
    const dobValidationMessage = document.getElementById('dobValidationMessage');
    const messageBox = document.getElementById('message');
    const emailValidationMessage = document.getElementById('emailValidationMessage');

    /* NHS validation */
    if (nhsInput) {
        nhsInput.addEventListener('input', function () {
            const value = nhsInput.value;
            const length = value.length;
            
            if (charCount) {
                charCount.textContent = `${length}/10`;
            }

            if (value && !/^\d+$/.test(value)) {
                nhsInput.classList.add('invalid');
                if (charCount) charCount.classList.add('invalid');
                if (validationMessage) {
                    validationMessage.textContent = 'Please enter numbers only (0-9)';
                    validationMessage.className = 'validation-message invalid';
                }
                return;
            }

            if (length === 10) {
                nhsInput.classList.remove('invalid');
                nhsInput.classList.add('valid');
                if (charCount) {
                    charCount.classList.remove('invalid');
                    charCount.classList.add('valid');
                }
                if (validationMessage) {
                    validationMessage.textContent = 'Valid NHS Number format';
                    validationMessage.className = 'validation-message valid';
                }
            } else if (length > 0) {
                nhsInput.classList.remove('valid');
                nhsInput.classList.add('invalid');
                if (charCount) {
                    charCount.classList.remove('valid');
                    charCount.classList.add('invalid');
                }
                if (validationMessage) {
                    validationMessage.textContent = `NHS Number must be exactly 10 digits. Currently: ${length}`;
                    validationMessage.className = 'validation-message invalid';
                }
            } else {
                nhsInput.classList.remove('valid', 'invalid');
                if (charCount) charCount.classList.remove('valid', 'invalid');
                if (validationMessage) {
                    validationMessage.textContent = '';
                    validationMessage.className = 'validation-message';
                }
            }
        });
    }

    /* Email validation */
    if (emailInput) {
        emailInput.addEventListener('input', function () {
            const value = emailInput.value;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (value && emailPattern.test(value)) {
                emailInput.classList.remove('invalid');
                emailInput.classList.add('valid');
                if (emailValidationMessage) {
                    emailValidationMessage.textContent = 'Valid email format';
                    emailValidationMessage.className = 'validation-message valid';
                }
            } else if (value) {
                emailInput.classList.remove('valid');
                emailInput.classList.add('invalid');
                if (emailValidationMessage) {
                    emailValidationMessage.textContent = 'Please enter a valid email address (e.g., name@example.com)';
                    emailValidationMessage.className = 'validation-message invalid';
                }
            } else {
                emailInput.classList.remove('valid', 'invalid');
                if (emailValidationMessage) {
                    emailValidationMessage.textContent = '';
                    emailValidationMessage.className = 'validation-message';
                }
            }
        });
    }

    /* DoB validation */
    if (dobInput) {
        dobInput.addEventListener('input', function () {
            const value = dobInput.value;
            if (value) {
                dobInput.classList.remove('invalid');
                dobInput.classList.add('valid');
                if (dobValidationMessage) {
                    dobValidationMessage.textContent = 'Valid date';
                    dobValidationMessage.className = 'validation-message valid';
                }
            } else {
                dobInput.classList.remove('valid', 'invalid');
                if (dobValidationMessage) {
                    dobValidationMessage.textContent = '';
                    dobValidationMessage.className = 'validation-message';
                }
            }
        });
    }

    /* Patient form submission - SINGLE EVENT LISTENER */
    if (patientForm) {
        patientForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Generate and encrypt password
            const randomPassword = generateRandomPassword();
            const encryptedPassword = await encryptPassword(randomPassword);

            // Create new patient object
            const newPatient = {
                nhs: nhsInput.value.trim(),
                title: document.getElementById('title').value.trim(),
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                dob: dobInput.value.trim(),
                gender: document.getElementById('gender').value.trim(),
                address: document.getElementById('address').value.trim(),
                email: emailInput.value.trim(),
                telephone: document.getElementById('telephone').value.trim(),
                doctor: document.getElementById('doctor').value.trim(),
                appointmentDateTime: document.getElementById('appointmentDateTime').value.trim(),
                notes: document.getElementById('notes').value.trim(),
                passwordHash: encryptedPassword
            };

            // Open IndexedDB
            const request = indexedDB.open("patientsDB", 1);
            
            request.onupgradeneeded = function (event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains("patients")) {
                    const patientStore = db.createObjectStore("patients", { keyPath: "nhs" });
                }
            };

            request.onsuccess = function (event) {
                const db = event.target.result;
                const tx = db.transaction("patients", "readwrite");
                const store = tx.objectStore("patients");

                const check = store.get(newPatient.nhs);
                check.onsuccess = function () {
                    if (check.result) {
                        showMessage("Account already exists. Please use the same details to book or update.", "error");
                    } else {
                        const addReq = store.add(newPatient);
                        addReq.onsuccess = function () {
                            showMessage("Registration successful! Appointment booked.", "success");
                            saveAppointment(newPatient);

                            // Show the generated password
                            showPasswordPopup(randomPassword);

                            // Reset form
                            patientForm.reset();
                            const inputs = patientForm.querySelectorAll('input');
                            inputs.forEach(input => input.classList.remove('valid', 'invalid'));
                            if (charCount) charCount.textContent = "0/10";
                            if (validationMessage) validationMessage.textContent = "";
                            if (emailValidationMessage) emailValidationMessage.textContent = "";
                            if (dobValidationMessage) dobValidationMessage.textContent = "";
                        };
                        addReq.onerror = function () {
                            showMessage("Error saving patient record.", "error");
                        };
                    }
                };
            };
        });
    }

    /* Appointments DB setup */
    const appointmentDBRequest = indexedDB.open("appointmentsDB", 1);

    appointmentDBRequest.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("bookappointments")) {
            const appointmentStore = db.createObjectStore("bookappointments", { keyPath: "id", autoIncrement: true });
            appointmentStore.createIndex("nhs", "nhs", { unique: false });
            appointmentStore.createIndex("doctor", "doctor", { unique: false });
            appointmentStore.createIndex("dateTime", "dateTime", { unique: false });
        }
    };

    /* Save appointment function */
    function saveAppointment(patient) {
        const request = indexedDB.open("appointmentsDB", 1);

        request.onsuccess = function (event) {
            const db = event.target.result;
            const tx = db.transaction("bookappointments", "readwrite");
            const store = tx.objectStore("bookappointments");

            const appointmentData = {
                nhs: patient.nhs,
                doctor: patient.doctor,
                dateTime: patient.appointmentDateTime,
                notes: patient.notes,
            };

            const addReq = store.add(appointmentData);
            addReq.onsuccess = function () {
                console.log("Appointment saved successfully");
            };
            addReq.onerror = function (e) {
                console.error("Error adding appointment:", e);
            };
        };
    }

    /* Message display function */
    function showMessage(msg, type) {
        if (!messageBox) return;
        messageBox.textContent = msg;
        messageBox.className = type === "error" ? "msg error" : "msg success";
    }

    /* LOGIN FORM - Separate handler */
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Clear any previous error messages
            if (validationMessage) {
                validationMessage.textContent = "";
                validationMessage.style.color = "";
            }

            const nhs = document.getElementById("nhs").value.trim();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const telephone = document.getElementById("telephone").value.trim();

            console.log("=== LOGIN ATTEMPT ===");
            console.log("Entered NHS:", nhs);
            console.log("Entered Email:", email);
            console.log("Entered Telephone:", telephone);

            // Show loading state
            if (validationMessage) {
                validationMessage.textContent = "Verifying credentials...";
                validationMessage.style.color = "#666";
            }

            try {
                const response = await fetch("https://jsethi-mdx.github.io/cst2572.github.io/patients.json");
                
                if (!response.ok) {
                    throw new Error("Failed to load patient data.");
                }

                const patients = await response.json();
                console.log("Total patients loaded:", patients.length);
                console.log("First patient example:", patients[0]);

                // Check if any record matches NHS, Email, and Telephone
                const match = patients.find(p => {
                    const nhsMatch = p.NHS?.toString() === nhs;
                    const emailMatch = p.Email?.toLowerCase() === email;
                    const telMatch = p.Telephone?.toString() === telephone;
                    
                    if (p.NHS?.toString() === nhs) {
                        console.log("Found matching NHS number!");
                        console.log("Patient NHS:", p.NHS);
                        console.log("Patient Email:", p.Email, "| Match:", emailMatch);
                        console.log("Patient Telephone:", p.Telephone, "| Match:", telMatch);
                    }
                    
                    return nhsMatch && emailMatch && telMatch;
                });

                console.log("Match result:", match ? "FOUND" : "NOT FOUND");

                if (match) {
                    // ✅ valid user — show success and redirect
                    if (validationMessage) {
                        validationMessage.textContent = "Login successful! Redirecting...";
                        validationMessage.style.color = "green";
                    }
                    
                    // Small delay so user sees the success message
                    setTimeout(() => {
                        window.location.href = "portal.html";
                    }, 500);
                } else {
                    // ❌ invalid user — show error
                    if (validationMessage) {
                        validationMessage.textContent = "Invalid credentials. Please check your NHS number, email, and telephone number.";
                        validationMessage.style.color = "red";
                    }
                }

            } catch (error) {
                console.error("Error verifying patient:", error);
                if (validationMessage) {
                    validationMessage.textContent = "Error connecting to server. Please try again later.";
                    validationMessage.style.color = "red";
                }
            }
        });
    }
});

/* Helper functions outside DOMContentLoaded */
function generateRandomPassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

async function encryptPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function showPasswordPopup(password) {
    const popup = document.getElementById('passwordPopup');
    const passwordSpan = document.getElementById('generatedPassword');
    const copyBtn = document.getElementById('copyPasswordBtn');
    const closeBtn = document.getElementById('closePopupBtn');

    if (!popup || !passwordSpan) return;

    passwordSpan.textContent = password;
    popup.style.display = 'flex';

    if (copyBtn) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(password);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy', 1500);
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            popup.style.display = 'none';
        };
    }

    // Close if clicked outside the popup box
    popup.onclick = (e) => {
        if (e.target === popup) popup.style.display = 'none';
    };
}