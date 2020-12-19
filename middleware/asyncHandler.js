const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

//another format :
// const asyncHandler = fn => (req, res, next) =>
//   Promise
//     .resolve(fn(req, res, next))
//     .catch(next)

module.exports = asyncHandler;
