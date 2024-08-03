const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false } // Distinguishes between admin and regular users
});

// Method to hash a plain password
AdminSchema.statics.hashPassword = async function(password) {
  try {
    console.log('Hashing password:', password); // Debugging line
    return await bcrypt.hash(password, 10);
  } catch (err) {
    console.error('Error hashing password:', err); // Debugging line
    throw new Error('Error hashing password');
  }
};

// Method to compare passwords
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('Comparing password:', candidatePassword); // Debugging line
    console.log('Stored hashed password:', this.password); // Debugging line
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match result:', isMatch); // Debugging line
    return isMatch;
  } catch (err) {
    console.error('Error comparing passwords:', err); // Debugging line
    throw new Error('Error comparing passwords');
  }
};

module.exports = mongoose.model('Admin', AdminSchema);
