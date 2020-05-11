const express = require('express')
const {
  getReviews,
  getReview,
  addReview,
  upadateReview,
  deleteReview
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
      path: 'bootcamp',
      select: 'name description'
    }),
    getReviews
  )
  .post(protect, authorize('user', 'admin'), addReview)

router
    .route('/:id')
    .get(getReview)
    .put(protect, authorize('user', 'admin'), upadateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview)

  module.exports = router
  