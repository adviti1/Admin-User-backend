const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log('User not authenticated');
  res.redirect('/login_selection');
};

const isAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) {
      return next();
    } else {
      console.log('User is authenticated but not an admin');
      res.redirect('/');
    }
  } else {
    console.log('User not authenticated');
    res.redirect('/login_selection');
  }
};

module.exports = { isAuthenticated, isAdmin };
