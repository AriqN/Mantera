const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const bookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Book must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Book name must have less or equal then 40 characters'],
      minlength: [3, 'Book name must have more or equal then 3 characters'],
      // validate: [validator.isAlpha, 'BookName must only contain letter'],
    },
    slug: {
      type: String,
    },
    // ratingsAverage: {
    //   type: Number,
    //   default: 5,
    //   min: [1, 'Rating must be above or equal to 1.0'],
    //   max: [5, 'Rating must be below or equal to 5.0'],
    // },
    // ratingsQuantity: {
    //   type: Number,
    //   default: 0,
    // },
    pages: {
      type: Number,
      required: [true, 'Book must have a page'],
    },
    pageRead: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          return val <= this.pages;
        },
        message: 'Page read : ({VALUE}) should be below or same as pages',
      },
    },
    genre: {
      type: String,
      required: [true, 'Book must have a genre'],
      enum: {
        values: [
          'romance',
          'horror',
          'action',
          'thriller',
          'comedy',
          'cartoon',
          'others',
        ],
        message:
          'genre is either romance, horror, action, thriller, comedy, cartoon, others',
      },
    },
    // summary: {
    //   type: String,
    //   trim: true,
    //   required: true,
    // },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Book must have a cover image'],
      default:
        'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80',
    },
    // images: {
    //   type: [String],
    // },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: {
      type: Date,
    },
    secretBook: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Document middleware : runs before .save() . create()
bookSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// bookSchema.post('save', (doc, next) => {
//   doc.price = Math.floor(doc.price / 5);
//   next();
// });

// Query Middleware
bookSchema.pre(/^find/, function (next) {
  this.find({ secretBook: { $ne: true } });
  this.start = Date.now();
  next();
});

// bookSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds`);
//   // console.log(docs);
//   next();
// });

// Aggregation Middleware
bookSchema.pre('aggregate', function (next) {
  // console.log(this.pipeline());
  this.pipeline().unshift({ $match: { secretBook: { $ne: true } } });
  next();
});
const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
