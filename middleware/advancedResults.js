const advancedResults = (model, populate) => async (req, res, next) => {
  //Filtering
  let query;

  //Copy req.query as I thing we don't want to edit in req.query object itself as we will deal with it's params when we need like in if statements select filtering and sorting
  const reqQuery = { ...req.query };

  //Fields to execute because when we send /?select=name request , select here is treated
  //as an actual field in database to match by filtering so we want to remove it and continue
  const removeFields = ['select', 'sort', 'page', 'limit'];

  //Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  //Create query string
  let queryStr = JSON.stringify(reqQuery);

  //Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  //Finding resource
  query = model.find(JSON.parse(queryStr)).populate('courses');

  //Select Fields
  if (req.query.select) {
    //mongoose handles it by spaces not commas
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  //Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    //Default sorting
    query = query.sort('-createdAt');
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  //Executing query
  const results = await query;

  //showing Pagination result & additonal information
  const endIndex = page * limit;
  const total = await model.countDocuments();
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (skip > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  //to pass value from middleware to next one we pass it on 'res' or 'req' object as next middleware has access to its properties (show getBootcamps() method controller)
  res.advancedResults = { success: true, count: results.length, pagination, data: results };
  next();
};

module.exports = advancedResults;
