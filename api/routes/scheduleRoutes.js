const express = require('express');

const scheduleController = require('../controllers/scheduleController');
const scheduleLinkController = require('../controllers/scheduleLinkController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route(`/:id/exportSchedule/:linkId`)
  .get(scheduleLinkController.generateICal);

router
  .route('/:id/scheduleLinks/')
  .get(
    authController.protect,
    scheduleLinkController.getScheduleLinks
  )
  .post(
    authController.protect,
    scheduleLinkController.createScheduleLink
  );

router
  .route('/:id/scheduleLinks/:linkId')
  .delete(
    authController.protect,
    scheduleLinkController.deleteScheduleLink
  );

router
  .route('/')
  .get(
    authController.protect,
    scheduleController.getSchedules
  )
  .post(
    authController.protect,
    scheduleController.createSchedule
  );

router
  .route('/:id')
  .get(
    authController.protect,
    scheduleController.getSchedule
  )
  .put(
    authController.protect,
    scheduleController.updateSchedule
  )
  .delete(
    authController.protect,
    scheduleController.deleteSchedule
  );

module.exports = router;
