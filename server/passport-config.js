const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Admin = require('./models/Admin');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      console.log('Trying to find user:', email);
      const user = await Admin.findOne({ email });
      if (!user) {
        console.log('No user found with this email');
        return done(null, false, { message: 'No user found with this email' });
      }
      console.log('User found:', user);

      console.log('Comparing password:', password);
      console.log('Stored hashed password:', user.password);

      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        console.log('Incorrect password');
        return done(null, false, { message: 'Incorrect password' });
      }

      console.log('User authenticated successfully');
      // Successful authentication
      return done(null, user);
    } catch (err) {
      console.error('Error during authentication:', err);
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Admin.findById(id);
    done(null, user);
  } catch (err) {
    console.error('Error during deserialization:', err);
    done(err);
  }
});
