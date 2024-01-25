const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  clumpID: {
    type: String,
    require: true,
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
  parentRole: {
    type: String,
  },
  childrenRoles: {
    type: Array,
  },
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;