const express = require('express')
const checkPermissions = require('../middleware/checkPermissions')

const scheduleController = require('../controllers/scheduleController')
const scheduleLinkController = require('../controllers/scheduleLinkController')
const authController = require('../controllers/authController')

const router = express.Router()

router
  .route('/:scheduleId/exportSchedule/:linkId')
  .get(scheduleLinkController.generateICal)

router
  .route('/:scheduleId/scheduleLinks')
  .get(authController.protect, scheduleLinkController.getScheduleLinks)
  .post(authController.protect, scheduleLinkController.createScheduleLink)

router
  .route('/:scheduleId/scheduleLinks/:linkId')
  .delete(authController.protect, scheduleLinkController.deleteScheduleLink)

router
  .route('/')
  .get(authController.protect, scheduleController.getSchedules)
  .post(authController.protect, scheduleController.createSchedule)

router
  .route('/:scheduleId')
  .get(
    authController.protect,
    checkPermissions('view'),
    scheduleController.getSchedule
  )
  .put(
    authController.protect,
    checkPermissions('edit'),
    scheduleController.updateSchedule
  )
  .delete(
    authController.protect,
    checkPermissions('admin'),
    scheduleController.deleteSchedule
  )

module.exports = router
