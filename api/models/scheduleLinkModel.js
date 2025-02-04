const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const validator = require('validator')

const scheduleLinkSchema = new Schema({
  scheduleID: {
    type: ObjectId,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail],
  },
})

//TODO: Make Combination Unique so you can only send an email once to a particular email per schedule

const ScheduleLink = mongoose.model('ScheduleLink', scheduleLinkSchema)

module.exports = ScheduleLink
