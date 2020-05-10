const express = require('express')
const {
  getReviews,
} = require('../controllers/reviews')

const Review = require('../models/Review')

const { protect, authorize } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')

// mergeParams to get re-routing to work (coming from /:bootcampId/reviews)
const router = express.Router({ mergeParams: true })

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'bootcamps',
      select: 'name description'
    }),
    getReviews
  )

  module.exports = router
  