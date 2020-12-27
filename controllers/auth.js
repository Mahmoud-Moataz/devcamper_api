const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const token = user.getSignedJWTToken();

  res.status(200).json({ success: true, token });
});
