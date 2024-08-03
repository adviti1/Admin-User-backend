const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false } // Distinguishes between admin and regular users
});

// Hash the password before saving
AdminSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) { // Hash if password is new or modified
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Method to compare passwords
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Compare the candidate password with the stored hashed password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    console.error('Error comparing passwords:', err); // Debugging line
    throw new Error('Error comparing passwords');
  }
};

module.exports = mongoose.model('Admin', AdminSchema);
  