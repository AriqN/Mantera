const catchAsnyc = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
module.exports = catchAsnyc;
