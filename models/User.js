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
module.exports = mongoose.model('User', userSchema);
