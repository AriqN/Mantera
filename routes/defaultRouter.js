const express = require('express');

const defaultRespond = (req, res) => {
  res.status(200).json({
    status: 'sucess',
    message: 'hello from mantera api :)',
  });
};
const router = express.Router();
// router.param('id', checkId);
router.route('/').get(defaultRespond);
module.exports = router;
