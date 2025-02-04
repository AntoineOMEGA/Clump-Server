const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const roleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  clumpID: {
    type: ObjectId,
    required: true,
  },
  canViewAssignments: {
    type: Array,
  },
  canEditAssignments: {
    type: Array,
  },
  canViewSchedules: {
    type: Array,
  },
  canEditSchedules: {
    type: Array,
  },
  canCreateEventTemplates: {
    type: Boolean,
    required: true,
    default: false,
  },
  canCreateEvents: {
    type: Boolean,
    required: true,
    default: false,
  },
  canCreateRoles: {
    type: Boolean,
    required: true,
    default: false,
  },
  canCreateSchedules: {
    type: Boolean,
    required: true,
    default: false,
  },
  parentRole: {
    type: String,
  },
  canBeModified: {
    type: Boolean,
    required: true,
    default: true,
  },
})

const Role = mongoose.model('Role', roleSchema)

module.exports = Role
