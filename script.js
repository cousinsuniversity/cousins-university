// School Management System - Main JavaScript
class SchoolManagementSystem {
    constructor() {
        this.data = {
            registrations: [],
            students: [],
            testAccounts: [],
            diagnosticResults: [],
            enrollments: [],
            grades: [],
            payments: [],
            requests: []
        };
        
        this.currentUser = null;
        this.autoSaveInterval = null;
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.setupAutoSave();
        this.updateDashboard();
        this.setupNotifications();
        this.checkSystemStatus();
    }

    async loadData() {
        try {
            // Try to load from GitHub or local storage
            const savedData = localStorage.getItem('schoolData');
            if (savedData) {
                this.data = JSON.parse(savedData);
                this.showNotification('Data loaded from local storage', 'success');
            } else {
                // Initialize with default structure
                this.data = {
                    registrations: [],
                    students: [],
                    testAccounts: [],
                    diagnosticResults: [],
                    enrollments: [],
                    grades: [],
                    payments: [],
                    requests: []
                };
                await this.saveData();
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Error loading data. Starting fresh.', 'error');
        }
    }

    async saveData() {
        try {
            // Update last modified timestamp
            this.data.lastModified = new Date().toISOString();
            
            // Save to local storage
            localStorage.setItem('schoolData', JSON.stringify(this.data));
            
            // Generate JSON file for GitHub
            this.generateDataFile();
            
            this.showNotification('Data saved successfully', 'success');
        } catch (error) {
            console.error('Error saving data:', error);
            this.showNotification('Error saving data', 'error');
        }
    }

    generateDataFile() {
        // Generate downloadable JSON file
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Update status
        const statusEl = document.getElementById('storageStatus');
        if (statusEl) {
            statusEl.innerHTML = `<i class="fas fa-database"></i> Last saved: ${new Date().toLocaleTimeString()}`;
        }
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            this.saveData();
        }, 30000);
        
        // Also save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Registration form
        const regForm = document.getElementById('registrationForm');
        if (regForm) {
            regForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registerStudent();
            });
        }

        // Setup other event listeners
        this.setupRegistrationTable();
        this.setupTestAccountsTab();
        this.setupDiagnosticTab();
        this.setupEnrollmentTab();
        this.setupAcademicTab();
        this.setupTreasuryTab();
    }

    switchTab(tabId) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Show active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');

        // Load tab-specific data
        this.loadTabData(tabId);
    }

    loadTabData(tabId) {
        switch(tabId) {
            case 'registration':
                this.loadRegistrationTable();
                break;
            case 'testAccounts':
                this.loadTestAccounts();
                break;
            case 'diagnostic':
                this.loadDiagnosticResults();
                break;
            case 'enrollment':
                this.loadEnrollments();
                break;
            case 'academic':
                this.loadAcademicData();
                break;
            case 'treasury':
                this.loadTreasuryData();
                break;
            case 'reports':
                this.generateReports();
                break;
        }
    }

    // Registration Management
    registerStudent() {
        const name = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const discord = document.getElementById('discord').value.trim();
        const level = document.getElementById('level').value;
        const address = document.getElementById('address').value.trim();
        const contact = document.getElementById('contact').value.trim();

        if (!name || !email || !discord || !level) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }

        // Generate registration ID
        const regId = this.generateRegistrationId();
        const registration = {
            id: regId,
            name,
            email,
            discord,
            level,
            address,
            contact,
            date: new Date().toISOString(),
            status: 'pending',
            feePaid: false,
            diagnosticTaken: false,
            enrolled: false
        };

        this.data.registrations.push(registration);
        this.saveData();
        this.loadRegistrationTable();
        this.updateDashboard();

        // Show success modal
        this.showRegistrationSuccess(registration);

        // Clear form
        this.clearRegistrationForm();
    }

    generateRegistrationId() {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `REG-${year}${month}${day}-${random}`;
    }

    loadRegistrationTable() {
        const tbody = document.getElementById('registrationsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.data.registrations.forEach(reg => {
            const row = document.createElement('tr');
            
            const statusClass = reg.status === 'active' ? 'status-active' : 
                              reg.status === 'pending' ? 'status-pending' : 'status-inactive';
            
            row.innerHTML = `
                <td><strong>${reg.id}</strong></td>
                <td>${reg.name}</td>
                <td>${reg.email}</td>
                <td>${reg.level}</td>
                <td>${new Date(reg.date).toLocaleDateString()}</td>
                <td><span class="status ${statusClass}">${reg.status}</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-primary" onclick="sms.createTestAccount('${reg.id}')">
                            <i class="fas fa-vial"></i> Test Account
                        </button>
                        <button class="btn btn-sm btn-success" onclick="sms.enrollStudent('${reg.id}')">
                            <i class="fas fa-graduation-cap"></i> Enroll
                        </button>
                        <button class="btn btn-sm btn-info" onclick="sms.viewRegistration('${reg.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // Test Accounts Management
    setupTestAccountsTab() {
        const tabContent = document.getElementById('testAccounts');
        tabContent.innerHTML = `
            <div class="card">
                <h2 class="card-title"><i class="fas fa-vial"></i> Test Accounts Management</h2>
                <p>Create and manage diagnostic test accounts for Moodle</p>
                
                <div class="btn-group">
                    <button class="btn btn-primary" onclick="sms.bulkCreateTestAccounts()">
                        <i class="fas fa-plus-circle"></i> Bulk Create Accounts
                    </button>
                    <button class="btn btn-success" onclick="sms.activateTestAccounts()">
                        <i class="fas fa-play-circle"></i> Activate Selected
                    </button>
                    <button class="btn btn-warning" onclick="sms.syncWithMoodle()">
                        <i class="fas fa-sync"></i> Sync with Moodle
                    </button>
                </div>
                
                <div class="table-container" style="margin-top: 20px;">
                    <table id="testAccountsTable">
                        <thead>
                            <tr>
                                <th><input type="checkbox" id="selectAllTests"></th>
                                <th>Test Account</th>
                                <th>Student Name</th>
                                <th>Email</th>
                                <th>Created Date</th>
                                <th>Status</th>
                                <th>Moodle Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="testAccountsTableBody">
                            <!-- Test accounts will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Add event listener for select all checkbox
        setTimeout(() => {
            const selectAll = document.getElementById('selectAllTests');
            if (selectAll) {
                selectAll.addEventListener('change', (e) => {
                    const checkboxes = document.querySelectorAll('#testAccountsTableBody input[type="checkbox"]');
                    checkboxes.forEach(cb => {
                        cb.checked = e.target.checked;
                    });
                });
            }
        }, 100);
    }

    loadTestAccounts() {
        const tbody = document.getElementById('testAccountsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.data.testAccounts.forEach(account => {
            const student = this.data.registrations.find(r => r.id === account.registrationId);
            
            if (!student) return;
            
            const statusClass = account.status === 'active' ? 'status-active' : 
                              account.status === 'pending' ? 'status-pending' : 'status-inactive';
            
            const moodleStatus = account.moodleId ? 
                '<span class="status status-success"><i class="fas fa-check"></i> Synced</span>' :
                '<span class="status status-warning"><i class="fas fa-times"></i> Not Synced</span>';
            
            row.innerHTML = `
                <td><input type="checkbox" value="${account.id}"></td>
                <td><strong>${account.username}</strong></td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${new Date(account.createdDate).toLocaleDateString()}</td>
                <td><span class="status ${statusClass}">${account.status}</span></td>
                <td>${moodleStatus}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-info" onclick="sms.viewTestAccount('${account.id}')">
                            <i class="fas fa-eye"></i> Details
                        </button>
                        <button class="btn btn-sm btn-success" onclick="sms.copyAccountDetails('${account.id}')">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        ${!account.moodleId ? `
                        <button class="btn btn-sm btn-primary" onclick="sms.activateMoodleAccount('${account.id}')">
                            <i class="fas fa-play"></i> Activate
                        </button>
                        ` : ''}
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // Diagnostic Test Management
    setupDiagnosticTab() {
        const tabContent = document.getElementById('diagnostic');
        tabContent.innerHTML = `
            <div class="row">
                <div class="col-6">
                    <div class="card">
                        <h2 class="card-title"><i class="fas fa-stethoscope"></i> Enter Diagnostic Test Scores</h2>
                        <form id="diagnosticForm" class="form">
                            <div class="form-group">
                                <label for="studentSelect">Select Student</label>
                                <select id="studentSelect" class="form-control">
                                    <option value="">Select a student</option>
                                </select>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="logicScore">Logic Score (%)</label>
                                    <input type="number" id="logicScore" min="0" max="100" step="0.1" placeholder="0-100">
                                </div>
                                <div class="form-group">
                                    <label for="mathScore">Math Score (%)</label>
                                    <input type="number" id="mathScore" min="0" max="100" step="0.1" placeholder="0-100">
                                </div>
                                <div class="form-group">
                                    <label for="englishScore">English Score (%)</label>
                                    <input type="number" id="englishScore" min="0" max="100" step="0.1" placeholder="0-100">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="oralExam">Oral Exam Notes</label>
                                <textarea id="oralExam" rows="3" placeholder="Enter oral exam notes and observations"></textarea>
                            </div>
                            
                            <div class="btn-group">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-calculator"></i> Transmute Scores
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="sms.clearDiagnosticForm()">
                                    <i class="fas fa-times"></i> Clear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div class="col-6">
                    <div class="card">
                        <h2 class="card-title"><i class="fas fa-chart-line"></i> Diagnostic Test Results</h2>
                        <div class="table-container">
                            <table id="diagnosticResultsTable">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Logic</th>
                                        <th>Math</th>
                                        <th>English</th>
                                        <th>Average</th>
                                        <th>QPI</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="diagnosticResultsTableBody">
                                    <!-- Results will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Setup form submission
        const form = document.getElementById('diagnosticForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processDiagnosticTest();
            });
        }
        
        // Populate student dropdown
        this.populateStudentDropdown();
    }

    // Enrollment Management
    setupEnrollmentTab() {
        const tabContent = document.getElementById('enrollment');
        tabContent.innerHTML = `
            <div class="card">
                <h2 class="card-title"><i class="fas fa-graduation-cap"></i> Student Enrollment</h2>
                
                <div class="enrollment-steps">
                    <div class="step active">
                        <span class="step-number">1</span>
                        <span class="step-title">Verify Registration</span>
                    </div>
                    <div class="step">
                        <span class="step-number">2</span>
                        <span class="step-title">Select Program</span>
                    </div>
                    <div class="step">
                        <span class="step-number">3</span>
                        <span class="step-title">Payment Setup</span>
                    </div>
                    <div class="step">
                        <span class="step-number">4</span>
                        <span class="step-title">Complete Enrollment</span>
                    </div>
                </div>
                
                <div class="enrollment-form" id="enrollmentFormContainer">
                    <!-- Enrollment form will be loaded here -->
                </div>
            </div>
        `;
        
        this.loadEnrollmentFormStep(1);
    }

    // Academic Management
    setupAcademicTab() {
        const tabContent = document.getElementById('academic');
        tabContent.innerHTML = `
            <div class="row">
                <div class="col-4">
                    <div class="card">
                        <h2 class="card-title"><i class="fas fa-chalkboard-teacher"></i> Academic Actions</h2>
                        <div class="academic-actions">
                            <button class="btn btn-primary btn-block" onclick="sms.promoteStudents()">
                                <i class="fas fa-arrow-up"></i> Promote Students
                            </button>
                            <button class="btn btn-success btn-block" onclick="sms.enrollSubjects()">
                                <i class="fas fa-book"></i> Enroll Subjects
                            </button>
                            <button class="btn btn-warning btn-block" onclick="sms.encodeGrades()">
                                <i class="fas fa-edit"></i> Encode Grades
                            </button>
                            <button class="btn btn-info btn-block" onclick="sms.releaseGrades()">
                                <i class="fas fa-file-export"></i> Release Grades
                            </button>
                            <button class="btn btn-secondary btn-block" onclick="sms.viewGrades()">
                                <i class="fas fa-eye"></i> View Grades
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="col-8">
                    <div class="card">
                        <h2 class="card-title"><i class="fas fa-university"></i> Academic Records</h2>
                        <div class="table-container">
                            <table id="academicRecordsTable">
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Name</th>
                                        <th>Level</th>
                                        <th>Subjects</th>
                                        <th>GPA</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="academicRecordsTableBody">
                                    <!-- Academic records will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Treasury Management
    setupTreasuryTab() {
        const tabContent = document.getElementById('treasury');
        tabContent.innerHTML = `
            <div class="row">
                <div class="col-4">
                    <div class="card">
                        <h2 class="card-title"><i class="fas fa-search-dollar"></i> Search Student</h2>
                        <div class="form-group">
                            <label for="searchStudent">Student ID or Name</label>
                            <div class="input-group">
                                <input type="text" id="searchStudent" class="form-control" placeholder="Enter student ID or name">
                                <button class="btn btn-primary" onclick="sms.searchStudentForPayment()">
                                    <i class="fas fa-search"></i> Search
                                </button>
                            </div>
                        </div>
                        
                        <div id="studentPaymentInfo" style="display: none;">
                            <div class="payment-info">
                                <h4 id="studentName"></h4>
                                <p>ID: <span id="studentId"></span></p>
                                <p>Amount Due: <span id="amountDue" class="text-danger"></span></p>
                                <p>Balance: <span id="studentBalance"></span></p>
                                <p>Payment Plan: <span id="paymentPlan"></span></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h2 class="card-title"><i class="fas fa-money-bill-wave"></i> Process Payment</h2>
                        <form id="paymentForm">
                            <div class="form-group">
                                <label for="paymentAmount">Payment Amount (₱)</label>
                                <input type="number" id="paymentAmount" class="form-control" step="0.01" min="0">
                            </div>
                            <div class="form-group">
                                <label for="paymentMethod">Payment Method</label>
                                <select id="paymentMethod" class="form-control">
                                    <option value="cash">Cash</option>
                                    <option value="gcash">GCash</option>
                                    <option value="paymaya">PayMaya</option>
                                    <option value="bank">Bank Transfer</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="paymentReference">Reference Number</label>
                                <input type="text" id="paymentReference" class="form-control" placeholder="Optional">
                            </div>
                            <div class="btn-group">
                                <button type="submit" class="btn btn-success">
                                    <i class="fas fa-check"></i> Process Payment
                                </button>
                                <button type="button" class="btn btn-primary" onclick="sms.printReceipt()">
                                    <i class="fas fa-print"></i> Print Receipt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div class="col-8">
                    <div class="card">
                        <h2 class="card-title"><i class="fas fa-history"></i> Payment History</h2>
                        <div class="table-container">
                            <table id="paymentHistoryTable">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Student</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Reference</th>
                                        <th>Status</th>
                                        <th>Receipt</th>
                                    </tr>
                                </thead>
                                <tbody id="paymentHistoryTableBody">
                                    <!-- Payment history will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h2 class="card-title"><i class="fas fa-chart-pie"></i> Financial Summary</h2>
                        <div class="financial-summary">
                            <div class="summary-item">
                                <h3 id="totalCollections">₱0.00</h3>
                                <p>Total Collections</p>
                            </div>
                            <div class="summary-item">
                                <h3 id="outstandingBalance">₱0.00</h3>
                                <p>Outstanding Balance</p>
                            </div>
                            <div class="summary-item">
                                <h3 id="todayCollections">₱0.00</h3>
                                <p>Today's Collections</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Setup payment form
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processPayment();
            });
        }
    }

    // Dashboard Updates
    updateDashboard() {
        // Update statistics
        const totalStudents = this.data.students.length;
        const activeRegistrations = this.data.registrations.filter(r => r.status === 'active').length;
        const testAccounts = this.data.testAccounts.length;
        
        // Calculate total revenue
        const totalRevenue = this.data.payments.reduce((sum, payment) => sum + payment.amount, 0);
        
        // Update DOM elements
        const totalStudentsEl = document.getElementById('totalStudents');
        const activeRegistrationsEl = document.getElementById('activeRegistrations');
        const testAccountsEl = document.getElementById('testAccounts');
        const totalRevenueEl = document.getElementById('totalRevenue');
        
        if (totalStudentsEl) totalStudentsEl.textContent = totalStudents;
        if (activeRegistrationsEl) activeRegistrationsEl.textContent = activeRegistrations;
        if (testAccountsEl) testAccountsEl.textContent = testAccounts;
        if (totalRevenueEl) totalRevenueEl.textContent = `₱${totalRevenue.toLocaleString()}`;
        
        // Update recent activity
        this.updateRecentActivity();
    }

    updateRecentActivity() {
        const activityList = document.getElementById('recentActivity');
        if (!activityList) return;
        
        // Combine all activities
        const activities = [];
        
        // Add recent registrations
        this.data.registrations.slice(-5).forEach(reg => {
            activities.push({
                type: 'registration',
                text: `${reg.name} registered`,
                time: new Date(reg.date),
                icon: 'user-plus'
            });
        });
        
        // Add recent payments
        this.data.payments.slice(-5).forEach(payment => {
            const student = this.data.students.find(s => s.id === payment.studentId);
            activities.push({
                type: 'payment',
                text: `Payment: ₱${payment.amount} from ${student ? student.name : 'Unknown'}`,
                time: new Date(payment.date),
                icon: 'money-bill-wave'
            });
        });
        
        // Add recent test results
        this.data.diagnosticResults.slice(-5).forEach(result => {
            const student = this.data.registrations.find(r => r.email === result.email);
            activities.push({
                type: 'diagnostic',
                text: `Diagnostic test: ${student ? student.name : 'Unknown'} - QPI: ${result.qpi}`,
                time: new Date(result.date),
                icon: 'stethoscope'
            });
        });
        
        // Sort by time (newest first)
        activities.sort((a, b) => b.time - a.time);
        
        // Display activities
        activityList.innerHTML = activities.slice(0, 10).map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-text">${activity.text}</p>
                    <p class="activity-time">${this.formatTimeAgo(activity.time)}</p>
                </div>
            </div>
        `).join('');
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Notification System
    setupNotifications() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Show welcome notification
        setTimeout(() => {
            this.showNotification('School Management System loaded successfully!', 'success');
        }, 1000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to container
        const container = document.getElementById('modalContainer') || document.body;
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
        
        // Also show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Cousins University', {
                body: message,
                icon: '/favicon.ico'
            });
        }
    }

    // Modal/Dialog System
    showModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttons.length > 0 ? `
                <div class="modal-footer">
                    ${buttons.map(btn => `
                        <button class="btn btn-${btn.type}" onclick="${btn.onclick}">
                            ${btn.icon ? `<i class="fas fa-${btn.icon}"></i>` : ''}
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
        
        document.getElementById('modalContainer').appendChild(modal);
    }

    // Utility Methods
    clearRegistrationForm() {
        document.getElementById('registrationForm').reset();
    }

    showRegistrationSuccess(registration) {
        const content = `
            <div class="registration-success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Registration Successful!</h3>
                <div class="registration-details">
                    <p><strong>Registration ID:</strong> ${registration.id}</p>
                    <p><strong>Name:</strong> ${registration.name}</p>
                    <p><strong>Email:</strong> ${registration.email}</p>
                    <p><strong>Level:</strong> ${registration.level}</p>
                    <p><strong>Date:</strong> ${new Date(registration.date).toLocaleString()}</p>
                </div>
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    Please proceed to create a test account and pay the ₱50 diagnostic test fee.
                </div>
            </div>
        `;
        
        const buttons = [
            {
                text: 'Create Test Account',
                type: 'primary',
                icon: 'vial',
                onclick: `sms.createTestAccount('${registration.id}')`
            },
            {
                text: 'Close',
                type: 'secondary',
                onclick: 'this.closest(".modal").remove()'
            }
        ];
        
        this.showModal('Registration Complete', content, buttons);
    }

    checkSystemStatus() {
        // Check if data is properly loaded
        if (!this.data.registrations) {
            this.showNotification('System initialized. Ready to accept registrations.', 'info');
        }
        
        // Update status indicators
        const dataStatus = document.getElementById('dataStatus');
        if (dataStatus) {
            const recordCount = Object.values(this.data).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
            dataStatus.innerHTML = `<i class="fas fa-database"></i> Records: ${recordCount}`;
        }
    }

    // These methods would be implemented based on the Java Swing functionality
    createTestAccount(regId) {
        // Implementation for creating test accounts
        this.showNotification('Test account creation feature coming soon', 'info');
    }

    enrollStudent(regId) {
        // Implementation for enrolling students
        this.showNotification('Enrollment feature coming soon', 'info');
    }

    processDiagnosticTest() {
        // Implementation for processing diagnostic tests
        this.showNotification('Diagnostic test processing feature coming soon', 'info');
    }

    processPayment() {
        // Implementation for processing payments
        this.showNotification('Payment processing feature coming soon', 'info');
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sms = new SchoolManagementSystem();
});
