const Bootcamp = require('../models/Bootcamp');

//@desc     get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   public
exports.getBootcamps = async (req, res, next) => {
  const bootCamps = await Bootcamp.find();

  res.status(200).json({ success: true, count: bootCamps.length, data: bootCamps });
};

//@desc     get single bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return res.status(404).json({ success: false });
    }

    res.status(200).json({ success: true, data: bootcamp });
  } catch (error) {
    next(error);
  }
};

//@desc     create bootcamp
//@route    POST /api/v1/bootcamps
//@access   private
exports.createBootcamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(200).json({ success: true, data: bootcamp });
};

//@desc     update bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@access   private
exports.updateBootcamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return res.status(404).json({ success: false });
  }

  res.status(200).json({ success: true, data: bootcamp });
};

//@desc     delete bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   private
exports.deleteBootcamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp) {
    return res.status(404).json({ success: false });
  }
  res.status(200).json({ success: true, data: {} });
};
