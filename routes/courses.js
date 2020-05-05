const express = require('express')
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses')

const { protect } = require('../middleware/auth')

const Course = require('../models/Course')
const advancedResults = require('../middleware/advancedResults')

// mergeParams to get re-routing to work (coming from /:bootcampId/courses)
const router = express.Router({ mergeParams: true })

router
  .route('/')
  // first middleware is advancedResults, which changes res.advancedResults,
  // and calls next() middleware, which will be getCourses
  .get(advancedResults(Course, {
    path: 'bootcamp',
    select: 'name description'
  }), getCourses)
  .post(protect, createCourse)

router
  .route('/:id')
  .get(getCourse)
  .put(protect, updateCourse)
  .delete(protect, deleteCourse)

module.exports = router

