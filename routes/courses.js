const express = require('express');
const {
  getCourses,
  addCourse,
  getCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');

//advancedResults middleware
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const Course = require('../models/Course');

const router = express.Router({ mergeParams: true });

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin', 'publisher'), updateCourse)
  .delete(protect, authorize('admin', 'publisher'), deleteCourse);

router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses
  )
  .post(protect, authorize('admin', 'publisher'), addCourse);

module.exports = router;
