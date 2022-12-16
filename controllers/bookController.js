/* eslint-disable node/no-unsupported-features/es-syntax */
// const fs = require('fs');
const Book = require('../models/bookModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsnyc = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const Books = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/Books-simple.json`)
// );

const aliasTopBooks = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

const getAllBooks = catchAsnyc(async (req, res, next) => {
  const features = new APIFeatures(Book.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const books = await features.query;
  // console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    resultsNumber: books.length,
    data: {
      books,
    },
  });
});

const getSpecificBook = catchAsnyc(async (req, res, next) => {
  // const id = (await req.params.id) * 1;
  const book = await Book.findById(req.params.id);
  // const Book = await Book.findOne({
  //   name: 'the forest hiker',
  // });
  if (!book) {
    return next(new AppError('No Book Found With That ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      book,
    },
  });
});
const createBook = catchAsnyc(async (req, res, next) => {
  const newBook = await Book.create(req.body);
  // console.log(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      book: newBook,
    },
  });
});

const patchBook = catchAsnyc(async (req, res, next) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!book) {
    return next(new AppError('No Book Found With That ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      updatedBook: book,
    },
  });
});
const deleteBook = catchAsnyc(async (req, res, next) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) {
    return next(new AppError('No Book Found With That ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: book,
  });
});

const getBookStats = catchAsnyc(async (req, res, next) => {
  const stats = await Book.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4 },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$genre' },
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPages: { $avg: '$pages' },
        minPages: { $min: '$pages' },
        maxPages: { $max: '$pages' },
        // totalPrice: { $sum: '$price' },
      },
    },
    {
      $sort: {
        avgRatings: -1,
      },
    },
    // {
    //   $match: {
    //     _id: { $ne: 'EASY' },
    //   },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// const getMonthlyPlan = async (req, res) => {
//   try {
//     const year = req.params.year * 1;
//     // console.log(year);
//     const plan = await Tour.aggregate([
//       {
//         $unwind: '$startDates',
//       },
//       {
//         $match: {
//           startDates: {
//             $gte: new Date(`${year}-01-01`),
//             $lt: new Date(`${year}-12-31`),
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { $month: '$startDates' },
//           numTour: { $sum: 1 },
//           tours: { $push: '$name' },
//         },
//       },
//       {
//         $addFields: {
//           month: '$_id',
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//         },
//       },
//       {
//         $sort: {
//           numTour: -1,
//         },
//       },
//       {
//         $limit: 8,
//       },
//     ]);
//     res.status(200).json({
//       status: 'success',
//       data: {
//         plan,
//         planNumber: plan.length,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err,
//     });
//   }
// };

module.exports = {
  aliasTopBooks,
  getAllBooks,
  getSpecificBook,
  patchBook,
  deleteBook,
  createBook,
  getBookStats,
  // getMonthlyPlan,
};
