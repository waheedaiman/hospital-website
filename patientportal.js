// patient-portal.js
document.addEventListener('DOMContentLoaded', function() {
    // Check if patient is logged in
    const loggedInPatient = sessionStorage.getItem('loggedInPatient');
    if (!loggedInPatient) {
        window.location.href = 'patient-login.html';
        return;
    }
    
    const patient = JSON.parse(loggedInPatient);
    let patientDetails = null;
    let prescriptionRequests = JSON.parse(localStorage.getItem('prescriptionRequests') || '[]');
    let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    // Initialize the portal
    initPortal();
    
    function initPortal() {
        // Load patient details
        loadPatientDetails();
        
        // Set up navigation
        setupNavigation();
        
        // Set current date
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Set up form handlers
        document.getElementById('prescriptionRequestForm').addEventListener('submit', handlePrescriptionRequest);
        document.getElementById('appointmentForm').addEventListener('submit', handleAppointmentBooking);
        
        // Load initial data
        loadDashboardData();
        
        // Set up logout
        document.getElementById('logoutBtn').addEventListener('click', function() {
            sessionStorage.removeItem('loggedInPatient');
            window.location.href = 'patient-login.html';
        });
    }
    
function loadPatientDetails() {
    fetch('Patientdetails.json')
        .then(response => response.json())
        .then(data => {
            console.log('Patient data from login:', patient); // Debug log
            console.log('Available NHS numbers in Patientdetails:', data.map(p => p.NHS_Number)); // Debug log
            
            // Find patient by NHS number - make sure this matches your login data
            patientDetails = data.find(p => p.NHS_Number === patient.NHS);
            
            console.log('Found patient details:', patientDetails); // Debug log
            
            if (patientDetails) {
                // Update patient info in sidebar - make sure these field names match Patientdetails.json
                document.getElementById('patientName').textContent = patientDetails.Patient_Name;
                document.getElementById('patientNHS').textContent = `NHS: ${patientDetails.NHS_Number}`;
                document.getElementById('patientDOB').textContent = `DOB: ${patientDetails.Date_of_Birth}`;
                
                // Load medical history and prescriptions
                loadMedicalHistory();
                loadPrescriptions();
            } else {
                console.error('Patient not found. Looking for NHS:', patient.NHS);
                showNotification('Patient details not found', 'error');
            }
        })
        .catch(error => {
            console.error('Error loading patient details:', error);
            showNotification('Error loading patient information', 'error');
        });
}    
    function setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                if (this.id === 'logoutBtn') return;
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding tab
                const tabId = this.getAttribute('data-tab');
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.style.display = 'none';
                });
                document.getElementById(tabId).style.display = 'block';
                
                // Load data for the tab if needed
                if (tabId === 'medical-history') {
                    loadMedicalHistory();
                } else if (tabId === 'prescriptions') {
                    loadPrescriptions();
                } else if (tabId === 'request-prescription') {
                    loadPrescriptionRequests();
                } else if (tabId === 'appointments') {
                    loadAppointments();
                }
            });
        });
    }
    
    function loadDashboardData() {
        // Load recent prescriptions
        if (patientDetails && patientDetails.Prescription) {
            const prescription = patientDetails.Prescription;
            const html = `
                <div class="info-card">
                    <h3>${prescription.Medicine_Name}</h3>
                    <p><strong>Dosage:</strong> ${prescription.Dosage}</p>
                    <p><strong>Duration:</strong> ${prescription.Duration}</p>
                    <p><strong>Instructions:</strong> ${prescription.Instructions}</p>
                    <p><strong>Prescribed By:</strong> ${prescription.Prescribed_By}</p>
                    <p><strong>Date Issued:</strong> ${prescription.Date_Issued}</p>
                </div>
            `;
            document.getElementById('recentPrescriptions').innerHTML = html;
        }
        
        // Load upcoming appointments
        const patientAppointments = appointments.filter(apt => 
            apt.patientNHS === patient.NHS && 
            new Date(apt.dateTime) > new Date()
        ).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
        
        if (patientAppointments.length > 0) {
            let html = '';
            patientAppointments.slice(0, 3).forEach(apt => {
                html += `
                    <div class="info-card">
                        <h3>Appointment with ${apt.doctor}</h3>
                        <p><strong>Date:</strong> ${new Date(apt.dateTime).toLocaleString()}</p>
                        <p><strong>Reason:</strong> ${apt.reason}</p>
                        <p><strong>Status:</strong> ${apt.status || 'Scheduled'}</p>
                    </div>
                `;
            });
            document.getElementById('upcomingAppointments').innerHTML = html;
        } else {
            document.getElementById('upcomingAppointments').innerHTML = '<p>No upcoming appointments</p>';
        }
        
        // Load prescription request status
        const patientRequests = prescriptionRequests.filter(req => 
            req.patientNHS === patient.NHS
        ).sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (patientRequests.length > 0) {
            const pendingCount = patientRequests.filter(req => req.status === 'pending').length;
            const approvedCount = patientRequests.filter(req => req.status === 'approved').length;
            const rejectedCount = patientRequests.filter(req => req.status === 'rejected').length;
            
            const html = `
                <div class="info-card">
                    <h3>Prescription Request Status</h3>
                    <p><strong>Pending:</strong> ${pendingCount}</p>
                    <p><strong>Approved:</strong> ${approvedCount}</p>
                    <p><strong>Rejected:</strong> ${rejectedCount}</p>
                </div>
            `;
            document.getElementById('prescriptionRequestsStatus').innerHTML = html;
        } else {
            document.getElementById('prescriptionRequestsStatus').innerHTML = '<p>No prescription requests</p>';
        }
    }
    
    function loadMedicalHistory() {
        if (patientDetails && patientDetails.Patient_Note) {
            const note = patientDetails.Patient_Note;
            const html = `
                <div class="info-card">
                    <h3>Visit on ${note.Visit_Date}</h3>
                    <p><strong>Reason for Visit:</strong> ${note.Reason_for_Visit}</p>
                    <p><strong>Diagnosis:</strong> ${note.Diagnosis}</p>
                    <p><strong>Recommendations:</strong> ${note.Recommendations}</p>
                    <p><strong>Follow Up:</strong> ${note.Follow_Up}</p>
                </div>
            `;
            document.getElementById('medicalNotes').innerHTML = html;
        }
    }
    
    function loadPrescriptions() {
        if (patientDetails && patientDetails.Prescription) {
            const prescription = patientDetails.Prescription;
            
            // Current prescriptions
            const currentHtml = `
                <div class="info-card">
                    <h3>${prescription.Medicine_Name}</h3>
                    <p><strong>Dosage:</strong> ${prescription.Dosage}</p>
                    <p><strong>Duration:</strong> ${prescription.Duration}</p>
                    <p><strong>Instructions:</strong> ${prescription.Instructions}</p>
                    <p><strong>Prescribed By:</strong> ${prescription.Prescribed_By}</p>
                    <p><strong>Date Issued:</strong> ${prescription.Date_Issued}</p>
                </div>
            `;
            document.getElementById('currentPrescriptions').innerHTML = currentHtml;
            
            // Prescription history table
            const historyHtml = `
                <tr>
                    <td>${prescription.Medicine_Name}</td>
                    <td>${prescription.Date_Issued}</td>
                    <td>${prescription.Dosage}</td>
                    <td>${prescription.Duration}</td>
                    <td>${prescription.Prescribed_By}</td>
                </tr>
            `;
            document.querySelector('#prescriptionHistory tbody').innerHTML = historyHtml;
        }
    }
    
    function loadPrescriptionRequests() {
        const patientRequests = prescriptionRequests.filter(req => 
            req.patientNHS === patient.NHS
        ).sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let html = '';
        patientRequests.forEach(req => {
            let statusClass = '';
            if (req.status === 'approved') statusClass = 'status-approved';
            else if (req.status === 'rejected') statusClass = 'status-rejected';
            else statusClass = 'status-pending';
            
            html += `
                <tr>
                    <td>${new Date(req.date).toLocaleDateString()}</td>
                    <td>${req.medicineName}</td>
                    <td>${req.reason}</td>
                    <td><span class="${statusClass}">${req.status}</span></td>
                    <td>${req.doctorResponse || 'No response yet'}</td>
                </tr>
            `;
        });
        
        document.querySelector('#previousRequests tbody').innerHTML = html || 
            '<tr><td colspan="5" style="text-align: center;">No previous requests</td></tr>';
    }
    
    function loadAppointments() {
        const patientAppointments = appointments.filter(apt => 
            apt.patientNHS === patient.NHS
        ).sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
        
        let html = '';
        patientAppointments.forEach(apt => {
            let statusClass = '';
            if (apt.status === 'confirmed') statusClass = 'status-approved';
            else if (apt.status === 'cancelled') statusClass = 'status-rejected';
            else statusClass = 'status-pending';
            
            html += `
                <tr>
                    <td>${new Date(apt.dateTime).toLocaleString()}</td>
                    <td>${apt.doctor}</td>
                    <td>${apt.reason}</td>
                    <td><span class="${statusClass}">${apt.status || 'pending'}</span></td>
                    <td>
                        <button class="cancel-appointment" data-id="${apt.id}">Cancel</button>
                    </td>
                </tr>
            `;
        });
        
        document.querySelector('#appointmentsList tbody').innerHTML = html || 
            '<tr><td colspan="5" style="text-align: center;">No appointments scheduled</td></tr>';
            
        // Add event listeners to cancel buttons
        document.querySelectorAll('.cancel-appointment').forEach(button => {
            button.addEventListener('click', function() {
                const appointmentId = this.getAttribute('data-id');
                cancelAppointment(appointmentId);
            });
        });
    }
    
    function handlePrescriptionRequest(e) {
        e.preventDefault();
        
        const medicineName = document.getElementById('medicineName').value;
        const reason = document.getElementById('reason').value;
        const urgency = document.getElementById('urgency').value;
        
        const request = {
            id: Date.now().toString(),
            patientNHS: patient.NHS,
            patientName: patientDetails ? patientDetails.Patient_Name : 'Unknown',
            medicineName,
            reason,
            urgency,
            status: 'pending',
            date: new Date().toISOString(),
            doctorResponse: null
        };
        
        prescriptionRequests.push(request);
        localStorage.setItem('prescriptionRequests', JSON.stringify(prescriptionRequests));
        
        showNotification('Prescription request submitted successfully', 'success');
        document.getElementById('prescriptionRequestForm').reset();
        
        // Reload the requests table
        loadPrescriptionRequests();
    }
    
    function handleAppointmentBooking(e) {
        e.preventDefault();
        
        const doctor = document.getElementById('appointmentDoctor').value;
        const dateTime = document.getElementById('appointmentDate').value;
        const reason = document.getElementById('appointmentReason').value;
        
        const appointment = {
            id: Date.now().toString(),
            patientNHS: patient.NHS,
            patientName: patientDetails ? patientDetails.Patient_Name : 'Unknown',
            doctor,
            dateTime,
            reason,
            status: 'pending'
        };
        
        appointments.push(appointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        showNotification('Appointment request submitted successfully', 'success');
        document.getElementById('appointmentForm').reset();
        
        // Reload the appointments table
        loadAppointments();
    }
    
    function cancelAppointment(appointmentId) {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            appointments = appointments.filter(apt => apt.id !== appointmentId);
            localStorage.setItem('appointments', JSON.stringify(appointments));
            showNotification('Appointment cancelled', 'success');
            loadAppointments();
        }
    }
    
    function showNotification(message, type) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }
    
    // Check for new prescription request responses
    function checkForUpdates() {
        const patientRequests = prescriptionRequests.filter(req => 
            req.patientNHS === patient.NHS && 
            req.status !== 'pending' && 
            (!req.notified || req.notified === false)
        );
        
        patientRequests.forEach(req => {
            showNotification(`Your prescription request for ${req.medicineName} has been ${req.status}`, 'info');
            req.notified = true;
        });
        
        if (patientRequests.length > 0) {
            localStorage.setItem('prescriptionRequests', JSON.stringify(prescriptionRequests));
        }
    }
    
    // Check for updates every 30 seconds
    setInterval(checkForUpdates, 30000);
});