const path = require('path')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')

const Bootcamp = require('../models/Bootcamp')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query }
  // removing query fields for selecting specific properties 
  // inside searched data or for sorting
  const removeFields = ['select', 'sort', 'page', 'limit']
  removeFields.forEach(param => delete reqQuery[param])

  // Adding '$' in front of gt|gte|etc. in order to match mongoose query API
  const queryString = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
  let query = Bootcamp.find(JSON.parse(queryString)).populate('courses')

  // selecting only specifig fields
  if (req.query.select) {
    // Mongoose API asks for param passed to .select to be a string with
    // space between values if multiple values exist
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)
  }

  // sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  }

  // pagination
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 25
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const totalNumberOfDocuments = await Bootcamp.countDocuments()

  query = query.skip(startIndex).limit(limit)

  const bootcamps = await query

  // Pagination result
  const pagination = {}
  if (endIndex < totalNumberOfDocuments) {
    pagination.next = {
      page: page + 1,
      limit,
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }
  
  res.status(200).json({ success: true, data: bootcamps, count: bootcamps.length, pagination })
})

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  })
})

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps/
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body)

  res.status(201).json({
    success: true,
    data: bootcamp,
  }) 
})

// @desc    Update a bootcamps
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
  } 

  res.status(200).json({ success: true, data: bootcamp }) 
})

// @desc    Delete a bootcamps
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
  }

  // Remove method is going to trigger BootcampSchema.pre('remove'...) middleware
  // Previously, we used findByIdAndDelete method, which would not trigger the mentioned middleware
  bootcamp.remove()

  res.status(200).json({ success: true, data: {} }) 
})

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode)
  const lat = loc[0].latitude
  const lng = loc[0].longitude

  // Calc radius using radians
  // Divide distance by radius of Earth
  // Earth radius === 3,963 miles / 6,378 km
  const radius = distance / 3963
  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    }
  })

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  })
})

// @desc    Upload a photo to a bootcamps
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400))
  }

  const {file} = req.files

  // Make sure the uploaded image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400))
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload an image which is smaller than ${process.env.MAX_FILE_UPLOAD / 100000} MB`, 400))
  }

  // Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err)
      return next(new ErrorResponse(`Problem with file upload`, 500))
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })
    res.status(200).json({ success: true, data: file.name })
  })
})