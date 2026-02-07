// School Portal - Student Access System
class SchoolPortal {
    constructor() {
        this.currentStudent = null;
        this.studentData = {};
        this.init();
    }

    init() {
        this.loadStudentData();
        this.setupEventListeners();
        this.checkForNotifications();
    }

    loadStudentData() {
        // Load student data from localStorage or session
        const studentSession = sessionStorage.getItem('studentSession');
        if (studentSession) {
            this.currentStudent = JSON.parse(studentSession);
            this.showDashboard();
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.loginStudent();
            });
        }

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });
    }

    loginStudent() {
        const studentId = document.getElementById('studentId').value;
        const password = document.getElementById('password').value;

        // For demo purposes - in production, this would validate against stored data
        if (studentId && password) {
            // Simulate API call
            this.authenticateStudent(studentId, password);
        } else {
            this.showAlert('Please enter your Student ID and password', 'error');
        }
    }

    authenticateStudent(studentId, password) {
        // In a real system, this would be an API call
        // For now, simulate with localStorage data
        const schoolData = JSON.parse(localStorage.getItem('schoolData') || '{}');
        const student = schoolData.students?.find(s => s.id === studentId);
        
        if (student) {
            // Store session
            this.currentStudent = student;
            sessionStorage.setItem('studentSession', JSON.stringify(student));
            this.showDashboard();
            this.showAlert('Login successful!', 'success');
        } else {
            this.showAlert('Invalid Student ID or password', 'error');
        }
    }

    showDashboard() {
        // Hide login section
        document.getElementById('loginSection').style.display = 'none';
        
        // Show dashboard
        const dashboard = document.getElementById('dashboardSection');
        dashboard.style.display = 'block';
        
        // Update student info
        document.getElementById('studentNameDisplay').textContent = this.currentStudent.name;
        document.getElementById('studentIdDisplay').textContent = this.currentStudent.id;
        document.getElementById('gradeLevelDisplay').textContent = this.currentStudent.gradeLevel || 'Not assigned';
        
        // Load dashboard data
        this.loadDashboardData();
    }

    loadDashboardData() {
        // Load academic data
        this.loadAcademicSummary();
        this.loadTodaySchedule();
        this.loadNotifications();
        this.loadGradesPreview();
        this.loadUpcomingAssignments();
    }

    loadAcademicSummary() {
        // Load GPA and other academic stats
        // This would come from the data store
        document.getElementById('currentGPA').textContent = '3.75';
        document.getElementById('totalSubjects').textContent = '8';
        document.getElementById('attendanceRate').textContent = '95%';
    }

    loadTodaySchedule() {
        const scheduleContainer = document.getElementById('todaysSchedule');
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        
        const schedule = [
            { time: '8:00 AM', subject: 'Mathematics', room: 'Room 101' },
            { time: '9:30 AM', subject: 'English', room: 'Room 102' },
            { time: '11:00 AM', subject: 'Science', room: 'Lab 201' },
            { time: '1:00 PM', subject: 'History', room: 'Room 103' },
            { time: '2:30 PM', subject: 'Physical Education', room: 'Gym' }
        ];
        
        scheduleContainer.innerHTML = schedule.map(item => `
            <div class="schedule-item">
                <div class="schedule-time">${item.time}</div>
                <div class="schedule-details">
                    <strong>${item.subject}</strong>
                    <div class="schedule-room">${item.room}</div>
                </div>
            </div>
        `).join('');
    }

    loadNotifications() {
        const notificationsContainer = document.getElementById('studentNotifications');
        
        const notifications = [
            { type: 'info', message: 'Midterm exams start next week', date: 'Today' },
            { type: 'warning', message: 'Assignment due tomorrow: Math Problem Set', date: 'Today' },
            { type: 'success', message: 'Payment received for Semester 2', date: '2 days ago' },
            { type: 'info', message: 'New grades posted for English', date: '3 days ago' }
        ];
        
        notificationsContainer.innerHTML = notifications.map(notif => `
            <div class="notification-item notification-${notif.type}">
                <div class="notification-content">
                    <p>${notif.message}</p>
                    <small>${notif.date}</small>
                </div>
            </div>
        `).join('');
    }

    loadGradesPreview() {
        const gradesContainer = document.getElementById('gradesPreview');
        
        const grades = [
            { subject: 'Mathematics', grade: 'A', percentage: '95%' },
            { subject: 'English', grade: 'B+', percentage: '88%' },
            { subject: 'Science', grade: 'A-', percentage: '92%' },
            { subject: 'History', grade: 'B', percentage: '85%' }
        ];
        
        gradesContainer.innerHTML = `
            <table class="grades-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Grade</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${grades.map(grade => `
                        <tr>
                            <td>${grade.subject}</td>
                            <td><span class="grade-badge grade-${grade.grade.charAt(0)}">${grade.grade}</span></td>
                            <td>${grade.percentage}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    loadUpcomingAssignments() {
        const assignmentsContainer = document.getElementById('upcomingAssignments');
        
        const assignments = [
            { subject: 'Mathematics', assignment: 'Chapter 5 Problem Set', due: 'Tomorrow' },
            { subject: 'English', assignment: 'Essay: Modern Literature', due: 'In 3 days' },
            { subject: 'Science', assignment: 'Lab Report: Chemistry', due: 'Next Week' }
        ];
        
        assignmentsContainer.innerHTML = assignments.map(assignment => `
            <div class="assignment-item">
                <div class="assignment-subject">${assignment.subject}</div>
                <div class="assignment-title">${assignment.assignment}</div>
                <div class="assignment-due">Due: ${assignment.due}</div>
            </div>
        `).join('');
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('main > section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show selected section
        document.getElementById(sectionId + 'Section').style.display = 'block';
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
        
        // Load section data
        this.loadSectionData(sectionId);
    }

    loadSectionData(sectionId) {
        switch(sectionId) {
            case 'grades':
                this.loadFullGrades();
                break;
            case 'subjects':
                this.loadSubjects();
                break;
            case 'payments':
                this.loadPayments();
                break;
            case 'documents':
                this.loadDocuments();
                break;
        }
    }

    loadFullGrades() {
        // Implementation for loading full grade history
    }

    loadSubjects() {
        // Implementation for loading enrolled subjects
    }

    startEnrollment() {
        // Show enrollment modal
        document.getElementById('enrollmentModal').classList.add('active');
    }

    closeEnrollmentModal() {
        document.getElementById('enrollmentModal').classList.remove('active');
    }

    nextEnrollmentStep(step) {
        // Hide all steps
        document.querySelectorAll('.process-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show selected step
        document.getElementById('step' + step).classList.add('active');
    }

    completeEnrollment() {
        // Collect enrollment data
        const enrollmentData = {
            name: document.getElementById('enrollName').value,
            email: document.getElementById('enrollEmail').value,
            contact: document.getElementById('enrollContact').value,
            birthDate: document.getElementById('enrollBirthDate').value
        };
        
        // Save enrollment
        this.saveEnrollment(enrollmentData);
        this.closeEnrollmentModal();
        this.showAlert('Enrollment submitted successfully!', 'success');
    }

    saveEnrollment(data) {
        // Save to localStorage
        const enrollments = JSON.parse(localStorage.getItem('pendingEnrollments') || '[]');
        enrollments.push({
            ...data,
            id: 'PEND-' + Date.now(),
            date: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem('pendingEnrollments', JSON.stringify(enrollments));
    }

    accessDiagnosticTest() {
        window.open('https://cousinsuniversityadmissions.moodiy.com', '_blank');
    }

    requestTestAccount() {
        this.showAlert('Test account request feature coming soon', 'info');
    }

    checkForNotifications() {
        // Check for system notifications
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            this.requestNotificationPermission();
        }
    }

    requestNotificationPermission() {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.subscribeToNotifications();
                }
            });
        }
    }

    subscribeToNotifications() {
        // Subscribe to push notifications
        // Implementation would depend on your notification service
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="alert-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }
}

// Initialize portal
document.addEventListener('DOMContentLoaded', () => {
    window.portal = new SchoolPortal();
});

// Global functions for HTML onclick handlers
function startEnrollment() {
    window.portal?.startEnrollment();
}

function closeEnrollmentModal() {
    window.portal?.closeEnrollmentModal();
}

function nextEnrollmentStep(step) {
    window.portal?.nextEnrollmentStep(step);
}

function completeEnrollment() {
    window.portal?.completeEnrollment();
}

function accessDiagnosticTest() {
    window.portal?.accessDiagnosticTest();
}

function requestTestAccount() {
    window.portal?.requestTestAccount();
}
