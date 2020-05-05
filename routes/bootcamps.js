const express = require('express')
const { 
  getBootcamps,
  getBootcamp, 
  createBootcamp, 
  updateBootcamp, 
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
} = require('../controllers/bootcamps')

const { protect, authorize } = require('../middleware/auth')

const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')

// Include other resource routers
const courseRouter = require('./courses')

const router = express.Router()

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter)

router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsInRadius)

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

router
  .route('/')
  // first middleware is advancedResults, which changes res.advancedResults,
  // and calls next() middleware, which will be getBootcamps
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp)
  
router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp)

module.exports = router

