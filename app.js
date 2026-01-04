// ===================================
// Data Storage Manager
// ===================================
class StorageManager {
    constructor() {
        this.EXPENSES_KEY = 'protrack_expenses';
        this.TIME_ENTRIES_KEY = 'protrack_time_entries';
        this.THEME_KEY = 'protrack_theme';
        this.BUDGET_KEY = 'protrack_monthly_budget';
    }

    // Get all expenses
    getExpenses() {
        const data = localStorage.getItem(this.EXPENSES_KEY);
        return data ? JSON.parse(data) : [];
    }

    // Save expenses
    saveExpenses(expenses) {
        localStorage.setItem(this.EXPENSES_KEY, JSON.stringify(expenses));
    }

    // Add expense
    addExpense(expense) {
        const expenses = this.getExpenses();
        expense.id = Date.now().toString();
        expenses.push(expense);
        this.saveExpenses(expenses);
        return expense;
    }

    // Update expense
    updateExpense(id, updatedExpense) {
        const expenses = this.getExpenses();
        const index = expenses.findIndex(e => e.id === id);
        if (index !== -1) {
            expenses[index] = { ...expenses[index], ...updatedExpense };
            this.saveExpenses(expenses);
            return expenses[index];
        }
        return null;
    }

    // Delete expense
    deleteExpense(id) {
        const expenses = this.getExpenses();
        const filtered = expenses.filter(e => e.id !== id);
        this.saveExpenses(filtered);
    }

    // Get all time entries
    getTimeEntries() {
        const data = localStorage.getItem(this.TIME_ENTRIES_KEY);
        return data ? JSON.parse(data) : [];
    }

    // Save time entries
    saveTimeEntries(entries) {
        localStorage.setItem(this.TIME_ENTRIES_KEY, JSON.stringify(entries));
    }

    // Add time entry
    addTimeEntry(entry) {
        const entries = this.getTimeEntries();
        entry.id = Date.now().toString();
        entries.push(entry);
        this.saveTimeEntries(entries);
        return entry;
    }

    // Update time entry
    updateTimeEntry(id, updatedEntry) {
        const entries = this.getTimeEntries();
        const index = entries.findIndex(e => e.id === id);
        if (index !== -1) {
            entries[index] = { ...entries[index], ...updatedEntry };
            this.saveTimeEntries(entries);
            return entries[index];
        }
        return null;
    }

    // Delete time entry
    deleteTimeEntry(id) {
        const entries = this.getTimeEntries();
        const filtered = entries.filter(e => e.id !== id);
        this.saveTimeEntries(filtered);
    }

    // Theme management
    getTheme() {
        return localStorage.getItem(this.THEME_KEY) || 'light';
    }

    setTheme(theme) {
        localStorage.setItem(this.THEME_KEY, theme);
    }

    // Budget management
    getMonthlyBudget() {
        const data = localStorage.getItem(this.BUDGET_KEY);
        return data ? parseFloat(data) : 0;
    }

    saveMonthlyBudget(amount) {
        localStorage.setItem(this.BUDGET_KEY, amount);
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

    // Export to CSV
    // Export to CSV
    exportToCSV(data, filename) {
        if (data.length === 0) {
            alert('No data to export');
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
// Main Application
// ===================================
class ProTrackApp {
    constructor() {
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

    switchView(view) {
        // Hide all views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

        // Show selected view
        document.getElementById(`${view}-view`).classList.add('active');
        this.currentView = view;

        // Render view content
        switch (view) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'expenses':
                this.renderExpensesView();
                break;
            case 'time-tracker':
                this.renderTimeTrackerView();
                break;
            case 'monthly':
                this.renderMonthlyView();
                break;
            case 'analytics':
                this.renderAnalyticsView();
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

            document.getElementById('time-start').value = entry.startTime || '';
            document.getElementById('time-end').value = entry.endTime || '';
            document.getElementById('time-notes').value = entry.notes || '';
            form.dataset.editId = entry.id;
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

    handleExpenseSubmit(form) {
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
            this.storage.updateExpense(form.dataset.editId, expense);
        } else {
            // Add new expense
            this.storage.addExpense(expense);
        }

        this.closeModal(document.getElementById('expense-modal'));
        this.refreshCurrentView();
    }

    handleTimeSubmit(form) {
        const startTime = document.getElementById('time-start').value;
        const endTime = document.getElementById('time-end').value;

        if (!startTime || !endTime) {
            alert('Please select both start and end times');
            return;
        }

        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);

        if (end <= start) {
            alert('End time must be after start time');
            return;
        }

        const diffMinutes = Math.round((end - start) / 60000);
        const { hours, minutes } = Utils.fromMinutes(diffMinutes);

        let activity = document.getElementById('time-activity').value;
        if (activity === 'Other') {
            activity = document.getElementById('time-activity-custom').value;
        }

        const entry = {
            date: document.getElementById('time-date').value,
            activity: activity,
            startTime: startTime,
            endTime: endTime,
            hours: hours,
            minutes: minutes,
            notes: document.getElementById('time-notes').value
        };

        // Validate total time for the day
        const totalMinutes = this.getTotalMinutesForDate(entry.date, form.dataset.editId);
        const newMinutes = Utils.toMinutes(entry.hours, entry.minutes);

        if (totalMinutes + newMinutes > 1440) { // 24 hours = 1440 minutes
            alert('Total time for this day exceeds 24 hours!');
            return;
        }

        if (form.dataset.editId) {
            // Update existing entry
            this.storage.updateTimeEntry(form.dataset.editId, entry);
        } else {
            // Add new entry
            this.storage.addTimeEntry(entry);
        }

        this.closeModal(document.getElementById('time-modal'));
        this.refreshCurrentView();
    }

    validateTimeEntry() {
        const date = document.getElementById('time-date').value;
        const startTime = document.getElementById('time-start').value;
        const endTime = document.getElementById('time-end').value;
        const form = document.getElementById('time-form');

        let newMinutes = 0;
        if (startTime && endTime) {
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${endTime}`);
            if (end > start) {
                newMinutes = Math.round((end - start) / 60000);
            }
        }

        const totalMinutes = this.getTotalMinutesForDate(date, form.dataset.editId);
        const warning = document.getElementById('time-validation-warning');

        if (totalMinutes + newMinutes > 1440) {
            warning.style.display = 'block';
        } else {
            warning.style.display = 'none';
        }
    }

    getTotalMinutesForDate(date, excludeId = null) {
        const entries = this.storage.getTimeEntries()
            .filter(e => e.date === date && e.id !== excludeId);

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
        const expenseCategoryFilter = document.getElementById('expense-category-filter');
        const expensePaymentFilter = document.getElementById('expense-payment-filter');

        [expenseDateFilter, expenseCategoryFilter, expensePaymentFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.renderExpensesView());
            }
        });

        // Time filters
        const timeDateFilter = document.getElementById('time-date-filter');
        const timeActivityFilter = document.getElementById('time-activity-filter');

        [timeDateFilter, timeActivityFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.renderTimeTrackerView());
            }
        });

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
    renderDashboard() {
        this.updateDashboardStats();
        this.renderTodayExpenses();
        this.renderTodayTimeChart();
    }

    updateDashboardStats() {
        const expenses = this.storage.getExpenses();
        const timeEntries = this.storage.getTimeEntries();
        const today = Utils.getTodayDate();

        // Today's expenses
        const todayExpenses = expenses.filter(e => e.date === today);
        const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
        document.getElementById('today-expense').textContent = Utils.formatCurrency(todayTotal);

        // Yesterday's expenses for comparison
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];
        const yesterdayExpenses = expenses.filter(e => e.date === yesterdayDate);
        const yesterdayTotal = yesterdayExpenses.reduce((sum, e) => sum + e.amount, 0);

        const changePercent = yesterdayTotal > 0 ? ((todayTotal - yesterdayTotal) / yesterdayTotal * 100).toFixed(1) : 0;
        const changeElement = document.getElementById('expense-change');
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

        // Monthly expenses
        const currentMonth = Utils.getCurrentMonth();
        const monthlyExpenses = expenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth.month && date.getFullYear() === currentMonth.year;
        });
        const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
        document.getElementById('month-expense').textContent = Utils.formatCurrency(monthlyTotal);

        // Today's hours
        const todayTime = timeEntries.filter(e => e.date === today);
        const todayMinutes = todayTime.reduce((sum, e) => sum + Utils.toMinutes(e.hours, e.minutes), 0);
        const todayHours = Utils.fromMinutes(todayMinutes);
        document.getElementById('today-hours').textContent = Utils.formatDuration(todayHours.hours, todayHours.minutes);

        const remainingMinutes = 1440 - todayMinutes;
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

    renderTodayExpenses() {
        const container = document.getElementById('today-expenses-list');
        const expenses = this.storage.getExpenses()
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

    renderTodayTimeChart() {
        const container = document.getElementById('today-time-chart');
        const entries = this.storage.getTimeEntries()
            .filter(e => Utils.isToday(e.date));

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
            editBtn.addEventListener('click', () => {
                const currentBudget = this.storage.getMonthlyBudget();
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
            saveBtn.addEventListener('click', () => {
                const amount = parseFloat(budgetInput.value);
                if (isNaN(amount) || amount < 0) {
                    alert('Please enter a valid amount');
                    return;
                }
                this.storage.saveMonthlyBudget(amount);
                inputContainer.style.display = 'none';
                // editBtn.style.display = 'block';
                this.renderBudgetInfo();
            });
        }
    }

    renderBudgetInfo() {
        const budget = this.storage.getMonthlyBudget();
        const expenses = this.storage.getExpenses();
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
    renderExpensesView() {
        this.renderBudgetInfo();
        const container = document.getElementById('expenses-table-container');
        let expenses = this.storage.getExpenses();

        // Apply filters
        const dateFilter = document.getElementById('expense-date-filter').value;
        const categoryFilter = document.getElementById('expense-category-filter').value;
        const paymentFilter = document.getElementById('expense-payment-filter').value;

        if (dateFilter) {
            expenses = expenses.filter(e => e.date === dateFilter);
        }
        if (categoryFilter) {
            expenses = expenses.filter(e => e.category === categoryFilter);
        }
        if (paymentFilter) {
            expenses = expenses.filter(e => e.paymentMode === paymentFilter);
        }

        // Sort by date (newest first)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

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
                                    <button class="btn-edit" onclick="app.editExpense('${expense.id}')">Edit</button>
                                    <button class="btn-delete" onclick="app.deleteExpense('${expense.id}')">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    editExpense(id) {
        const expense = this.storage.getExpenses().find(e => e.id === id);
        if (expense) {
            this.openExpenseModal(expense);
        }
    }

    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.storage.deleteExpense(id);
            this.refreshCurrentView();
        }
    }

    exportExpenses() {
        const expenses = this.storage.getExpenses();
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
    renderTimeTrackerView() {
        const container = document.getElementById('time-table-container');
        let entries = this.storage.getTimeEntries();

        // Apply filters
        const dateFilter = document.getElementById('time-date-filter').value;
        const activityFilter = document.getElementById('time-activity-filter').value;

        if (dateFilter) {
            entries = entries.filter(e => e.date === dateFilter);
        }
        if (activityFilter) {
            entries = entries.filter(e => e.activity === activityFilter);
        }

        // Sort by date (newest first)
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Update time summary
        const selectedDate = dateFilter || Utils.getTodayDate();
        const dayEntries = this.storage.getTimeEntries().filter(e => e.date === selectedDate);
        const totalMinutes = dayEntries.reduce((sum, e) => sum + Utils.toMinutes(e.hours, e.minutes), 0);
        const total = Utils.fromMinutes(totalMinutes);
        const remaining = Utils.fromMinutes(1440 - totalMinutes);

        document.getElementById('total-tracked-time').textContent = Utils.formatDuration(total.hours, total.minutes);
        document.getElementById('remaining-time').textContent = Utils.formatDuration(remaining.hours, remaining.minutes);

        const progressPercent = (totalMinutes / 1440 * 100).toFixed(1);
        document.getElementById('time-progress-fill').style.width = `${progressPercent}%`;

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
                            <td data-label="Duration"><strong>${Utils.formatDuration(entry.hours, entry.minutes)}</strong></td>
                            <td data-label="Notes">${entry.notes || '-'}</td>
                            <td data-label="Actions">
                                <div class="table-actions">
                                    <button class="btn-edit" onclick="app.editTimeEntry('${entry.id}')">Edit</button>
                                    <button class="btn-delete" onclick="app.deleteTimeEntry('${entry.id}')">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    editTimeEntry(id) {
        const entry = this.storage.getTimeEntries().find(e => e.id === id);
        if (entry) {
            this.openTimeModal(entry);
        }
    }

    deleteTimeEntry(id) {
        if (confirm('Are you sure you want to delete this time entry?')) {
            this.storage.deleteTimeEntry(id);
            this.refreshCurrentView();
        }
    }

    exportTimeEntries() {
        const entries = this.storage.getTimeEntries();
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
    renderMonthlyView() {
        document.getElementById('selected-month').textContent =
            Utils.formatMonth(this.selectedMonth.month, this.selectedMonth.year);

        this.updateMonthlyStats();
        this.renderMonthlyCharts();
    }

    updateMonthlyStats() {
        const expenses = this.storage.getExpenses().filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === this.selectedMonth.month &&
                date.getFullYear() === this.selectedMonth.year;
        });

        const timeEntries = this.storage.getTimeEntries().filter(e => {
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

    renderMonthlyCharts() {
        this.renderExpenseCategoryChart();
        this.renderTimeAllocationChart();
        this.renderDailyExpenseChart();
    }

    renderExpenseCategoryChart() {
        const canvas = document.getElementById('expense-category-chart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.expenseCategory) {
            this.charts.expenseCategory.destroy();
        }

        const expenses = this.storage.getExpenses().filter(e => {
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

    renderTimeAllocationChart() {
        const canvas = document.getElementById('time-allocation-chart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.timeAllocation) {
            this.charts.timeAllocation.destroy();
        }

        const entries = this.storage.getTimeEntries().filter(e => {
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

    renderDailyExpenseChart() {
        const canvas = document.getElementById('daily-expense-chart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.dailyExpense) {
            this.charts.dailyExpense.destroy();
        }

        const expenses = this.storage.getExpenses().filter(e => {
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
    renderAnalyticsView() {
        this.renderTopCategories();
        this.renderPaymentModeChart();
        this.renderProductivityInsights();
        this.renderWeeklyComparison();
    }

    renderTopCategories() {
        const container = document.getElementById('top-categories-list');
        const expenses = this.storage.getExpenses();

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

    renderPaymentModeChart() {
        const canvas = document.getElementById('payment-mode-chart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.paymentMode) {
            this.charts.paymentMode.destroy();
        }

        const expenses = this.storage.getExpenses();

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

    renderProductivityInsights() {
        const container = document.getElementById('productivity-insights');
        const entries = this.storage.getTimeEntries();

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

    renderWeeklyComparison() {
        const canvas = document.getElementById('weekly-comparison-chart');
        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.weeklyComparison) {
            this.charts.weeklyComparison.destroy();
        }

        const expenses = this.storage.getExpenses();

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
