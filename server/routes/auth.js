const express = require('express');
const passport = require('passport');
const Admin = require('../models/Admin'); // Adjust the path as needed
const router = express.Router();

// Registration route
router.post('/register', async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!password) {
        req.flash('message', { type: 'danger', message: 'Password is required' });
        return res.redirect('/register'); // Redirect to the registration page
    }

    try {
        // Create a new Admin document
        const newUser = new Admin({
            name,
            email,
            phone,
            password, // Password will be hashed by pre-save hook in schema
        });

        // Save the new Admin document to the database
        await newUser.save();
        req.flash('message', { type: 'success', message: 'User registered successfully' });
        res.redirect('/login'); // Redirect to the login page
    } catch (err) {
        console.error('Error registering user:', err);
        req.flash('message', { type: 'danger', message: 'Server error' });
        res.redirect('/register'); // Redirect to the registration page
    }
});

// Login route
router.post('/login', (req, res, next) => {
    console.log('Login attempt:', req.body);

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Passport authenticate error:', err);
            return next(err);
        }
        if (!user) {
            console.log('No user found or incorrect password:', info.message);
            req.flash('message', { type: 'danger', message: info.message || 'Invalid credentials' });
            return res.redirect('/login'); // Redirect to the login page
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                return next(err);
            }
            
            console.log('User logged in:', user);

            if (req.body.role === 'admin' && user.isAdmin) {
                console.log('Redirecting to admin view');
                return res.redirect('/admin-dashboard'); // Adjust the path if necessary
            } else if (req.body.role === 'user' && !user.isAdmin) {
                console.log('Redirecting to user view');
                return res.redirect('/user-view'); // Adjust the path if necessary
            } else {
                console.log('Invalid role or credentials');
                req.flash('message', { type: 'danger', message: 'Invalid role or credentials' });
                return res.redirect('/login'); // Redirect to the login page
            }
        });
    })(req, res, next);
});

module.exports = router;
