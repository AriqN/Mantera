const express = require('express');
const {
  signUp,
  userLogin,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
} = require('../controllers/authController');
const {
  getAllUsers,
  getSpecificUser,
  createUser,
  deleteUser,
  updateUser,
  addBookToRead,
  updateUserReadingProgress,
} = require('../controllers/userController');
const { userSearch } = require('../controllers/searchController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', userLogin);
router.post('/forgotPassword', forgotPassword);
router.post('/searchUser', protect, userSearch);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword', protect, updatePassword);
router.patch('/updateMe', protect, updateUser);
router.patch('/readBook', protect, addBookToRead);

router.patch(
  '/updateProgress/:id',
  protect,
  updateUserReadingProgress,
  getSpecificUser
);
router.get('/myData', protect, getSpecificUser);
router.delete('/deleteMe', protect, deleteUser);

router.route('/').get(getAllUsers).post(createUser);
router
  .route('/:id')
  .get(getSpecificUser)
  .patch(protect, updateUser)
  .delete(deleteUser);

module.exports = router;
