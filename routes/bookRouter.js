const express = require('express');
const {
  aliasTopBooks,
  getAllBooks,
  getSpecificBook,
  patchBook,
  deleteBook,
  createBook,
  getBookStats,
} = require('../controllers/bookController');
const { protect, restrictTo } = require('../controllers/authController');
const { bookSearch } = require('../controllers/searchController');

const router = express.Router();
// router.param('id', checkId);
router.route('/top-5-cheap-books').get(aliasTopBooks, getAllBooks);
router.route('/book-stats').get(getBookStats);
router.route('/').get(protect, getAllBooks).post(createBook);
router.route('/search').post(bookSearch);
router
  .route('/:id')
  .get(getSpecificBook)
  .patch(patchBook)
  .delete(protect, restrictTo('admin'), deleteBook);

module.exports = router;
