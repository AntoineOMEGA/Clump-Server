class APIFeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  filter() {
    //Filtering
    const queryObj = { ...this.queryString }
    const excludedFields = [
      'sort',
      'fields',
      'page',
      'limit',
      'startDate',
      'endDate',
    ]
    excludedFields.forEach((el) => delete queryObj[el])

    //Advanced Filtering
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

    this.query = this.query.find(JSON.parse(queryStr))

    return this
  }

  sort() {
    //Sorting

    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('type')
    }

    return this
  }

  limitFields() {
    //Field Limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ')
      console.log(fields)
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('-__v')
    }

    return this
  }

  paginate() {
    //Pagination
    const page = this.queryString.page * 1 || 1
    const limit = this.queryString.limit * 1 || 100
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)

    return this
  }
}

module.exports = APIFeatures
