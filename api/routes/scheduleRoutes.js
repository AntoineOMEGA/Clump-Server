const express = require('express');

const scheduleController = require('../controllers/scheduleController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/ical/:id')
  .get(scheduleController.aliasGenerateICal);

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
