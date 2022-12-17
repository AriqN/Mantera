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
const getSpecificUser = catchAsnyc(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const { level } = user;
  const exp = Math.round(0.5 * (level * 5) + 0.8 * (level * 9) + 200 * level);
  const updateLevel = await user.currentRead.map((el) => el.pageRead * 1);
  const progress = await updateLevel.reduce((a, b) => a + b);
  let newLevel = null;
  if (progress < exp) {
    newLevel = level;
  } else if (progress >= exp) {
    newLevel = level + 1;
  } else if (progress >= 2 * exp) {
    newLevel = level + 2;
  }
  // console.log(level, progress, exp, newLevel);
  user.level = newLevel;
  await User.findByIdAndUpdate(
    req.user.id,
    { level: newLevel },
    {
      new: true,
      runValidators: true,
    }
  );

  await res.status(200).json({
    status: 'success',
    data: user,
  });
});

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

  const duplicates = [...new Set(findDuplicates(allCurrentReadId))];
  if (duplicates.length > 0) {
    return next(new AppError('You are currently read this book!', 400));
  }
  const currentReadPromises = filteredInput.currentRead.map(
    async (id) => await Book.findById(id)
  );
  const newInput = await Promise.all(currentReadPromises);
  const newReadingMaterial = [...user.currentRead, ...newInput];
  user.currentRead = newReadingMaterial;
  // console.log(allCurrentReadId, newReadingMaterial);
  await User.updateOne(
    { _id: user.id },
    { $set: { currentRead: newReadingMaterial } },
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

const updateUserReadingProgress = catchAsnyc(async (req, res, next) => {
  const filteredInput = filterObj(req.body, 'pageRead');
  if (Object.values(filteredInput).length === 0) {
    return next(
      new AppError('You do not have permisson to update this data', 401)
    );
  }
  const userBook = await User.findOne(
    { _id: req.user.id },
    { currentRead: { $elemMatch: { _id: req.params.id } } }
  );
  // console.log(userBook.currentRead[0]);
  if (userBook.currentRead[0] === undefined) {
    return next(
      new AppError(
        'Data not found, please re-input the book to your reading material',
        404
      )
    );
  }

  const { pageRead, pages } = userBook.currentRead[0];
  const totalRead = pageRead + req.body.pageRead;
  if (totalRead > pages) {
    return next(
      new AppError(
        'Your reading progress exceed the max pages, please input the right number',
        400
      )
    );
  }
  await User.findOneAndUpdate(
    { _id: req.user.id },
    { $set: { 'currentRead.$[elem].pageRead': totalRead } },
    { arrayFilters: [{ 'elem._id': req.params.id }] }
  );
  next();
});

module.exports = {
  getAllUsers,
  getSpecificUser,
  createUser,
  deleteUser,
  updateUser,
  addBookToRead,
  updateUserReadingProgress,
};
