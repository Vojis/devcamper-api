const express = require('express')
const {
  getCourses,
} = require('../controllers/courses')

// mergeParams to get re-routing to work (coming from /:bootcampId/courses)
const router = express.Router({ mergeParams: true })

router
  .route('/')
  .get(getCourses)

module.exports = router

