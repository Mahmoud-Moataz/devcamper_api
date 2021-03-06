const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./asyncHandler');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }
  //set token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  //we put try-catch block here to handle this error -if verifing token failed- with a specific message not the orginal error message (or) without try-catch we can in our custom error handler middlware check for jsonwebtoken error and put our message
  try {
    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

//Grant access to specific role (role authorization)
//we enclose our callback function with outer function to send roles parameter because middleware function recieve only (req,res,next) so we make this trick (as in React.js to send param to event callbac function)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
