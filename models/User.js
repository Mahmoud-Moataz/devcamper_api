const crypto = require('crypto');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please add a name'],
  },
  email: {
    type: String,
    required: [true, 'please add an email'],
    match: [/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/, 'enter a valid email'],
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please add a password'],
    minlength: 6,
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//Encrypt password using bcryptjs
userSchema.pre('save', async function (next) {
  //if document is just created now so isModified function for all this document fields will return true
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});

//Sign JWT and return
userSchema.methods.getSignedJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//Match user's entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  //compare method returns true if matched or false if not
  return await bcryptjs.compare(enteredPassword, this.password);
};

//generate and hash password token (reset password token)
userSchema.methods.getResetPasswordToken = function () {
  //Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  //Generate token and set to resetPasswordToken
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  //updateOne() doesn't save in database too, so we can't use it
  // this.updateOne({
  //   resetPasswordToken: crypto.createHash('sha256').update(resetToken).digest('hex'),
  //   resetPasswordExpire: Date.now() + 10 * 60 * 1000,
  // });

  return resetToken;
};
module.exports = mongoose.model('User', userSchema);
