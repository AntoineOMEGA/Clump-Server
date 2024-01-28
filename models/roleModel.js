const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  clumpID: {
    type: String,
    required: true,
  },
  canViewAssignments: {
    type: Array,
  },
  canEditAssignments: {
    type: Array,
  },
  canShareAssignments: {
    type: Array,
  },
  canViewSchedules: {
    type: Array,
  },
  canEditSchedules: {
    type: Array,
  },
  canShareSchedules: {
    type: Array,
  },
  canCreateAssignments: {
    type: Boolean,
    required: true,
    default: false
  },
  canCreateEvents: {
    type: Boolean,
    required: true,
    default: false
  },
  canCreateRoles: {
    type: Boolean,
    required: true,
    default: false
  },
  parentRole: {
    type: String,
  },
  childrenRoles: {
    type: Array,
  },
  canBeModified: {
    type: Boolean,
    required: true,
    default: false
  }
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;