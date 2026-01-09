// ===================================
// Data Storage Manager
// ===================================
class StorageManager {
    constructor() {
        this.BASE_URL = `${window.location.origin}/api`;
        this.userId = this.getUserId();
        this.THEME_KEY = 'protrack_theme';
    }

    getUserId() {
        const userJson = localStorage.getItem('protrack_user');
        if (userJson) {
            const user = JSON.parse(userJson);
            return user._id; // Ensure server returns _id
        }
        return null;
    }

    async apiCall(endpoint, method = 'GET', body = null) {
        if (!this.userId) {
            this.userId = this.getUserId();
            if (!this.userId) return [];
        }

        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' // Required for session cookies
            };
            if (body) {
                body.userId = this.userId;
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${this.BASE_URL}${endpoint}`, options);
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('API Request Failed:', error);
            return [];
        }
    }

    // --- Expenses ---
    async getExpenses() {
        if (!this.userId) return [];
        return await this.apiCall(`/expenses/${this.userId}`);
    }

    async addExpense(expense) {
        return await this.apiCall('/expenses', 'POST', expense);
    }

    async updateExpense(id, expense) {
        return await this.apiCall(`/expenses/${id}`, 'PUT', expense);
    }

    async deleteExpense(id) {
        return await this.apiCall(`/expenses/${id}`, 'DELETE');
    }

    // --- Time Entries ---
    async getTimeEntries() {
        if (!this.userId) return [];
        const entries = await this.apiCall(`/time/${this.userId}`);
        return (entries || []).map(entry => {
            // Normalize legacy data: recalculate hours/minutes if missing
            if ((entry.hours === undefined || entry.minutes === undefined) && entry.startTime && entry.endTime) {
                const start = new Date(`2000-01-01T${entry.startTime}`);
                const end = new Date(`2000-01-01T${entry.endTime}`);
                let diffMinutes = Math.round((end - start) / 60000);
                if (diffMinutes <= 0) diffMinutes += 1440;
                const { hours, minutes } = Utils.fromMinutes(diffMinutes);
                entry.hours = hours;
                entry.minutes = minutes;
            }
            return entry;
        });
    }

    async addTimeEntry(entry) {
        return await this.apiCall('/time', 'POST', entry);
    }

    async updateTimeEntry(id, entry) {
        return await this.apiCall(`/time/${id}`, 'PUT', entry);
    }

    async deleteTimeEntry(id) {
        return await this.apiCall(`/time/${id}`, 'DELETE');
    }

    // --- Budget ---
    async getMonthlyBudget() {
        const data = await this.apiCall(`/budget/${this.userId}`);
        return data && data.amount ? parseFloat(data.amount) : 0;
    }

    async saveMonthlyBudget(amount) {
        return await this.apiCall('/budget', 'POST', { amount });
    }

    // --- Theme (Keep Local) ---
    getTheme() {
        return localStorage.getItem(this.THEME_KEY) || 'light';
    }

    setTheme(theme) {
        localStorage.setItem(this.THEME_KEY, theme);
    }
}

// ===================================
// Utility Functions
// ===================================
const Utils = {
    // Format currency
    formatCurrency(amount) {
        return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    },

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    },

    // Get today's date in YYYY-MM-DD format
    getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    },

    // Get current month and year
    getCurrentMonth() {
        const today = new Date();
        return {
            month: today.getMonth(),
            year: today.getFullYear()
        };
    },

    // Format month display
    formatMonth(month, year) {
        const date = new Date(year, month, 1);
        return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    },

    // Check if date is today
    isToday(dateString) {
        return dateString === this.getTodayDate();
    },

    // Check if date is in current month
    isCurrentMonth(dateString) {
        const date = new Date(dateString);
        const current = this.getCurrentMonth();
        return date.getMonth() === current.month && date.getFullYear() === current.year;
    },

    // Get dates in month
    getDatesInMonth(month, year) {
        const dates = [];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    },

    // Format time duration
    formatDuration(hours, minutes) {
        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;
        if (h === 0 && m === 0) return '0m';
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h ${m}m`;
    },

    // Convert hours and minutes to total minutes
    toMinutes(hours, minutes) {
        return (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    },

    // Convert minutes to hours and minutes
    fromMinutes(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return { hours, minutes };
    },

    // Get category icon
    getCategoryIcon(category) {
        const icons = {
            'Food': '🍔',
            'Travel': '🚗',
            'Rent': '🏠',
            'Bills': '📄',
            'Shopping': '🛍️',
            'Entertainment': '🎬',
            'Medical': '💊',
            'Other': '📦'
        };
        return icons[category] || '📦';
    },

    // Get activity icon
    getActivityIcon(activity) {
        const icons = {
            'Office Work': '💼',
            'Commute': '🚌',
            'Meetings': '👥',
            'Breaks': '☕',
            'Personal Time': '🏃',
            'Sleep': '😴',
            'Learning': '📚',
            'Other': '📌'
        };
        return icons[activity] || '📌';
    },

    // Get category color
    getCategoryColor(category) {
        const colors = {
            'Food': '#f093fb',
            'Travel': '#4facfe',
            'Rent': '#fa709a',
            'Bills': '#fee140',
            'Shopping': '#667eea',
            'Entertainment': '#764ba2',
            'Medical': '#f5576c',
            'Other': '#a0aec0'
        };
        return colors[category] || '#a0aec0';
    },

    to24Hour(timeStr) {
        // timeStr format: "02:30 PM" or "14:30"
        if (!timeStr) return null;
        timeStr = timeStr.trim();

        if (timeStr.includes(':') && !timeStr.includes(' ')) return timeStr; // Already 24h

        const parts = timeStr.split(' ');
        if (parts.length < 2) return null;

        const time = parts[0];
        const modifier = parts[1].toUpperCase();

        const timeParts = time.split(':');
        if (timeParts.length < 2) return null;

        let hours = timeParts[0];
        let minutes = timeParts[1];

        if (hours === '12') {
            hours = '00';
        }

        if (modifier === 'PM') {
            hours = (parseInt(hours, 10) + 12).toString();
        }

        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    },

    to12Hour(timeStr) {
        // timeStr format: "14:30" -> "02:30 PM"
        if (!timeStr) return '';
        const [hour, minute] = timeStr.split(':');
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12.toString().padStart(2, '0')}:${minute} ${ampm}`;
    },

    // Export to CSV
    // Export to CSV
    exportToCSV(data, filename) {
        if (data.length === 0) {
            console.warn('No data to export');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header] || '';
                // Handle values offering proper escaping if needed, but for now simple quote wrap is okay
                return `"${value}"`;
            }).join(','))
        ].join('\n');

        // Add BOM for Excel UTF-8 compatibility
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${this.getTodayDate()}.csv`;

        // Append to body to ensure click works in all contexts
        document.body.appendChild(a);
        a.click();

        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
};

// ===================================
// Authentication Manager
// ===================================
class AuthManager {
    constructor() {
        this.USER_KEY = 'protrack_user';
        this.REGISTERED_USERS_KEY = 'protrack_registered_users';
        this.container = document.getElementById('auth-container');
        this.appContainer = document.getElementById('app-container');
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.resetPasswordForm = document.getElementById('reset-password-form');
        this.logoutBtn = document.getElementById('logout-btn');
        this.userNameEl = document.getElementById('display-user-name');
        this.userAvatarEl = document.getElementById('user-avatar-initial');

        // Expose AuthManager globally for oauth.js to access
        window.authManager = this;

        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuth();
    }

    async checkAuth() {
        console.log('--- Auth Check Started ---');
        // 1. Try Local Storage first
        const userJson = localStorage.getItem(this.USER_KEY);
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                console.log('Local user found:', user.email);
                this.showApp(user);
                return;
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }

        // 2. If no local user, check if server has a session
        try {
            console.log(`Checking server session at ${window.location.origin}/api/auth/user...`);
            const response = await fetch(`${window.location.origin}/api/auth/user`, {
                credentials: 'include'
            });

            console.log('Server response status:', response.status);
            if (response.ok) {
                const user = await response.json();
                console.log('Server session found! User:', user.email);
                localStorage.setItem(this.USER_KEY, JSON.stringify(user));
                this.showApp(user);
            } else {
                console.log('No server session found (401).');
                this.showAuth();
            }
        } catch (error) {
            console.error('Failed to check server session:', error);
            this.showAuth();
        }
    }

    getRegisteredUsers() {
        const users = localStorage.getItem(this.REGISTERED_USERS_KEY);
        return users ? JSON.parse(users) : {};
    }

    registerUser(email, name, password) {
        const users = this.getRegisteredUsers();
        if (users[email]) {
            this.showError('Account already exists! Please sign in.');
            this.switchToLogin();
            return false;
        }

        // Save user
        users[email] = {
            name: name,
            email: email,
            password: password, // In a real app, this should be hashed
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(this.REGISTERED_USERS_KEY, JSON.stringify(users));
        return true;
    }

    validateUser(input, password) {
        const users = this.getRegisteredUsers();
        let user = users[input]; // Try direct email lookup

        // If not found by email, try searching by name
        if (!user) {
            const allUsers = Object.values(users);
            user = allUsers.find(u => u.name === input || u.name.toLowerCase() === input.toLowerCase());
        }

        if (!user) {
            return { valid: false, reason: 'not_found' };
        }

        // Simple password check (ensure input password matches stored password)
        if (user.password !== password) {
            return { valid: false, reason: 'wrong_password' };
        }

        return { valid: true, user: user };
    }

    bindEvents() {
        // Password Toggle (Login)
        const toggleLoginBtn = document.getElementById('toggle-password');
        if (toggleLoginBtn) {
            toggleLoginBtn.addEventListener('click', () => {
                this.togglePasswordVisibility('login-password', toggleLoginBtn);
            });
        }

        // Password Toggle (Register)
        const toggleRegBtn = document.getElementById('toggle-reg-password');
        if (toggleRegBtn) {
            toggleRegBtn.addEventListener('click', () => {
                this.togglePasswordVisibility('reg-password', toggleRegBtn);
            });
        }

        // Toggle forms
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToRegister();
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToLogin();
        });

        // Show Forgot Password
        document.getElementById('show-forgot-password').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToForgotPassword();
        });

        // Back to Login
        document.getElementById('back-to-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToLogin();
        });

        // Toggle Reset Password visibility
        const toggleResetBtn = document.getElementById('toggle-reset-password');
        if (toggleResetBtn) {
            toggleResetBtn.addEventListener('click', () => {
                this.togglePasswordVisibility('reset-new-password', toggleResetBtn);
            });
        }

        // Reset Password Submit
        this.resetPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleResetPassword();
        });

        // Login Submit
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            this.hideError();

            const result = this.validateUser(email, password);

            if (result.valid) {
                this.createSession(result.user);
            } else {
                if (result.reason === 'not_found') {
                    this.showError(`
                        Account not found. 
                        <a href="#" id="inline-register-link" style="color:var(--danger-color); font-weight:700; text-decoration:underline;">
                            Create an account?
                        </a>
                    `);

                    document.getElementById('inline-register-link').addEventListener('click', (ev) => {
                        ev.preventDefault();
                        this.switchToRegister();
                        const regEmail = document.getElementById('reg-email');
                        if (regEmail) regEmail.value = email;
                    });

                } else if (result.reason === 'wrong_password') {
                    this.showError('Incorrect password. Please try again.');
                }
            }
        });

        // Register Submit
        this.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;

            if (this.registerUser(email, name, password)) {
                this.switchToLogin();
                this.showError('Account created! You can now sign in.'); // Using showError for success message temporarily
                // Pre-fill login email
                const loginEmail = document.getElementById('login-email');
                if (loginEmail) loginEmail.value = email;
            }
        });

        // Social Login
        const socialButtons = [
            { id: 'login-google', provider: 'google' },
            { id: 'reg-google', provider: 'google' }
        ];

        socialButtons.forEach(btn => {
            const el = document.getElementById(btn.id);
            if (el) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = `${window.location.origin}/api/auth/${btn.provider}`;
                });
            }
        });


        // Logout
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    showError(msg) {
        const errorEl = document.getElementById('login-error');
        if (errorEl) {
            errorEl.innerHTML = msg;
            errorEl.classList.add('visible');
            setTimeout(() => {
                errorEl.classList.remove('visible'); // Remove shake animation class to re-trigger if needed
                errorEl.style.display = 'block'; // Keep visible
            }, 500);
        }
    }

    hideError() {
        const errorEl = document.getElementById('login-error');
        if (errorEl) {
            errorEl.classList.remove('visible');
            errorEl.style.display = 'none';
            errorEl.innerHTML = '';
        }
    }

    togglePasswordVisibility(inputId, toggleBtn) {
        const passwordInput = document.getElementById(inputId);
        const eyeOpen = toggleBtn.querySelector('.eye-open');
        const eyeClosed = toggleBtn.querySelector('.eye-closed');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeOpen.style.display = 'none';
            eyeClosed.style.display = 'block';
        } else {
            passwordInput.type = 'password';
            eyeOpen.style.display = 'block';
            eyeClosed.style.display = 'none';
        }
    }

    switchToRegister() {
        this.loginForm.classList.remove('active');
        this.registerForm.classList.remove('hidden');
        this.registerForm.classList.add('active');
    }

    switchToLogin() {
        this.registerForm.classList.remove('active');
        this.registerForm.classList.add('hidden');
        this.resetPasswordForm.classList.remove('active');
        this.resetPasswordForm.classList.add('hidden');
        this.loginForm.classList.add('active');
        this.loginForm.classList.remove('hidden');
    }

    switchToForgotPassword() {
        this.loginForm.classList.remove('active');
        this.loginForm.classList.add('hidden');
        this.resetPasswordForm.classList.remove('hidden');
        this.resetPasswordForm.classList.add('active');
    }

    async handleResetPassword() {
        const email = document.getElementById('reset-email').value;
        const newPassword = document.getElementById('reset-new-password').value;

        try {
            const response = await fetch(`${window.location.origin}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                // Update local registry too
                const users = this.getRegisteredUsers();
                if (users[email]) {
                    users[email].password = newPassword;
                    localStorage.setItem(this.REGISTERED_USERS_KEY, JSON.stringify(users));
                }

                alert('Password updated successfully! Please sign in with your new password.');
                this.switchToLogin();
            } else {
                alert(data.error || 'Failed to update password');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            alert('An error occurred. Please try again later.');
        }
    }

    async createSession(user) {
        try {
            // Sync with backend to get MongoDB _id
            const response = await fetch(`${window.location.origin}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: user.email,
                    name: user.name,
                    picture: user.picture,
                    password: user.password
                })
            });

            if (response.ok) {
                const dbUser = await response.json();
                user._id = dbUser._id; // Attach DB ID
            }
        } catch (error) {
            console.error('Backend sync failed (Local Auth):', error);
        }

        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.showApp(user);
    }



    async logout() {
        localStorage.removeItem(this.USER_KEY);

        try {
            // Also notify backend to clear session cookie
            await fetch(`${window.location.origin}/api/auth/logout`, { credentials: 'include' });
        } catch (e) {
            console.error("Backend logout failed:", e);
        }

        this.showAuth();
        // Clear forms
        if (document.getElementById('login-email')) document.getElementById('login-email').value = '';
        if (document.getElementById('login-password')) document.getElementById('login-password').value = '';
        if (document.getElementById('reg-name')) document.getElementById('reg-name').value = '';
        if (document.getElementById('reg-email')) document.getElementById('reg-email').value = '';
        if (document.getElementById('reg-password')) document.getElementById('reg-password').value = '';
    }

    showApp(user) {
        this.container.classList.add('hidden');
        this.appContainer.classList.remove('hidden');
        document.getElementById('theme-toggle').classList.remove('hidden');
        document.getElementById('mobile-menu-toggle').classList.remove('hidden');

        // Update User Profile
        if (user) {
            if (this.userNameEl) this.userNameEl.textContent = user.name;
            if (this.userAvatarEl) this.userAvatarEl.textContent = user.name.charAt(0).toUpperCase();
        }

        // Trigger app reload if it exists
        if (window.app && typeof window.app.renderDashboard === 'function') {
            window.app.renderDashboard();
        }
    }

    showAuth() {
        this.container.classList.remove('hidden');
        this.appContainer.classList.add('hidden');
        document.getElementById('theme-toggle').classList.add('hidden');
        document.getElementById('mobile-menu-toggle').classList.add('hidden');
    }
}

// ===================================
// Main Application
// ===================================
class ProTrackApp {
    constructor() {
        this.auth = new AuthManager();
        this.storage = new StorageManager();
        this.currentView = 'dashboard';
        this.selectedMonth = Utils.getCurrentMonth();
        this.charts = {};
        this.timePicker = new TimePicker(); // Initialize custom time picker

        this.init();
    }

    init() {
        this.setupTheme();
        this.setupMobileMenu();
        this.setupNavigation();
        this.setupModals();
        this.setupForms();
        this.setupFilters();
        this.setupBudget();
        this.updateCurrentDate();
        this.renderDashboard();
    }

    // ===================================
    // Theme Management
    // ===================================
    setupTheme() {
        const theme = this.storage.getTheme();
        document.documentElement.setAttribute('data-theme', theme);

        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            this.storage.setTheme(newTheme);
        });
    }

    // ===================================
    // Mobile Menu
    // ===================================
    setupMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const mobileOverlay = document.getElementById('mobile-overlay');
        const navItems = document.querySelectorAll('.nav-item');

        // Toggle mobile menu
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            mobileOverlay.classList.toggle('active');
        });

        // Close menu when overlay is clicked
        mobileOverlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            mobileOverlay.classList.remove('active');
        });

        // Close menu when navigation item is clicked
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                sidebar.classList.remove('mobile-open');
                mobileOverlay.classList.remove('active');
            });
        });
    }

    // ===================================
    // Navigation
    // ===================================
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const view = item.getAttribute('data-view');
                this.switchView(view);

                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Month navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            this.selectedMonth.month--;
            if (this.selectedMonth.month < 0) {
                this.selectedMonth.month = 11;
                this.selectedMonth.year--;
            }
            this.renderMonthlyView();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.selectedMonth.month++;
            if (this.selectedMonth.month > 11) {
                this.selectedMonth.month = 0;
                this.selectedMonth.year++;
            }
            this.renderMonthlyView();
        });
    }

    async switchView(view) {
        // Hide all views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

        // Show selected view
        document.getElementById(`${view}-view`).classList.add('active');
        this.currentView = view;

        // Render view content
        switch (view) {
            case 'dashboard':
                await this.renderDashboard();
                break;
            case 'expenses':
                await this.renderExpensesView();
                break;
            case 'time-tracker':
                await this.renderTimeTrackerView();
                break;
            case 'monthly':
                await this.renderMonthlyView();
                break;
            case 'analytics':
                await this.renderAnalyticsView();
                break;
        }
    }

    // ===================================
    // Modal Management
    // ===================================
    setupModals() {
        // Expense modal
        const expenseModal = document.getElementById('expense-modal');
        const openExpenseButtons = [
            document.getElementById('add-expense-btn'),
            document.getElementById('add-expense-quick')
        ];

        openExpenseButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    this.openExpenseModal();
                });
            }
        });

        document.getElementById('close-expense-modal').addEventListener('click', () => {
            this.closeModal(expenseModal);
        });

        document.getElementById('cancel-expense').addEventListener('click', () => {
            this.closeModal(expenseModal);
        });

        // Time modal
        const timeModal = document.getElementById('time-modal');
        const openTimeButtons = [
            document.getElementById('add-time-btn'),
            document.getElementById('add-time-quick')
        ];

        openTimeButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    this.openTimeModal();
                });
            }
        });

        document.getElementById('close-time-modal').addEventListener('click', () => {
            this.closeModal(timeModal);
        });

        document.getElementById('cancel-time').addEventListener('click', () => {
            this.closeModal(timeModal);
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    openExpenseModal(expense = null) {
        const modal = document.getElementById('expense-modal');
        const form = document.getElementById('expense-form');
        const categorySelect = document.getElementById('expense-category');
        const customInput = document.getElementById('expense-category-custom');

        if (expense) {
            // Edit mode
            document.getElementById('expense-date').value = expense.date;

            // Check if category is one of the options
            const options = Array.from(categorySelect.options).map(o => o.value);
            if (options.includes(expense.category) && expense.category !== 'Other') {
                categorySelect.value = expense.category;
                customInput.style.display = 'none';
                customInput.required = false;
            } else {
                categorySelect.value = 'Other';
                customInput.style.display = 'block';
                customInput.required = true;
                customInput.value = expense.category;
            }

            document.getElementById('expense-amount').value = expense.amount;
            document.getElementById('expense-payment').value = expense.paymentMode;
            document.getElementById('expense-notes').value = expense.notes || '';
            form.dataset.editId = expense.id;
        } else {
            // Add mode
            form.reset();
            customInput.style.display = 'none'; // Reset custom input visibility
            customInput.required = false;
            document.getElementById('expense-date').value = Utils.getTodayDate();
            delete form.dataset.editId;
        }

        modal.classList.add('active');
    }

    openTimeModal(entry = null) {
        const modal = document.getElementById('time-modal');
        const form = document.getElementById('time-form');
        const activitySelect = document.getElementById('time-activity');
        const customInput = document.getElementById('time-activity-custom');

        if (entry) {
            // Edit mode
            document.getElementById('time-date').value = entry.date;

            // Check if activity is one of the options
            const options = Array.from(activitySelect.options).map(o => o.value);
            if (options.includes(entry.activity) && entry.activity !== 'Other') {
                activitySelect.value = entry.activity;
                customInput.style.display = 'none';
                customInput.required = false;
            } else {
                activitySelect.value = 'Other';
                customInput.style.display = 'block';
                customInput.required = true;
                customInput.value = entry.activity;
            }

            document.getElementById('time-start').value = entry.startTime ? Utils.to12Hour(entry.startTime) : '';
            document.getElementById('time-end').value = entry.endTime ? Utils.to12Hour(entry.endTime) : '';
            document.getElementById('time-notes').value = entry.notes || '';
            form.dataset.editId = entry.id || entry._id;
        } else {
            // Add mode
            form.reset();
            customInput.style.display = 'none'; // Reset custom input visibility
            customInput.required = false;
            document.getElementById('time-date').value = Utils.getTodayDate();
            delete form.dataset.editId;
        }

        modal.classList.add('active');
    }

    closeModal(modal) {
        modal.classList.remove('active');
    }

    // ===================================
    // Form Handling
    // ===================================
    setupForms() {
        // Expense form
        const expenseForm = document.getElementById('expense-form');
        expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleExpenseSubmit(e.target);
        });

        const expenseCategory = document.getElementById('expense-category');
        if (expenseCategory) {
            expenseCategory.addEventListener('change', (e) => {
                const customInput = document.getElementById('expense-category-custom');
                if (e.target.value === 'Other') {
                    customInput.style.display = 'block';
                    customInput.required = true;
                } else {
                    customInput.style.display = 'none';
                    customInput.required = false;
                }
            });
        }

        // Time form
        const timeForm = document.getElementById('time-form');
        timeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTimeSubmit(e.target);
        });

        const timeActivity = document.getElementById('time-activity');
        if (timeActivity) {
            timeActivity.addEventListener('change', (e) => {
                const customInput = document.getElementById('time-activity-custom');
                if (e.target.value === 'Other') {
                    customInput.style.display = 'block';
                    customInput.required = true;
                } else {
                    customInput.style.display = 'none';
                    customInput.required = false;
                }
            });
        }

        // Time validation
        const timeStart = document.getElementById('time-start');
        const timeEnd = document.getElementById('time-end');
        const timeDate = document.getElementById('time-date');

        [timeStart, timeEnd, timeDate].forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.validateTimeEntry());
            }
        });

        // Add auto-picker opening on click for all date/time inputs
        const dateInputs = document.querySelectorAll('input[type="date"], input[type="time"]');
        dateInputs.forEach(input => {
            input.addEventListener('click', (e) => {
                try {
                    input.showPicker();
                } catch (err) {
                    // Fallback or ignore if not supported
                    console.log('showPicker not supported');
                }
            });
        });
    }

    async handleExpenseSubmit(form) {
        let category = document.getElementById('expense-category').value;
        if (category === 'Other') {
            category = document.getElementById('expense-category-custom').value;
        }

        const expense = {
            date: document.getElementById('expense-date').value,
            category: category,
            amount: parseFloat(document.getElementById('expense-amount').value),
            paymentMode: document.getElementById('expense-payment').value,
            notes: document.getElementById('expense-notes').value
        };

        if (form.dataset.editId) {
            // Update existing expense
            await this.storage.updateExpense(form.dataset.editId, expense);
        } else {
            // Add new expense
            await this.storage.addExpense(expense);
        }

        this.closeModal(document.getElementById('expense-modal'));
        this.refreshCurrentView();
    }

    async handleTimeSubmit(form) {
        const startTime = document.getElementById('time-start').value;
        const endTime = document.getElementById('time-end').value;

        if (!startTime || !endTime) {
            console.warn('Please select both start and end times');
            return;
        }

        const start24 = Utils.to24Hour(startTime);
        const end24 = Utils.to24Hour(endTime);

        const start = new Date(`2000-01-01T${start24}`);
        const end = new Date(`2000-01-01T${end24}`);

        let diffMinutes = Math.round((end - start) / 60000);

        // Handle midnight wrap (e.g., 11 PM to 2 AM)
        if (diffMinutes <= 0) {
            diffMinutes += 1440; // Add 24 hours
        }

        const { hours, minutes } = Utils.fromMinutes(diffMinutes);

        let activity = document.getElementById('time-activity').value;
        if (activity === 'Other') {
            activity = document.getElementById('time-activity-custom').value;
        }

        const entry = {
            date: document.getElementById('time-date').value,
            activity: activity,
            startTime: start24,
            endTime: end24,
            hours: hours,
            minutes: minutes,
            duration: Utils.formatDuration(hours, minutes),
            notes: document.getElementById('time-notes').value
        };

        // Validate total time for the day
        const totalMinutes = await this.getTotalMinutesForDate(entry.date, form.dataset.editId);
        const newMinutes = Utils.toMinutes(entry.hours, entry.minutes);

        // Limit check removed as per user request (no restrictions)
        /*
        if (totalMinutes + newMinutes > 1440) { 
            console.warn('Total time for this day exceeds 24 hours!');
            return;
        }
        */

        if (form.dataset.editId) {
            // Update existing entry
            await this.storage.updateTimeEntry(form.dataset.editId, entry);
        } else {
            // Add new entry
            await this.storage.addTimeEntry(entry);
        }

        this.closeModal(document.getElementById('time-modal'));
        this.refreshCurrentView();
    }

    async validateTimeEntry() {
        // Validation removed as per user request (no restrictions)
        const warning = document.getElementById('time-validation-warning');
        if (warning) warning.style.display = 'none';
    }

    async getTotalMinutesForDate(date, excludeId = null) {
        const allEntries = await this.storage.getTimeEntries();
        const entries = allEntries
            .filter(e => e.date === date && e._id !== excludeId && e.id !== excludeId);

        return entries.reduce((total, entry) => {
            return total + Utils.toMinutes(entry.hours, entry.minutes);
        }, 0);
    }

    // ===================================
    // Filters
    // ===================================
    setupFilters() {
        // Expense filters
        const expenseDateFilter = document.getElementById('expense-date-filter');
        const expenseMonthFilter = document.getElementById('expense-month-filter');
        const expenseCategoryFilter = document.getElementById('expense-category-filter');
        const expenseCategoryCustomFilter = document.getElementById('expense-category-custom-filter');
        const expensePaymentFilter = document.getElementById('expense-payment-filter');
        const expenseSortFilter = document.getElementById('expense-sort-filter');

        if (expenseDateFilter) {
            expenseDateFilter.addEventListener('change', () => {
                if (expenseDateFilter.value) document.getElementById('expense-month-filter').value = '';
                this.renderExpensesView();
            });
        }
        if (expenseMonthFilter) {
            expenseMonthFilter.addEventListener('change', () => {
                if (expenseMonthFilter.value) document.getElementById('expense-date-filter').value = '';
                this.renderExpensesView();
            });
        }
        if (expenseCategoryFilter) {
            expenseCategoryFilter.addEventListener('change', (e) => {
                if (e.target.value === 'Other') {
                    expenseCategoryCustomFilter.style.display = 'block';
                    expenseCategoryCustomFilter.value = '';
                } else {
                    expenseCategoryCustomFilter.style.display = 'none';
                    expenseCategoryCustomFilter.value = '';
                }
                this.renderExpensesView();
            });
        }
        if (expenseCategoryCustomFilter) {
            expenseCategoryCustomFilter.addEventListener('input', () => this.renderExpensesView());
        }

        [expensePaymentFilter, expenseSortFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.renderExpensesView());
            }
        });

        // Time filters
        const timeDateFilter = document.getElementById('time-date-filter');
        const timeMonthFilter = document.getElementById('time-month-filter');
        const timeActivityFilter = document.getElementById('time-activity-filter');
        const timeActivityCustomFilter = document.getElementById('time-activity-custom-filter');
        const timeSortFilter = document.getElementById('time-sort-filter');

        if (timeDateFilter) {
            timeDateFilter.addEventListener('change', () => {
                if (timeDateFilter.value) document.getElementById('time-month-filter').value = '';
                this.renderTimeTrackerView();
            });
        }
        if (timeMonthFilter) {
            timeMonthFilter.addEventListener('change', () => {
                if (timeMonthFilter.value) document.getElementById('time-date-filter').value = '';
                this.renderTimeTrackerView();
            });
        }
        if (timeActivityFilter) {
            timeActivityFilter.addEventListener('change', (e) => {
                if (e.target.value === 'Other') {
                    timeActivityCustomFilter.style.display = 'block';
                    timeActivityCustomFilter.value = '';
                } else {
                    timeActivityCustomFilter.style.display = 'none';
                    timeActivityCustomFilter.value = '';
                }
                this.renderTimeTrackerView();
            });
        }
        if (timeActivityCustomFilter) {
            timeActivityCustomFilter.addEventListener('input', () => this.renderTimeTrackerView());
        }

        if (timeSortFilter) {
            timeSortFilter.addEventListener('change', () => this.renderTimeTrackerView());
        }

        // Export buttons
        document.getElementById('export-expenses-btn').addEventListener('click', () => {
            this.exportExpenses();
        });

        document.getElementById('export-time-btn').addEventListener('click', () => {
            this.exportTimeEntries();
        });
    }

    // ===================================
    // Dashboard Rendering
    // ===================================
    async renderDashboard() {
        await this.updateDashboardStats();
        await this.renderTodayExpenses();
        await this.renderTodayTimeChart();
    }

    async updateDashboardStats() {
        const expenses = await this.storage.getExpenses();
        const timeEntries = await this.storage.getTimeEntries();
        const today = Utils.getTodayDate();

        // Today's expenses
        const todayExpenses = (expenses || []).filter(e => e.date === today);
        const todayTotal = todayExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        document.getElementById('today-expense').textContent = Utils.formatCurrency(todayTotal);

        // Yesterday's expenses for comparison
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];
        const yesterdayExpenses = (expenses || []).filter(e => e.date === yesterdayDate);
        const yesterdayTotal = yesterdayExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

        const changePercent = yesterdayTotal > 0 ? ((todayTotal - yesterdayTotal) / yesterdayTotal * 100).toFixed(1) : 0;
        const changeElement = document.getElementById('expense-change');
        if (changeElement) {
            if (changePercent > 0) {
                changeElement.textContent = `+${changePercent}% from yesterday`;
                changeElement.className = 'stat-change negative';
            } else if (changePercent < 0) {
                changeElement.textContent = `${changePercent}% from yesterday`;
                changeElement.className = 'stat-change positive';
            } else {
                changeElement.textContent = 'Same as yesterday';
                changeElement.className = 'stat-change';
            }
        }

        // Monthly expenses
        const currentMonth = Utils.getCurrentMonth();
        const monthlyExpenses = (expenses || []).filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth.month && date.getFullYear() === currentMonth.year;
        });
        const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        document.getElementById('month-expense').textContent = Utils.formatCurrency(monthlyTotal);

        // Today's hours
        const todayTime = (timeEntries || []).filter(e => e.date === today);
        const todayMinutes = todayTime.reduce((sum, e) => sum + Utils.toMinutes(e.hours, e.minutes), 0);
        const todayHours = Utils.fromMinutes(todayMinutes);
        document.getElementById('today-hours').textContent = Utils.formatDuration(todayHours.hours, todayHours.minutes);

        const remainingMinutes = Math.max(0, 1440 - todayMinutes);
        const remaining = Utils.fromMinutes(remainingMinutes);
        document.getElementById('hours-remaining').textContent = `${Utils.formatDuration(remaining.hours, remaining.minutes)} remaining`;

        // Productivity score
        const workActivities = ['Office Work', 'Meetings', 'Learning'];
        const workMinutes = todayTime
            .filter(e => workActivities.includes(e.activity))
            .reduce((sum, e) => sum + Utils.toMinutes(e.hours, e.minutes), 0);

        const productivityScore = todayMinutes > 0 ? Math.round((workMinutes / todayMinutes) * 100) : 0;
        document.getElementById('productivity-score').textContent = `${productivityScore}%`;
    }

    async renderTodayExpenses() {
        const container = document.getElementById('today-expenses-list');
        const allExpenses = await this.storage.getExpenses();
        const expenses = (allExpenses || [])
            .filter(e => Utils.isToday(e.date))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        if (expenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No expenses recorded today</p>
                </div>
            `;
            return;
        }

        container.innerHTML = expenses.map(expense => `
            <div class="expense-item-mini">
                <div class="expense-item-info">
                    <div class="expense-category-icon" style="background: ${Utils.getCategoryColor(expense.category)}20;">
                        ${Utils.getCategoryIcon(expense.category)}
                    </div>
                    <div class="expense-item-details">
                        <h4>${expense.category}</h4>
                        <p>${expense.paymentMode}</p>
                    </div>
                </div>
                <div class="expense-amount">${Utils.formatCurrency(expense.amount)}</div>
            </div>
        `).join('');
    }

    async renderTodayTimeChart() {
        const container = document.getElementById('today-time-chart');
        const allEntries = await this.storage.getTimeEntries();
        const entries = allEntries.filter(e => Utils.isToday(e.date));

        if (entries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No time entries recorded today</p>
                </div>
            `;
            return;
        }

        // Group by activity
        const activityData = {};
        entries.forEach(entry => {
            const minutes = Utils.toMinutes(entry.hours, entry.minutes);
            activityData[entry.activity] = (activityData[entry.activity] || 0) + minutes;
        });

        const totalMinutes = Object.values(activityData).reduce((sum, m) => sum + m, 0);

        container.innerHTML = Object.entries(activityData)
            .sort((a, b) => b[1] - a[1])
            .map(([activity, minutes]) => {
                const percentage = (minutes / totalMinutes * 100).toFixed(1);
                const duration = Utils.fromMinutes(minutes);
                return `
                    <div class="category-item">
                        <div class="category-info">
                            <span style="font-size: 20px;">${Utils.getActivityIcon(activity)}</span>
                            <span>${activity}</span>
                        </div>
                        <div class="category-bar">
                            <div class="category-bar-fill" style="width: ${percentage}%;"></div>
                        </div>
                        <div class="category-amount">${Utils.formatDuration(duration.hours, duration.minutes)}</div>
                    </div>
                `;
            }).join('');
    }

    // ===================================
    // Budget Management
    // ===================================
    setupBudget() {
        const editBtn = document.getElementById('edit-budget-btn');
        const saveBtn = document.getElementById('save-budget-btn');
        const cancelBtn = document.getElementById('cancel-budget-btn');
        const inputContainer = document.getElementById('budget-input-container');
        const displayContainer = document.getElementById('budget-display-container');
        const budgetInput = document.getElementById('monthly-budget-input');

        if (editBtn) {
            editBtn.addEventListener('click', async () => {
                const currentBudget = await this.storage.getMonthlyBudget();
                budgetInput.value = currentBudget || '';
                inputContainer.style.display = 'block';
                // editBtn.style.display = 'none';
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                inputContainer.style.display = 'none';
                // editBtn.style.display = 'block';
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const amount = parseFloat(budgetInput.value);
                if (isNaN(amount) || amount < 0) {
                    console.error('Please enter a valid amount');
                    return;
                }
                await this.storage.saveMonthlyBudget(amount);
                inputContainer.style.display = 'none';
                // editBtn.style.display = 'block';
                await this.renderBudgetInfo();
            });
        }
    }

    async renderBudgetInfo() {
        const budget = await this.storage.getMonthlyBudget();
        const expenses = await this.storage.getExpenses();
        const currentMonth = Utils.getCurrentMonth();

        // Filter expenses for current month
        const monthlyExpenses = expenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth.month && date.getFullYear() === currentMonth.year;
        });

        const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
        const balance = budget - totalSpent;
        const percentage = budget > 0 ? (totalSpent / budget * 100) : 0;

        // Update Text
        document.getElementById('budget-income').textContent = Utils.formatCurrency(budget);
        document.getElementById('budget-spent').textContent = Utils.formatCurrency(totalSpent);
        document.getElementById('budget-balance').textContent = Utils.formatCurrency(balance);
        document.getElementById('budget-percentage').textContent = `${percentage.toFixed(1)}% used`;

        // Update Progress Bar
        const progressBar = document.getElementById('budget-progress-fill');
        const displayContainer = document.getElementById('budget-display-container');
        const messageEl = document.getElementById('budget-message');

        // Cap width at 100% for visual sanity, but keep color logic
        const visualWidth = Math.min(percentage, 100);
        progressBar.style.width = `${visualWidth}%`;

        // Reset classes
        displayContainer.classList.remove('budget-warning', 'budget-over-limit');
        messageEl.textContent = '';

        if (budget === 0) {
            messageEl.textContent = 'Set a budget to track your monthly spending limit.';
            progressBar.style.width = '0%';
        } else if (percentage >= 100) {
            displayContainer.classList.add('budget-over-limit');
            messageEl.textContent = `⚠️ You have exceeded your budget by ${Utils.formatCurrency(Math.abs(balance))}!`;
        } else if (percentage >= 85) {
            displayContainer.classList.add('budget-warning');
            messageEl.textContent = '⚠️ You are approaching your budget limit.';
        } else {
            messageEl.textContent = `You have ${Utils.formatCurrency(balance)} remaining for this month.`;
        }
    }

    // ===================================
    // Expenses View
    // ===================================
    async renderExpensesView() {
        await this.renderBudgetInfo();
        const container = document.getElementById('expenses-table-container');
        let expenses = await this.storage.getExpenses();

        // Apply filters
        const dateFilter = document.getElementById('expense-date-filter').value;
        const monthFilter = document.getElementById('expense-month-filter').value;
        const categoryFilter = document.getElementById('expense-category-filter').value;
        const categoryCustomFilter = document.getElementById('expense-category-custom-filter').value;
        const paymentFilter = document.getElementById('expense-payment-filter').value;
        const sortFilter = document.getElementById('expense-sort-filter').value;

        if (dateFilter) {
            expenses = expenses.filter(e => e.date === dateFilter);
        } else if (monthFilter) {
            expenses = expenses.filter(e => e.date.startsWith(monthFilter));
        }

        if (categoryFilter) {
            if (categoryFilter === 'Other') {
                const standardCategories = ['Food', 'Travel', 'Rent', 'Bills', 'Shopping', 'Entertainment', 'Medical'];
                if (categoryCustomFilter.trim()) {
                    expenses = expenses.filter(e => e.category.toLowerCase().includes(categoryCustomFilter.toLowerCase()));
                } else {
                    expenses = expenses.filter(e => !standardCategories.includes(e.category));
                }
            } else {
                expenses = expenses.filter(e => e.category === categoryFilter);
            }
        }
        if (paymentFilter) {
            expenses = expenses.filter(e => e.paymentMode === paymentFilter);
        }

        // Sort results
        expenses.sort((a, b) => {
            switch (sortFilter) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'amount-desc':
                    return b.amount - a.amount;
                case 'amount-asc':
                    return a.amount - b.amount;
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });

        if (expenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <p>No expenses found</p>
                </div>
            `;
            return;
        }

        const total = expenses.reduce((sum, e) => sum + e.amount, 0);

        container.innerHTML = `
            <div style="margin-bottom: 16px; padding: 16px; background: var(--bg-tertiary); border-radius: var(--radius-md);">
                <strong>Total: ${Utils.formatCurrency(total)}</strong> (${expenses.length} entries)
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Payment Mode</th>
                        <th>Notes</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${expenses.map(expense => `
                        <tr class="mobile-card-row">
                            <td data-label="Date">${Utils.formatDate(expense.date)}</td>
                            <td data-label="Category">
                                <span style="display: inline-flex; align-items: center; gap: 8px;">
                                    ${Utils.getCategoryIcon(expense.category)} ${expense.category}
                                </span>
                            </td>
                            <td data-label="Amount"><strong>${Utils.formatCurrency(expense.amount)}</strong></td>
                            <td data-label="Payment Mode">${expense.paymentMode}</td>
                            <td data-label="Notes">${expense.notes || '-'}</td>
                            <td data-label="Actions">
                                <div class="table-actions">
                                    <button class="btn-edit" onclick="app.editExpense('${expense._id || expense.id}')">Edit</button>
                                    <button class="btn-delete" onclick="app.deleteExpense('${expense._id || expense.id}')">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    async editExpense(id) {
        const expenses = await this.storage.getExpenses();
        const expense = expenses.find(e => e._id === id || e.id === id);
        if (expense) {
            this.openExpenseModal(expense);
        }
    }

    async deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            await this.storage.deleteExpense(id);
            this.refreshCurrentView();
        }
    }

    async exportExpenses() {
        const expenses = await this.storage.getExpenses();
        const data = expenses.map(e => ({
            Date: e.date,
            Category: e.category,
            Amount: e.amount,
            'Payment Mode': e.paymentMode,
            Notes: e.notes || ''
        }));
        Utils.exportToCSV(data, 'expenses');
    }

    // ===================================
    // Time Tracker View
    // ===================================
    async renderTimeTrackerView() {
        const container = document.getElementById('time-table-container');
        let entries = await this.storage.getTimeEntries();

        // Apply filters
        const dateFilter = document.getElementById('time-date-filter').value;
        const monthFilter = document.getElementById('time-month-filter').value;
        const activityFilter = document.getElementById('time-activity-filter').value;
        const activityCustomFilter = document.getElementById('time-activity-custom-filter').value;
        const sortFilter = document.getElementById('time-sort-filter').value;

        if (dateFilter) {
            entries = entries.filter(e => e.date === dateFilter);
        } else if (monthFilter) {
            entries = entries.filter(e => e.date.startsWith(monthFilter));
        }

        if (activityFilter) {
            if (activityFilter === 'Other') {
                const standardActivities = ['Office Work', 'Commute', 'Meetings', 'Breaks', 'Personal Time', 'Sleep', 'Learning'];
                if (activityCustomFilter.trim()) {
                    entries = entries.filter(e => e.activity.toLowerCase().includes(activityCustomFilter.toLowerCase()));
                } else {
                    entries = entries.filter(e => !standardActivities.includes(e.activity));
                }
            } else {
                entries = entries.filter(e => e.activity === activityFilter);
            }
        }

        // Sort results
        entries.sort((a, b) => {
            switch (sortFilter) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'duration-desc':
                    return Utils.toMinutes(b.hours, b.minutes) - Utils.toMinutes(a.hours, a.minutes);
                case 'duration-asc':
                    return Utils.toMinutes(a.hours, a.minutes) - Utils.toMinutes(b.hours, b.minutes);
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });

        // Update time summary card (quota based on a 24h day)
        const relevantDate = dateFilter || Utils.getTodayDate();
        const dailyEntries = (await this.storage.getTimeEntries()).filter(e => e.date === relevantDate);
        const dailyMinutes = dailyEntries.reduce((sum, e) => sum + Utils.toMinutes(e.hours, e.minutes), 0);

        const total = Utils.fromMinutes(dailyMinutes);
        const remaining = Utils.fromMinutes(Math.max(0, 1440 - dailyMinutes));
        const progressPercent = (Math.min(1440, dailyMinutes) / 1440 * 100).toFixed(1);

        const summaryLabel = dateFilter ? `Total Tracked (${Utils.formatDate(dateFilter)}):` : "Total Tracked (Today):";
        const remainingLabel = dateFilter ? "Hours Left in Day:" : "Hours Left Today:";

        document.getElementById('total-tracked-time').parentElement.querySelector('.label').textContent = summaryLabel;
        document.getElementById('total-tracked-time').textContent = Utils.formatDuration(total.hours, total.minutes);

        document.getElementById('remaining-time').parentElement.style.display = 'flex';
        document.getElementById('remaining-time').textContent = Utils.formatDuration(remaining.hours, remaining.minutes);
        document.getElementById('remaining-time').parentElement.querySelector('.label').textContent = remainingLabel;

        document.getElementById('time-progress-fill').style.width = `${progressPercent}%`;

        // If a Month Filter is active, maybe add a small note or total for the month elsewhere, 
        // but keep the card focused on "Day Quota" as requested by "Hours Left".
        if (monthFilter && !dateFilter) {
            const monthlyMinutes = entries.reduce((sum, e) => sum + Utils.toMinutes(e.hours, e.minutes), 0);
            const monthlyTotal = Utils.fromMinutes(monthlyMinutes);
            // Optionally update the label to mention month
            document.getElementById('total-tracked-time').parentElement.querySelector('.label').innerHTML =
                `Total Tracked Today <span style="font-size: 0.8em; opacity: 0.7;">(Filtered Month: ${Utils.formatDuration(monthlyTotal.hours, monthlyTotal.minutes)})</span>:`;
        }

        if (entries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <p>No time entries found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Activity</th>
                        <th>Time Range</th>
                        <th>Duration</th>
                        <th>Notes</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${entries.map(entry => `
                        <tr class="mobile-card-row">
                            <td data-label="Date">${Utils.formatDate(entry.date)}</td>
                            <td data-label="Activity">
                                <span style="display: inline-flex; align-items: center; gap: 8px;">
                                    ${Utils.getActivityIcon(entry.activity)} ${entry.activity}
                                </span>
                            </td>
                            <td data-label="Time Range">${Utils.to12Hour(entry.startTime)} - ${Utils.to12Hour(entry.endTime)}</td>
                            <td data-label="Duration"><strong>${Utils.formatDuration(entry.hours, entry.minutes)}</strong></td>
                            <td data-label="Notes">${entry.notes || '-'}</td>
                            <td data-label="Actions">
                                <div class="table-actions">
                                    <button class="btn-edit" onclick="app.editTimeEntry('${entry._id || entry.id}')">Edit</button>
                                    <button class="btn-delete" onclick="app.deleteTimeEntry('${entry._id || entry.id}')">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    async editTimeEntry(id) {
        const entries = await this.storage.getTimeEntries();
        const entry = entries.find(e => e._id === id || e.id === id);
        if (entry) {
            this.openTimeModal(entry);
        }
    }

    async deleteTimeEntry(id) {
        if (confirm('Are you sure you want to delete this time entry?')) {
            await this.storage.deleteTimeEntry(id);
            this.refreshCurrentView();
        }
    }

    async exportTimeEntries() {
        const entries = await this.storage.getTimeEntries();
        const data = entries.map(e => ({
            Date: e.date,
            Activity: e.activity,
            Hours: e.hours,
            Minutes: e.minutes,
            Notes: e.notes || ''
        }));
        Utils.exportToCSV(data, 'time_entries');
    }

    // ===================================
    // Monthly View
    // ===================================
    async renderMonthlyView() {
        document.getElementById('selected-month').textContent =
            Utils.formatMonth(this.selectedMonth.month, this.selectedMonth.year);

        await this.updateMonthlyStats();
        await this.renderMonthlyCharts();
    }

    async updateMonthlyStats() {
        const allExpenses = await this.storage.getExpenses();
        const expenses = allExpenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === this.selectedMonth.month &&
                date.getFullYear() === this.selectedMonth.year;
        });

        const allEntries = await this.storage.getTimeEntries();
        const timeEntries = allEntries.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === this.selectedMonth.month &&
                date.getFullYear() === this.selectedMonth.year;
        });

        // Total spending
        const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
        document.getElementById('monthly-total-spending').textContent = Utils.formatCurrency(totalSpending);

        // Daily average
        const daysInMonth = new Date(this.selectedMonth.year, this.selectedMonth.month + 1, 0).getDate();
        const dailyAvg = totalSpending / daysInMonth;
        document.getElementById('monthly-daily-avg').textContent = `Daily Average: ${Utils.formatCurrency(dailyAvg)}`;

        // Average working hours
        const workActivities = ['Office Work', 'Meetings', 'Learning'];
        const workMinutes = timeEntries
            .filter(e => workActivities.includes(e.activity))
            .reduce((sum, e) => sum + Utils.toMinutes(e.hours, e.minutes), 0);

        const personalMinutes = timeEntries
            .filter(e => !workActivities.includes(e.activity) && e.activity !== 'Sleep')
            .reduce((sum, e) => sum + Utils.toMinutes(e.hours, e.minutes), 0);

        const avgWorkHours = Utils.fromMinutes(Math.round(workMinutes / daysInMonth));
        document.getElementById('monthly-avg-work').textContent = Utils.formatDuration(avgWorkHours.hours, avgWorkHours.minutes);

        const workHours = Math.round(workMinutes / 60);
        const personalHours = Math.round(personalMinutes / 60);
        document.getElementById('monthly-work-ratio').textContent = `Work vs Personal: ${workHours}h : ${personalHours}h`;
    }

    async renderMonthlyCharts() {
        await this.renderExpenseCategoryChart();
        await this.renderTimeAllocationChart();
        await this.renderDailyExpenseChart();
    }

    async renderExpenseCategoryChart() {
        const canvas = document.getElementById('expense-category-chart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.expenseCategory) {
            this.charts.expenseCategory.destroy();
        }

        const allExpenses = await this.storage.getExpenses();
        const expenses = allExpenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === this.selectedMonth.month &&
                date.getFullYear() === this.selectedMonth.year;
        });

        // Group by category
        const categoryData = {};
        expenses.forEach(expense => {
            categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
        });

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        const colors = labels.map(cat => Utils.getCategoryColor(cat));

        this.charts.expenseCategory = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12,
                                family: 'Inter'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.label + ': ' + Utils.formatCurrency(context.parsed);
                            }
                        }
                    }
                }
            }
        });
    }

    async renderTimeAllocationChart() {
        const canvas = document.getElementById('time-allocation-chart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.timeAllocation) {
            this.charts.timeAllocation.destroy();
        }

        const allEntries = await this.storage.getTimeEntries();
        const entries = allEntries.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === this.selectedMonth.month &&
                date.getFullYear() === this.selectedMonth.year;
        });

        // Group by activity
        const activityData = {};
        entries.forEach(entry => {
            const minutes = Utils.toMinutes(entry.hours, entry.minutes);
            activityData[entry.activity] = (activityData[entry.activity] || 0) + minutes;
        });

        const labels = Object.keys(activityData);
        const data = Object.values(activityData).map(m => (m / 60).toFixed(1));

        this.charts.timeAllocation = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#667eea', '#f093fb', '#4facfe', '#43e97b',
                        '#fa709a', '#fee140', '#764ba2', '#a0aec0'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12,
                                family: 'Inter'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.label + ': ' + context.parsed + 'h';
                            }
                        }
                    }
                }
            }
        });
    }

    async renderDailyExpenseChart() {
        const canvas = document.getElementById('daily-expense-chart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.dailyExpense) {
            this.charts.dailyExpense.destroy();
        }

        const allExpenses = await this.storage.getExpenses();
        const expenses = allExpenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === this.selectedMonth.month &&
                date.getFullYear() === this.selectedMonth.year;
        });

        // Get all dates in month
        const dates = Utils.getDatesInMonth(this.selectedMonth.month, this.selectedMonth.year);

        // Group by date
        const dailyData = {};
        dates.forEach(date => {
            dailyData[date] = 0;
        });

        expenses.forEach(expense => {
            dailyData[expense.date] = (dailyData[expense.date] || 0) + expense.amount;
        });

        const labels = dates.map(d => new Date(d).getDate());
        const data = dates.map(d => dailyData[d]);

        this.charts.dailyExpense = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Expenses',
                    data: data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return Utils.formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '₹' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===================================
    // Analytics View
    // ===================================
    async renderAnalyticsView() {
        await this.renderTopCategories();
        await this.renderPaymentModeChart();
        await this.renderProductivityInsights();
        await this.renderWeeklyComparison();
    }

    async renderTopCategories() {
        const container = document.getElementById('top-categories-list');
        const expenses = await this.storage.getExpenses();

        // Group by category
        const categoryData = {};
        expenses.forEach(expense => {
            categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
        });

        const total = Object.values(categoryData).reduce((sum, amount) => sum + amount, 0);
        const sorted = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);

        container.innerHTML = sorted.map(([category, amount]) => {
            const percentage = (amount / total * 100).toFixed(1);
            return `
                <div class="category-item">
                    <div class="category-info">
                        <span style="font-size: 20px;">${Utils.getCategoryIcon(category)}</span>
                        <span>${category}</span>
                    </div>
                    <div class="category-bar">
                        <div class="category-bar-fill" style="width: ${percentage}%; background: ${Utils.getCategoryColor(category)};"></div>
                    </div>
                    <div class="category-amount">${Utils.formatCurrency(amount)}</div>
                </div>
            `;
        }).join('');
    }

    async renderPaymentModeChart() {
        const canvas = document.getElementById('payment-mode-chart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.paymentMode) {
            this.charts.paymentMode.destroy();
        }

        const expenses = await this.storage.getExpenses();

        // Group by payment mode
        const paymentData = {};
        expenses.forEach(expense => {
            paymentData[expense.paymentMode] = (paymentData[expense.paymentMode] || 0) + expense.amount;
        });

        const labels = Object.keys(paymentData);
        const data = Object.values(paymentData);

        this.charts.paymentMode = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Amount',
                    data: data,
                    backgroundColor: ['#667eea', '#f093fb', '#4facfe', '#43e97b'],
                    borderWidth: 0,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return Utils.formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '₹' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    async renderProductivityInsights() {
        const container = document.getElementById('productivity-insights');
        const entries = await this.storage.getTimeEntries();

        const workActivities = ['Office Work', 'Meetings', 'Learning'];
        const workMinutes = entries
            .filter(e => workActivities.includes(e.activity))
            .reduce((sum, e) => sum + Utils.toMinutes(e.hours, e.minutes), 0);

        const totalMinutes = entries.reduce((sum, e) => sum + Utils.toMinutes(e.hours, e.minutes), 0);
        const productivityPercent = totalMinutes > 0 ? (workMinutes / totalMinutes * 100).toFixed(1) : 0;

        const workHours = Utils.fromMinutes(workMinutes);
        const avgDailyWork = Utils.fromMinutes(Math.round(workMinutes / 30)); // Assuming 30 days

        container.innerHTML = `
            <div class="category-item">
                <div class="category-info">
                    <span>💼</span>
                    <span>Total Work Time</span>
                </div>
                <div class="category-amount">${Utils.formatDuration(workHours.hours, workHours.minutes)}</div>
            </div>
            <div class="category-item">
                <div class="category-info">
                    <span>📊</span>
                    <span>Productivity Rate</span>
                </div>
                <div class="category-amount">${productivityPercent}%</div>
            </div>
            <div class="category-item">
                <div class="category-info">
                    <span>📅</span>
                    <span>Avg Daily Work</span>
                </div>
                <div class="category-amount">${Utils.formatDuration(avgDailyWork.hours, avgDailyWork.minutes)}</div>
            </div>
        `;
    }

    async renderWeeklyComparison() {
        const canvas = document.getElementById('weekly-comparison-chart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.weeklyComparison) {
            this.charts.weeklyComparison.destroy();
        }

        const expenses = await this.storage.getExpenses();

        // Get last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }

        const dailyExpenses = last7Days.map(date => {
            return expenses
                .filter(e => e.date === date)
                .reduce((sum, e) => sum + e.amount, 0);
        });

        const labels = last7Days.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-IN', { weekday: 'short' });
        });

        this.charts.weeklyComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Expenses',
                    data: dailyExpenses,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderWidth: 0,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return Utils.formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '₹' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===================================
    // Utility Methods
    // ===================================
    updateCurrentDate() {
        const dateElement = document.getElementById('current-date');
        const today = new Date();
        dateElement.textContent = today.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    refreshCurrentView() {
        this.switchView(this.currentView);
    }
}

// ===================================
// Initialize Application
// ===================================
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ProTrackApp();
});

