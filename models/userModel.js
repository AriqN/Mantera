const mongoose = require('mongoose');
// const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// const Book = require('./bookModel');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User must have a name'],
      unique: [true, 'User name already used'],
      trim: true,
      maxlength: [20, 'User name must have less or equal then 20 characters'],
      minlength: [3, 'User name must have more or equal then 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'User must input an email'],
      unique: [true, 'Email already used'],
      lowercase: true,
      validate: [validator.isEmail, 'please use valid email'],
    },
    photo: {
      type: String,
    },
    level: {
      type: Number,
      default: 1,
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'author', 'user'],
        message: 'role is either admin, author, user',
      },
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'User must have a password'],
      minlength: [8, 'password must have more or equal then 8 characters'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'passwords are not the same',
      },
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now(),
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    currentRead: [
      {
        name: {
          type: String,
          unique: true,
        },
        pages: Number,
        pageRead: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 13);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});
userSchema.methods.verifyPassword = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changeTimestamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
