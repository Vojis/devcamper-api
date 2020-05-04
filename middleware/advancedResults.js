const advancedResults = (model, populate) => async (req, res, next) => {
  const reqQuery = { ...req.query }
  // removing query fields for selecting specific properties 
  // inside searched data or for sorting
  const removeFields = ['select', 'sort', 'page', 'limit']
  removeFields.forEach(param => delete reqQuery[param])

  // Adding '$' in front of gt|gte|etc. in order to match mongoose query API
  const queryString = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
  let query = model.find(JSON.parse(queryString))

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

  // populate values
  if (populate) {
    query = query.populate(populate)
  }

  // pagination
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 25
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const totalNumberOfDocuments = await model.countDocuments()

  query = query.skip(startIndex).limit(limit)

  const results = await query

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

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  }

  next()
}

module.exports = advancedResults
