const express = require('express');
const {
  getCourses,
  addCourse,
  getCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');
const { route } = require('./bootcamps');

const router = express.Router({ mergeParams: true });

router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

router.route('/').get(getCourses).post(addCourse);

module.exports = router;
