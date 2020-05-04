const express = require('express')
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses')

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
  .post(createCourse)

router
  .route('/:id')
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse)

module.exports = router

