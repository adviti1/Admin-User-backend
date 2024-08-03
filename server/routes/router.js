const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Initialize Passport
passport.use(new LocalStrategy({
    usernameField: 'email'
  }, async (email, password, done) => {
    try {
      const user = await Admin.findOne({ email });
      if (!user) return done(null, false, { message: 'No user found' });
      
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password' });
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
  
passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser(async (id, done) => {
    try {
      const user = await Admin.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
});

router.get('/login-selection', (req, res) => {
    res.render('login_selection', { title: 'Login Selection' });
});

// Route to render login page
router.get('/login', (req, res) => {
    const role = req.query.role;
    res.render('login', { title: 'Login', role: role });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Authentication error:', err);
            return next(err);
        }
        if (!user) {
            console.log('User not found or incorrect credentials');
            return res.redirect('/login?role=' + req.body.role);
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                return next(err);
            }
            console.log('User logged in:', user);
            console.log('Requested role:', req.body.role);
            console.log('User is admin:', user.isAdmin);

            if (req.body.role === 'admin' && user.isAdmin) {
                return res.redirect('/admin-dashboard'); // Ensure this route is correct
            } else if (req.body.role === 'user' && !user.isAdmin) {
                return res.redirect('/user-view'); // Ensure this route is correct
            } else {
                req.logout((err) => {
                    if (err) {
                        console.error('Logout error:', err);
                        return next(err);
                    }
                    req.session.message = {
                        type: 'danger',
                        message: 'Unauthorized access'
                    };
                    return res.redirect('/login-selection');
                });
            }
        });
    })(req, res, next);
});


router.get('/admin-dashboard', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const users = await Admin.find();
        res.render('index', {
            users,
            user: req.user, // Pass the current logged-in user
            message: req.session.message // Include message if needed
        });

        // Clear the message after sending response
        req.session.message = null;
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to render registration page
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

// Route to handle registration
router.post('/register', async (req, res) => {
    try {
      const { name, email, phone, password } = req.body;
  
      // Create a new Admin document
      const newAdmin = new Admin({
        name,
        email,
        phone,
        password // This will be hashed in the pre-save hook
      });
  
      // Save the new Admin document to the database
      await newAdmin.save();
  
      res.status(201).json({ message: 'Admin registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error registering admin', error: err.message });
    }
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return next(err);
        }
        req.session.message = {
            type: 'success',
            message: 'Successfully logged out'
        };
        res.redirect('/login-selection');
    });
});

// Route to add a new user
router.post('/add', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const user = new Admin({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone
        });

        await user.save();

        req.session.message = {
            type: 'success',
            message: 'User added successfully'
        };
        res.redirect('/');
    } catch (err) {
        req.session.message = {
            type: 'danger',
            message: err.message
        };
        res.redirect('/add');
    }
});

router.get('/', (req, res) => {
    res.redirect('/login-selection');
});

// Route to render user view for regular users
router.get('/user-view', isAuthenticated, async (req, res) => {
    try {
        // Fetch users from the Admin model
        const users = await Admin.find();

        // Pass the current logged-in user and all users to the template
        res.render('user_view', { 
            users,
            user: req.user, // Make sure this is included
            message: req.session.message // Include message if needed
        });

        // Clear the message after sending response
        req.session.message = null;
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to render the add user page
router.get("/add", isAuthenticated, isAdmin, (req, res) => {
    res.render("add_user", { title: "Add Users" });
});

// Route to render the edit user page
router.get('/edit/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        let id = req.params.id.trim();

        console.log('Requested ID:', JSON.stringify(id));
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.session.message = {
                type: 'warning',
                message: 'Invalid User ID'
            };
            return res.redirect('/');
        }

        let user = await Admin.findById(id).exec();
        
        if (user == null) {
            req.session.message = {
                type: 'warning',
                message: 'User not found'
            };
            res.redirect('/');
        } else {
            res.render('edit_users', {
                title: 'Edit User',
                user: user,
            });
        }
    } catch (err) {
        req.session.message = {
            type: 'danger',
            message: err.message
        };
        res.redirect('/');
    }
});

// Route to update user information
router.post('/update/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        let id = req.params.id;

        console.log('Received ID:', id);
        console.log('Received data:', req.body);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.session.message = {
                type: 'warning',
                message: 'Invalid User ID'
            };
            return res.redirect('/edit/' + id);
        }

        const updatedUser = await Admin.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone
        }, { new: true });

        console.log('Updated user:', updatedUser);

        if (!updatedUser) {
            req.session.message = {
                type: 'warning',
                message: 'User not found'
            };
            return res.redirect('/edit/' + id);
        }

        req.session.message = {
            type: 'success',
            message: 'User updated successfully!'
        };
        res.redirect('/');
    } catch (err) {
        req.session.message = {
            type: 'danger',
            message: err.message
        };
        res.redirect('/edit/' + req.params.id);
    }
});

// Route to delete a user
router.get('/delete/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        let id = req.params.id.trim();

        console.log('Requested ID for deletion:', id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.session.message = {
                type: 'warning',
                message: 'Invalid User ID'
            };
            return res.redirect('/');
        }

        const result = await Admin.findByIdAndDelete(id);

        if (!result) {
            req.session.message = {
                type: 'warning',
                message: 'User not found'
            };
            return res.redirect('/');
        }

        req.session.message = {
            type: 'info',
            message: 'User deleted successfully!'
        };
        res.redirect('/');
    } catch (err) {
        req.session.message = {
            type: 'danger',
            message: err.message
        };
        res.redirect('/');
    }
});

module.exports = router;
