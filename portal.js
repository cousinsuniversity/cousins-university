// Replace entire portal.js file with this code

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkPortalAuth()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Load student data
    loadStudentData();
    
    // Initialize navigation
    initializeNavigation();
    
    // Load reports data
    loadReportsData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update system status
    updateSystemStatus();
});

// Enhanced authentication check
function checkPortalAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const sessionData = JSON.parse(localStorage.getItem('studentSession') || '{}');
    
    if (isLoggedIn !== 'true' || !sessionData.id) {
        return false;
    }
    
    // Check session expiration (24 hours)
    if (sessionData.timestamp) {
        const sessionTime = new Date(sessionData.timestamp);
        const now = new Date();
        const hoursDiff = Math.abs(now - sessionTime) / 36e5;
        
        if (hoursDiff > 24) {
            localStorage.clear();
            return false;
        }
    }
    
    return true;
}

// Load and display student data
function loadStudentData() {
    const sessionData = JSON.parse(localStorage.getItem('studentSession') || '{}');
    
    // Update display elements
    const studentNameEl = document.getElementById('studentName');
    const studentIdEl = document.getElementById('studentIdDisplay');
    const profileNameEl = document.getElementById('profileName');
    
    if (studentNameEl) studentNameEl.textContent = sessionData.name || 'Student';
    if (studentIdEl) studentIdEl.textContent = sessionData.id || 'CU000000';
    if (profileNameEl) profileNameEl.textContent = sessionData.name || 'Student';
    
    // Update page title
    document.title = `Cousins University - ${sessionData.name || 'Student Portal'}`;
}

// Initialize navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const currentHash = window.location.hash || '#dashboard';
    
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link.getAttribute('href') === currentHash) {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        }
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            
            // Update active state
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Load section content
            loadSection(target.substring(1));
        });
    });
}

// Load section content
function loadSection(section) {
    console.log(`Loading section: ${section}`);
    
    // Update breadcrumb
    const breadcrumb = document.querySelector('.breadcrumb');
    if (breadcrumb) {
        breadcrumb.innerHTML = `<span>Home</span> / <span>${capitalizeFirst(section)}</span>`;
    }
    
    // Update main title
    const mainTitle = document.querySelector('.content-header h2');
    if (mainTitle) {
        const icons = {
            'dashboard': 'fa-tachometer-alt',
            'courses': 'fa-book-open',
            'grades': 'fa-chart-line',
            'reports': 'fa-file-alt',
            'schedule': 'fa-calendar',
            'financial': 'fa-dollar-sign',
            'library': 'fa-book',
            'settings': 'fa-cog'
        };
        
        const icon = icons[section] || 'fa-tachometer-alt';
        mainTitle.innerHTML = `<i class="fas ${icon}"></i> ${capitalizeFirst(section)}`;
    }
    
    // Load section-specific content
    if (section === 'reports') {
        loadReportsSection();
    }
}

// Load reports data from JSON
async function loadReportsData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        // Process reports data
        if (data.reports && Array.isArray(data.reports)) {
            updateReportsDisplay(data.reports);
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        showSystemMessage('Reports data temporarily unavailable. Please try again later.', 'warning');
    }
}

// Update reports display
function updateReportsDisplay(reports) {
    const reportsList = document.querySelector('.reports-list');
    if (!reportsList) return;
    
    // Clear existing items
    reportsList.innerHTML = '';
    
    // Add report items
    reports.forEach(report => {
        const reportItem = document.createElement('div');
        reportItem.className = 'report-item';
        
        const icon = report.type === 'transcript' ? 'fa-file-pdf' : 
                    report.type === 'grades' ? 'fa-file-excel' : 
                    'fa-file-certificate';
        
        reportItem.innerHTML = `
            <i class="fas ${icon}"></i>
            <div class="report-info">
                <strong>${report.title}</strong>
                <small>Updated: ${formatDate(report.updated)}</small>
            </div>
            <button class="btn-download" data-report-id="${report.id}">
                <i class="fas fa-download"></i>
            </button>
        `;
        
        reportsList.appendChild(reportItem);
    });
    
    // Add download event listeners
    document.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', function() {
            const reportId = this.getAttribute('data-report-id');
            downloadReport(reportId);
        });
    });
}

// Download report function
function downloadReport(reportId) {
    showLoadingMessage(`Preparing report download...`);
    
    // Simulate download process
    setTimeout(() => {
        showSystemMessage('Report downloaded successfully!', 'success');
        
        // In production, this would trigger actual file download
        console.log(`Downloading report: ${reportId}`);
    }, 1500);
}

// Load reports section
function loadReportsSection() {
    const contentArea = document.querySelector('.content-area');
    if (!contentArea) return;
    
    // Create reports section HTML
    const reportsHTML = `
        <div class="reports-section">
            <div class="section-header">
                <h3><i class="fas fa-file-archive"></i> Academic Reports Archive</h3>
                <div class="section-actions">
                    <button class="btn-primary" id="generateReport">
                        <i class="fas fa-plus"></i> Generate New Report
                    </button>
                    <button class="btn-secondary" id="refreshReports">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>
            
            <div class="reports-filter">
                <div class="filter-group">
                    <label for="reportType">Report Type:</label>
                    <select id="reportType">
                        <option value="all">All Reports</option>
                        <option value="transcript">Transcripts</option>
                        <option value="grades">Grade Reports</option>
                        <option value="enrollment">Enrollment Verification</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="reportYear">Academic Year:</label>
                    <select id="reportYear">
                        <option value="all">All Years</option>
                        <option value="2024">2023-2024</option>
                        <option value="2023">2022-2023</option>
                        <option value="2022">2021-2022</option>
                    </select>
                </div>
            </div>
            
            <div class="reports-table-container">
                <table class="reports-table">
                    <thead>
                        <tr>
                            <th>Report Name</th>
                            <th>Type</th>
                            <th>Generated Date</th>
                            <th>Size</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="reportsTableBody">
                        <!-- Reports will be loaded here -->
                    </tbody>
                </table>
            </div>
            
            <div class="reports-stats">
                <div class="stat-card">
                    <i class="fas fa-file-pdf"></i>
                    <div class="stat-info">
                        <span class="stat-value">12</span>
                        <span class="stat-label">Total Reports</span>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-calendar"></i>
                    <div class="stat-info">
                        <span class="stat-value">2024</span>
                        <span class="stat-label">Current Year</span>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-download"></i>
                    <div class="stat-info">
                        <span class="stat-value">24</span>
                        <span class="stat-label">Total Downloads</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Replace dashboard with reports section
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (dashboardGrid) {
        dashboardGrid.style.display = 'none';
    }
    
    const existingReports = document.querySelector('.reports-section');
    if (existingReports) {
        existingReports.remove();
    }
    
    contentArea.insertAdjacentHTML('beforeend', reportsHTML);
    
    // Initialize reports section functionality
    initializeReportsSection();
}

// Initialize reports section
function initializeReportsSection() {
    // Filter functionality
    document.getElementById('reportType').addEventListener('change', filterReports);
    document.getElementById('reportYear').addEventListener('change', filterReports);
    
    // Generate report button
    document.getElementById('generateReport').addEventListener('click', generateNewReport);
    
    // Refresh button
    document.getElementById('refreshReports').addEventListener('click', refreshReports);
    
    // Load reports into table
    loadReportsTable();
}

// Load reports into table
async function loadReportsTable() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        const tableBody = document.getElementById('reportsTableBody');
        if (!tableBody || !data.reports) return;
        
        tableBody.innerHTML = '';
        
        data.reports.forEach(report => {
            const row = document.createElement('tr');
            
            const sizeKB = Math.floor(Math.random() * 500) + 100; // Simulated size
            
            row.innerHTML = `
                <td>
                    <i class="fas ${getReportIcon(report.type)}"></i>
                    <strong>${report.title}</strong>
                </td>
                <td><span class="report-type ${report.type}">${capitalizeFirst(report.type)}</span></td>
                <td>${formatDate(report.updated)}</td>
                <td>${sizeKB} KB</td>
                <td>
                    <button class="btn-icon" title="Download" onclick="downloadReport('${report.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon" title="View" onclick="viewReport('${report.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Print" onclick="printReport('${report.id}')">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading reports table:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Notification bell
    const notificationBell = document.querySelector('.notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', showNotifications);
    }
    
    // Quick action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.querySelector('span').textContent;
            handleQuickAction(action);
        });
    });
    
    // View all reports button
   
