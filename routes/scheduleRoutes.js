const express = require('express');

const scheduleController = require('../controllers/scheduleController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/combine-schedules')
  .get(authController.protect, scheduleController.aliasCombineSchedules);

router
  .route('/sync/:id')
  .post(authController.protect, scheduleController.aliasSyncSchedule);

router.route(`/autoSync`).post(scheduleController.aliasAutoSyncSchedule);

router
  .route('/')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleController.getSchedules
  )
  .post(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleController.createSchedule
  );

router
  .route('/:id')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleController.getSchedule
  )
  .put(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleController.updateSchedule
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleController.deleteSchedule
  );

module.exports = router;
