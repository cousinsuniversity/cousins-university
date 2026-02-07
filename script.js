// Replace entire script.js file with this code

document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const studentId = document.getElementById('studentId').value.trim();
            const password = document.getElementById('password').value;
            
            // Enhanced validation
            if (!validateStudentId(studentId)) {
                showError('Please enter a valid Student ID (Format: CU followed by 7 digits)');
                return;
            }
            
            if (password.length < 6) {
                showError('Password must be at least 6 characters long');
                return;
            }
            
            // Authenticate with enhanced security
            authenticateStudent(studentId, password);
        });
    }
    
    // Forgot password link
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            showPasswordRecovery();
        });
    }
});

// Validate student ID format (CU followed by 7 digits)
function validateStudentId(studentId) {
    const idPattern = /^CU\d{7}$/;
    return idPattern.test(studentId);
}

// Enhanced authentication function (removed test accounts)
function authenticateStudent(studentId, password) {
    showLoading(true);
    
    // Simulate API call to backend authentication
    setTimeout(() => {
        // In production, this would be a real API call
        // For now, simulate successful login for valid credentials
        
        if (studentId && password.length >= 6) {
            // Store session data
            const studentData = {
                id: studentId,
                name: getStudentNameFromId(studentId),
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('studentSession', JSON.stringify(studentData));
            localStorage.setItem('isLoggedIn', 'true');
            
            // Redirect to portal
            showSuccess('Login successful! Redirecting to portal...');
            setTimeout(() => {
                window.location.href = 'portal.html';
            }, 1500);
        } else {
            showError('Invalid credentials. Please check your Student ID and password.');
        }
        
        showLoading(false);
    }, 1000);
}

// Generate student name from ID (demo function)
function getStudentNameFromId(studentId) {
    // In production, this would come from the database
    const names = ['Alex Johnson', 'Maria Garcia', 'David Chen', 'Sarah Williams'];
    const index = parseInt(studentId.substring(2, 5)) % names.length;
    return names[index] || 'Student';
}

// Show loading state
function showLoading(show) {
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        if (show) {
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            loginBtn.disabled = true;
        } else {
            loginBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Login to Portal';
            loginBtn.disabled = false;
        }
    }
}

// Show error message
function showError(message) {
    // Remove existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.insertBefore(errorDiv, loginForm.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        loginCard.insertBefore(successDiv, loginCard.firstChild);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }
}

// Password recovery function
function showPasswordRecovery() {
    const recoveryHTML = `
        <div class="modal-overlay" id="recoveryModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-key"></i> Password Recovery</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Enter your Student ID and registered email to reset your password.</p>
                    <div class="form-group">
                        <label for="recoveryId">Student ID</label>
                        <input type="text" id="recoveryId" placeholder="CU2024001">
                    </div>
                    <div class="form-group">
                        <label for="recoveryEmail">Registered Email</label>
                        <input type="email" id="recoveryEmail" placeholder="student@cousins.edu">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="cancelRecovery">Cancel</button>
                    <button class="btn-primary" id="submitRecovery">Reset Password</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', recoveryHTML);
    
    // Add event listeners
    const modal = document.getElementById('recoveryModal');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('#cancelRecovery');
    
    closeBtn.addEventListener('click', () => modal.remove());
    cancelBtn.addEventListener('click', () => modal.remove());
    
    // Handle recovery submission
    document.getElementById('submitRecovery').addEventListener('click', function() {
        const recoveryId = document.getElementById('recoveryId').value;
        const recoveryEmail = document.getElementById('recoveryEmail').value;
        
        if (validateStudentId(recoveryId) && recoveryEmail.includes('@')) {
            showSuccess('Password reset instructions have been sent to your email.');
            modal.remove();
        } else {
            showError('Please provide valid Student ID and email address.');
        }
    });
}

// Session management
function checkSession() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        const sessionData = JSON.parse(localStorage.getItem('studentSession') || '{}');
        if (sessionData.timestamp) {
            const sessionTime = new Date(sessionData.timestamp);
            const now = new Date();
            const hoursDiff = Math.abs(now - sessionTime) / 36e5;
            
            // Auto-logout after 24 hours
            if (hoursDiff > 24) {
                localStorage.removeItem('studentSession');
                localStorage.removeItem('isLoggedIn');
                return false;
            }
        }
        return true;
    }
    return false;
}

// Auto-redirect if already logged in
if (window.location.pathname.includes('index.html') && checkSession()) {
    window.location.href = 'portal.html';
}
