const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const authRoutes = require('./routes/auth');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your secret key',
  saveUninitialized: false,
  resave: false,
}));
// Flash messages middleware
app.use(flash());

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());



// Middleware for flash messages and session message handling
app.use((req, res, next) => {
  res.locals.message = req.flash('message'); // Use flash for messages
  next();
});

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/', require('./routes/router')); // Your routes

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render('404', { title: '404 Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: '500 Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port http://localhost:${PORT}`);
});
