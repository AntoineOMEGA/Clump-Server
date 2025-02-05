const Schedule = require('../models/scheduleModel')
const Event = require('../models/eventModel')

const checkPermissions = (requiredLevel) => {
  return async (req, res, next) => {
    let scheduleId

    if (req.params.scheduleId) {
      scheduleId = req.params.scheduleId
    } else if (req.params.eventId) {
      const event = await Event.findById(req.params.eventId)
      if (!event) {
        return res.status(404).json({ message: 'Event not found' })
      }
      scheduleId = event.scheduleID
    }

    const schedule = await Schedule.findById(scheduleId)
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' })
    }

    const userPermission = schedule.permissions.find(
      (permission) => permission.user.toString() === req.user.id
    )

    if (
      !userPermission ||
      !['admin', requiredLevel].includes(userPermission.level)
    ) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to perform this action' })
    }

    next()
  }
}

module.exports = checkPermissions
