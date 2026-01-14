require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 5000;

// Determine BASE_URL dynamically (Local vs Production)
const IS_LOCAL = !process.env.BASE_URL || process.env.BASE_URL.includes('localhost');
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

console.log(`🌍 Environment: ${IS_LOCAL ? 'LOCAL' : 'PRODUCTION'}`);
console.log(`🔗 Base URL: ${BASE_URL}`);

// Middleware
app.use(cors({
	origin: [BASE_URL],
	credentials: true
}));
app.use(bodyParser.json());

// Session & Passport Initialization
app.use(session({
	secret: process.env.SESSION_SECRET || 'protrack_secret',
	resave: false,
	saveUninitialized: false, // Don't create session until something stored
	cookie: {
		secure: !IS_LOCAL, // Secure cookies only on production (HTTPS)
		httpOnly: true,
		sameSite: IS_LOCAL ? 'lax' : 'none', // 'none' for cross-site cookie on prod
		maxAge: 24 * 60 * 60 * 1000 // 24 hours
	}
}));
app.use(passport.initialize());
app.use(passport.session());

// Request Logger
app.use((req, res, next) => {
	const authStatus = typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : 'N/A';
	console.log(`-> ${req.method} ${req.url} | Session: ${req.sessionID} | Auth: ${authStatus}`);
	next();
});

// Serve static files AFTER passport/session middleware
app.use(express.static(__dirname));


// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/protrack';

mongoose.connect(MONGODB_URI, {
	serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB is down
	connectTimeoutMS: 10000,
})
	.then(() => console.log('✅ Connected to MongoDB'))
	.catch(err => {
		console.error('❌ MongoDB Connection Error:', err.message);
		console.log('👉 Make sure Windows MongoDB service is STARTED (check services.msc).');
	});

// ==========================================
// Database Schemas
// ==========================================

// User Schema
const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String }, // For local accounts
	name: String,
	picture: String,
	googleId: String,
	createdAt: { type: Date, default: Date.now }
});

// Expense Schema
const expenseSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	date: { type: String, required: true }, // YYYY-MM-DD
	category: { type: String, required: true },
	amount: { type: Number, required: true },
	paymentMode: String,
	notes: String
});

// Time Entry Schema
const timeEntrySchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	date: { type: String, required: true }, // YYYY-MM-DD
	activity: { type: String, required: true },
	startTime: String,
	endTime: String,
	hours: Number,
	minutes: Number,
	duration: String, // stored as "2h 30m" string for simplicity matching frontend
	notes: String
});

// Budget Schema
const budgetSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
	amount: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);
const Expense = mongoose.model('Expense', expenseSchema);
const TimeEntry = mongoose.model('TimeEntry', timeEntrySchema);
const Budget = mongoose.model('Budget', budgetSchema);

// Passport Configuration
passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id);
		done(null, user);
	} catch (err) {
		done(err, null);
	}
});
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID?.trim(),
			clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim(),
			callbackURL: `${BASE_URL}/api/auth/google/callback`,
			proxy: true
		},
		async (accessToken, refreshToken, profile, done) => {
			console.log('Google Auth profile received:', profile.id);
			try {
				// Find user by Google ID or Email
				let user = await User.findOne({ googleId: profile.id });

				if (!user) {
					// Fallback: check by email if Google ID not found
					user = await User.findOne({ email: profile.emails[0].value });

					if (user) {
						// Link existing account
						user.googleId = profile.id;
						if (!user.picture) user.picture = profile.photos[0]?.value;
						await user.save();
					} else {
						// Create new account
						user = await User.create({
							googleId: profile.id,
							email: profile.emails[0].value,
							name: profile.displayName,
							picture: profile.photos[0]?.value
						});
					}
				}

				return done(null, user);
			} catch (err) {
				return done(err, null);
			}
		}
	)
);


// ==========================================
// API Routes
// ==========================================

// --- Auth Routes ---

// Google Auth Trigger
app.get('/api/auth/google', passport.authenticate('google', {
	scope: ['profile', 'email']
}));

// Google Auth Callback
app.get('/api/auth/google/callback',
	(req, res, next) => {
		passport.authenticate('google', (err, user, info) => {
			if (err) {
				console.error('Passport Auth Error:', err);
				if (err.message.includes('buffering timed out')) {
					return res.status(500).send('Database Error: Connection to MongoDB timed out. Please ensure your MongoDB service is running.');
				}
				return res.status(500).send(`Auth Error: ${err.message}. If this is a Client Secret issue, please check your .env file.`);
			}
			if (!user) {
				return res.status(401).send('Auth Failed: No user found. Check your Google Console settings.');
			}
			req.logIn(user, (err) => {
				if (err) return next(err);
				return res.redirect(BASE_URL);
			});
		})(req, res, next);
	}
);
// Get Current User Session
app.get('/api/auth/user', (req, res) => {
	if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
		res.json(req.user);
	} else {
		res.status(401).json({ error: 'Not authenticated' });
	}
});


// Logout
app.get('/api/auth/logout', (req, res, next) => {
	if (typeof req.logout === 'function') {
		req.logout((err) => {
			if (err) return next(err);
			res.redirect(BASE_URL);
		});
	} else {
		res.redirect(BASE_URL);
	}
});

app.post('/api/auth/login', async (req, res, next) => {
	try {
		const { email, name, picture, googleId, password } = req.body;

		// Find or Create User
		let user = await User.findOne({ email });

		if (!user) {
			user = new User({ email, name, picture, googleId, password });
			await user.save();
			console.log('🆕 New User Created:', email);
		} else {
			if (password && !user.password) {
				user.password = password;
				await user.save();
			}
			console.log('👋 User Logged In:', email);
		}

		// ESTABLISH SESSION: This was missing!
		req.logIn(user, (err) => {
			if (err) return next(err);
			return res.json(user);
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Reset Password Route
app.post('/api/auth/reset-password', async (req, res) => {
	try {
		const { email, newPassword } = req.body;
		if (!email || !newPassword) {
			return res.status(400).json({ error: 'Email and new password are required' });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		user.password = newPassword;
		await user.save();
		console.log('🔐 Password reset for:', email);
		res.json({ message: 'Password updated successfully' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// --- Expense Routes ---

// Get all expenses for a user
app.get('/api/expenses/:userId', async (req, res) => {
	try {
		const expenses = await Expense.find({ userId: req.params.userId }).sort({ date: -1 });
		res.json(expenses);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Add new expense
app.post('/api/expenses', async (req, res) => {
	try {
		const newExpense = new Expense(req.body);
		const savedExpense = await newExpense.save();
		res.json(savedExpense);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Update expense
app.put('/api/expenses/:id', async (req, res) => {
	try {
		const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
		res.json(updatedExpense);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
	try {
		await Expense.findByIdAndDelete(req.params.id);
		res.json({ message: 'Expense deleted' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// --- Time Entry Routes ---

// Get all time entries for a user
app.get('/api/time/:userId', async (req, res) => {
	try {
		const entries = await TimeEntry.find({ userId: req.params.userId }).sort({ date: -1 });
		res.json(entries);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Add time entry
app.post('/api/time', async (req, res) => {
	try {
		const newEntry = new TimeEntry(req.body);
		const savedEntry = await newEntry.save();
		res.json(savedEntry);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Update time entry
app.put('/api/time/:id', async (req, res) => {
	try {
		const updatedEntry = await TimeEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
		res.json(updatedEntry);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Delete time entry
app.delete('/api/time/:id', async (req, res) => {
	try {
		await TimeEntry.findByIdAndDelete(req.params.id);
		res.json({ message: 'Time entry deleted' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// --- Budget Routes ---

app.get('/api/budget/:userId', async (req, res) => {
	try {
		const budget = await Budget.findOne({ userId: req.params.userId });
		res.json({ amount: budget ? budget.amount : 0 });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/api/budget', async (req, res) => {
	try {
		const { userId, amount } = req.body;
		const budget = await Budget.findOneAndUpdate(
			{ userId },
			{ amount },
			{ new: true, upsert: true } // Create if not exists
		);
		res.json(budget);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Start Server
app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
});
