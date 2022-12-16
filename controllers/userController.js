/* eslint-disable node/no-unsupported-features/es-syntax */
const User = require('../models/userModel');
const catchAsnyc = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Book = require('../models/bookModel');

const filterObj = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObject[el] = obj[el];
  });
  return newObject;
};
// const filterArr = (obj, allowedFields) => {
//   const newObject = {};
//   // console.log(allowedFields);
//   Object.keys(obj).forEach((el) => {
//     console.log(Object.keys(obj));
//     if (allowedFields.includes(el)) newObject[el] = obj[el];
//   });
//   return newObject;
// };
const getAllUsers = catchAsnyc(async (req, res, next) => {
  const users = await User.find();
  // console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    resultsNumber: users.length,
    data: {
      users,
    },
  });
});

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route not yet define',
  });
};
const getSpecificUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route not yet define',
  });
};

const updateUser = catchAsnyc(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for updating password, please use /updatePassword instead',
        400
      )
    );
  }
  const filteredInput = filterObj(req.body, 'name', 'email');
  if (Object.values(filteredInput).length === 0) {
    return next(
      new AppError('You do not have permisson to update this data', 401)
    );
  }
  const updatedData = await User.findByIdAndUpdate(req.user.id, filteredInput, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      update: updatedData,
    },
  });
});

const deleteUser = catchAsnyc(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const addBookToRead = catchAsnyc(async (req, res, next) => {
  const filteredInput = filterObj(req.body, 'currentRead');
  if (Object.values(filteredInput).length === 0) {
    return next(
      new AppError('You do not have permisson to update this data', 401)
    );
  }
  const user = await User.findById(req.user.id);

  const oldInput = user.currentRead.map((result) => result._id.toString());
  const allCurrentReadId = [...oldInput, ...filteredInput.currentRead];
  const findDuplicates = (arr) =>
    arr.filter((item, index) => arr.indexOf(item) !== index);

  // console.log(allCurrentReadId);
  const duplicates = [...new Set(findDuplicates(allCurrentReadId))];
  if (duplicates.length > 0) {
    return next(new AppError('You are currently read this book!', 400));
  }
  const currentReadPromises = allCurrentReadId.map(
    async (id) => await Book.findById(id)
  );
  const newInput = await Promise.all(currentReadPromises);
  user.currentRead = newInput;
  await User.updateOne(
    { _id: user.id },
    { $set: { currentRead: newInput } },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: 'success',
    data: {
      update: user,
    },
  });
});

module.exports = {
  getAllUsers,
  getSpecificUser,
  createUser,
  deleteUser,
  updateUser,
  addBookToRead,
};
