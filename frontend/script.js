// Global variables
let students = [];
const API_BASE_URL = 'http://localhost:8080/api';

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');
const addStudentForm = document.getElementById('add-student-form');
const searchBtn = document.getElementById('search-btn');
const searchRollInput = document.getElementById('search-roll');
const refreshBtn = document.getElementById('refresh-btn');
const gradeFilter = document.getElementById('grade-filter');
const loadingOverlay = document.getElementById('loading-overlay');
const messageContainer = document.getElementById('message-container');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadDashboard();
});

// Initialize application
function initializeApp() {
    // Load students from localStorage if backend is not available
    const savedStudents = localStorage.getItem('srms-students');
    if (savedStudents) {
        students = JSON.parse(savedStudents);
    }
    
    // Show dashboard by default
    showSection('dashboard');
    updateDashboard();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            showSection(section);
            setActiveNav(this);
        });
    });

    // Add student form
    addStudentForm.addEventListener('submit', handleAddStudent);

    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    searchRollInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Refresh button
    refreshBtn.addEventListener('click', loadAllStudents);

    // Grade filter
    gradeFilter.addEventListener('change', filterStudentsByGrade);

    // Form validation
    setupFormValidation();
}

// Show specific section
function showSection(sectionId) {
    // Hide all sections
    contentSections.forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section-specific data
        switch(sectionId) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'all-students':
                loadAllStudents();
                break;
            case 'analytics':
                loadAnalytics();
                break;
        }
    }
}

// Set active navigation button
function setActiveNav(activeBtn) {
    navButtons.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// Handle add student form submission
async function handleAddStudent(e) {
    e.preventDefault();
    
    const formData = new FormData(addStudentForm);
    const studentData = {
        rollNo: parseInt(formData.get('rollNo')),
        name: formData.get('studentName'),
        subject1: parseInt(formData.get('subject1')),
        subject2: parseInt(formData.get('subject2')),
        subject3: parseInt(formData.get('subject3'))
    };

    // Validate student data
    if (!validateStudentData(studentData)) {
        return;
    }

    // Check if roll number already exists
    if (students.find(s => s.rollNo === studentData.rollNo)) {
        showMessage('error', 'Roll number already exists!');
        return;
    }

    showLoading(true);

    try {
        // Calculate results
        const student = calculateStudentResult(studentData);
        
        // Try to send to backend
        const success = await addStudentToBackend(student);
        
        if (success) {
            students.push(student);
            saveStudentsToLocalStorage();
            showMessage('success', 'Student added successfully!');
            addStudentForm.reset();
            updateDashboard();
        } else {
            // Fallback to local storage
            students.push(student);
            saveStudentsToLocalStorage();
            showMessage('warning', 'Student added to local storage (Backend not available)');
            addStudentForm.reset();
            updateDashboard();
        }
    } catch (error) {
        console.error('Error adding student:', error);
        showMessage('error', 'Failed to add student. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Validate student data
function validateStudentData(data) {
    if (data.rollNo <= 0) {
        showMessage('error', 'Please enter a valid roll number');
        return false;
    }
    
    if (!data.name || data.name.trim().length < 2) {
        showMessage('error', 'Please enter a valid name (at least 2 characters)');
        return false;
    }
    
    if (data.subject1 < 0 || data.subject1 > 100 ||
        data.subject2 < 0 || data.subject2 > 100 ||
        data.subject3 < 0 || data.subject3 > 100) {
        showMessage('error', 'Marks should be between 0 and 100');
        return false;
    }
    
    return true;
}

// Calculate student result
function calculateStudentResult(studentData) {
    const total = studentData.subject1 + studentData.subject2 + studentData.subject3;
    const percentage = parseFloat((total / 3).toFixed(2));
    
    let grade;
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 75) grade = 'A';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 40) grade = 'C';
    else grade = 'F';
    
    return {
        ...studentData,
        total: total,
        percentage: percentage,
        grade: grade,
        dateAdded: new Date().toLocaleDateString()
    };
}

// Add student to backend
async function addStudentToBackend(student) {
    try {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(student)
        });
        
        return response.ok;
    } catch (error) {
        console.error('Backend not available:', error);
        return false;
    }
}

// Handle search functionality
async function handleSearch() {
    const rollNo = parseInt(searchRollInput.value);
    
    if (!rollNo || rollNo <= 0) {
        showMessage('error', 'Please enter a valid roll number');
        return;
    }
    
    showLoading(true);
    
    try {
        // Try backend first
        let student = await searchStudentInBackend(rollNo);
        
        // Fallback to local storage
        if (!student) {
            student = students.find(s => s.rollNo === rollNo);
        }
        
        if (student) {
            displaySearchResult(student);
        } else {
            displaySearchResult(null);
            showMessage('warning', 'Student not found');
        }
    } catch (error) {
        console.error('Search error:', error);
        showMessage('error', 'Search failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Search student in backend
async function searchStudentInBackend(rollNo) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${rollNo}`);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Backend search failed:', error);
        return null;
    }
}

// Display search result
function displaySearchResult(student) {
    const searchResult = document.getElementById('search-result');
    
    if (!student) {
        searchResult.innerHTML = `
            <div class="student-card">
                <h3><i class="fas fa-exclamation-circle"></i> No Student Found</h3>
                <p>No student found with the given roll number.</p>
            </div>
        `;
        return;
    }
    
    searchResult.innerHTML = `
        <div class="student-card">
            <h3><i class="fas fa-user"></i> Student Details</h3>
            <div class="student-details">
                <div class="detail-item">
                    <span class="detail-label">Roll Number:</span>
                    <span class="detail-value">${student.rollNo}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${student.name}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Mathematics:</span>
                    <span class="detail-value">${student.subject1}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Science:</span>
                    <span class="detail-value">${student.subject2}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">English:</span>
                    <span class="detail-value">${student.subject3}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total Marks:</span>
                    <span class="detail-value">${student.total}/300</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Percentage:</span>
                    <span class="detail-value">${student.percentage}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Grade:</span>
                    <span class="detail-value">
                        <span class="grade-badge grade-${student.grade.toLowerCase().replace('+', '-plus')}">${student.grade}</span>
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Load all students
async function loadAllStudents() {
    showLoading(true);
    
    try {
        // Try to fetch from backend
        const backendStudents = await fetchStudentsFromBackend();
        
        if (backendStudents && backendStudents.length > 0) {
            students = backendStudents;
            saveStudentsToLocalStorage();
        }
        
        displayStudentsTable(students);
    } catch (error) {
        console.error('Error loading students:', error);
        displayStudentsTable(students); // Show local data
    } finally {
        showLoading(false);
    }
}

// Fetch students from backend
async function fetchStudentsFromBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/students`);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Backend fetch failed:', error);
        return null;
    }
}

// Display students table
function displayStudentsTable(studentsToShow) {
    const tbody = document.getElementById('students-tbody');
    
    if (!studentsToShow || studentsToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #6c757d;">
                    <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    No students found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = studentsToShow.map(student => `
        <tr>
            <td>${student.rollNo}</td>
            <td>${student.name}</td>
            <td>${student.subject1}</td>
            <td>${student.subject2}</td>
            <td>${student.subject3}</td>
            <td>${student.total}</td>
            <td>${student.percentage}%</td>
            <td>
                <span class="grade-badge grade-${student.grade.toLowerCase().replace('+', '-plus')}">${student.grade}</span>
            </td>
            <td>
                <button class="btn btn-secondary" onclick="viewStudentDetails(${student.rollNo})" style="padding: 8px 12px; font-size: 0.8rem;">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Filter students by grade
function filterStudentsByGrade() {
    const selectedGrade = gradeFilter.value;
    
    if (!selectedGrade) {
        displayStudentsTable(students);
        return;
    }
    
    const filteredStudents = students.filter(student => student.grade === selectedGrade);
    displayStudentsTable(filteredStudents);
}

// View student details
function viewStudentDetails(rollNo) {
    const student = students.find(s => s.rollNo === rollNo);
    if (student) {
        // Switch to search section and display the student
        showSection('search-student');
        setActiveNav(document.querySelector('[data-section="search-student"]'));
        document.getElementById('search-roll').value = rollNo;
        displaySearchResult(student);
    }
}

// Load dashboard
function loadDashboard() {
    updateDashboard();
    loadRecentActivity();
}

// Update dashboard statistics
function updateDashboard() {
    const totalStudents = students.length;
    const topPerformers = students.filter(s => s.grade === 'A+').length;
    const failedStudents = students.filter(s => s.grade === 'F').length;
    
    let avgPercentage = 0;
    if (totalStudents > 0) {
        const totalPercentage = students.reduce((sum, student) => sum + student.percentage, 0);
        avgPercentage = (totalPercentage / totalStudents).toFixed(1);
    }
    
    // Update dashboard cards
    document.getElementById('total-students').textContent = totalStudents;
    document.getElementById('top-performers').textContent = topPerformers;
    document.getElementById('avg-percentage').textContent = avgPercentage + '%';
    document.getElementById('failed-students').textContent = failedStudents;
}

// Load recent activity
function loadRecentActivity() {
    const recentStudents = document.getElementById('recent-students');
    const recent = students.slice(-5).reverse(); // Last 5 students, most recent first
    
    if (recent.length === 0) {
        recentStudents.innerHTML = '<p>No recent activity</p>';
        return;
    }
    
    recentStudents.innerHTML = recent.map(student => `
        <div class="detail-item" style="margin-bottom: 10px;">
            <span class="detail-label">
                <i class="fas fa-user-plus"></i>
                ${student.name} (Roll: ${student.rollNo})
            </span>
            <span class="detail-value">
                <span class="grade-badge grade-${student.grade.toLowerCase().replace('+', '-plus')}">${student.grade}</span>
            </span>
        </div>
    `).join('');
}

// Load analytics
function loadAnalytics() {
    updateAnalyticsMetrics();
    updateGradeChart();
}

// Update analytics metrics
function updateAnalyticsMetrics() {
    if (students.length === 0) {
        document.getElementById('highest-score').textContent = '-';
        document.getElementById('lowest-score').textContent = '-';
        document.getElementById('pass-rate').textContent = '-';
        return;
    }
    
    const percentages = students.map(s => s.percentage);
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);
    const passCount = students.filter(s => s.grade !== 'F').length;
    const passRate = ((passCount / students.length) * 100).toFixed(1);
    
    document.getElementById('highest-score').textContent = highest + '%';
    document.getElementById('lowest-score').textContent = lowest + '%';
    document.getElementById('pass-rate').textContent = passRate + '%';
}

// Update grade chart (simple text-based chart)
function updateGradeChart() {
    const gradeChart = document.getElementById('grade-chart');
    
    if (students.length === 0) {
        gradeChart.innerHTML = '<p>No data available</p>';
        return;
    }
    
    const gradeCounts = {
        'A+': students.filter(s => s.grade === 'A+').length,
        'A': students.filter(s => s.grade === 'A').length,
        'B': students.filter(s => s.grade === 'B').length,
        'C': students.filter(s => s.grade === 'C').length,
        'F': students.filter(s => s.grade === 'F').length
    };
    
    const maxCount = Math.max(...Object.values(gradeCounts));
    
    gradeChart.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 15px; height: 100%;">
            ${Object.entries(gradeCounts).map(([grade, count]) => {
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return `
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span class="grade-badge grade-${grade.toLowerCase().replace('+', '-plus')}" style="min-width: 40px;">${grade}</span>
                        <div style="flex: 1; background: #e9ecef; border-radius: 10px; height: 25px; position: relative;">
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; width: ${percentage}%; border-radius: 10px; transition: width 0.5s ease;"></div>
                        </div>
                        <span style="min-width: 30px; font-weight: 600; color: #2c3e50;">${count}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Setup form validation
function setupFormValidation() {
    const inputs = addStudentForm.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const value = parseInt(this.value);
            
            if (this.name.includes('subject') && (value < 0 || value > 100)) {
                this.setCustomValidity('Marks should be between 0 and 100');
            } else if (this.name === 'rollNo' && value <= 0) {
                this.setCustomValidity('Roll number should be greater than 0');
            } else {
                this.setCustomValidity('');
            }
        });
    });
}

// Show loading overlay
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('show');
    } else {
        loadingOverlay.classList.remove('show');
    }
}

// Show message
function showMessage(type, text) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
        <span>${text}</span>
        <button class="close-btn" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    messageContainer.appendChild(message);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (message.parentElement) {
            message.remove();
        }
    }, 5000);
}

// Save students to localStorage
function saveStudentsToLocalStorage() {
    localStorage.setItem('srms-students', JSON.stringify(students));
}

// Export functionality (bonus feature)
function exportToCSV() {
    if (students.length === 0) {
        showMessage('warning', 'No data to export');
        return;
    }
    
    const headers = ['Roll No', 'Name', 'Mathematics', 'Science', 'English', 'Total', 'Percentage', 'Grade'];
    const csvContent = [
        headers.join(','),
        ...students.map(student => [
            student.rollNo,
            `"${student.name}"`,
            student.subject1,
            student.subject2,
            student.subject3,
            student.total,
            student.percentage,
            student.grade
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    showMessage('success', 'Data exported successfully!');
}

// Add export button to all students section
document.addEventListener('DOMContentLoaded', function() {
    const tableControls = document.querySelector('.table-controls .filters');
    if (tableControls) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-primary';
        exportBtn.innerHTML = '<i class="fas fa-download"></i> Export CSV';
        exportBtn.onclick = exportToCSV;
        tableControls.appendChild(exportBtn);
    }
});