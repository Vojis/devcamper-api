const express = require('express')
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses')

// mergeParams to get re-routing to work (coming from /:bootcampId/courses)
const router = express.Router({ mergeParams: true })

router
  .route('/')
  .get(getCourses)
  .post(createCourse)

router
  .route('/:id')
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse)

module.exports = router

