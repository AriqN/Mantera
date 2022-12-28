const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const Book = require('../models/bookModel');

exports.bookSearch = catchAsync(async (req, res) => {
  const search = req.body.bookName;
  // console.log(search);
  const doc = await Book.find({
    name: { $regex: search, $options: 'i' },
  }); //case insensitive

  res.status(200).json({
    data: doc,
  });
});
exports.userSearch = catchAsync(async (req, res) => {
  const search = req.body.userName;
  // console.log(search);
  const doc = await User.find({
    name: { $regex: search, $options: 'i' },
  }); //case insensitive

  res.status(200).json({
    data: doc,
  });
});
