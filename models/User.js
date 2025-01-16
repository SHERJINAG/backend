const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema
const UserSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  phoneNumber: { type: String },
  status: { type: String, enum: ['Student', 'Worker'], default: 'Student' },
});

// Pre-save middleware to hash the password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    console.log('Original Password:', this.password);
    console.log('Hashed Password:', hashedPassword);
    this.password = hashedPassword;
    next();
  } catch (err) {
    console.error('Error hashing password:', err.message);
    return next(err);
  }
});

// Method to match the entered password with the hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
 
  
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    
    if (!isMatch) {
      
      return false;
    }
    
    
    return true;
  } catch (err) {
    console.error('Error during password comparison:', err.message);
    throw new Error('Password comparison error');
  }
};

// Export the model
module.exports = mongoose.model('User', UserSchema);
