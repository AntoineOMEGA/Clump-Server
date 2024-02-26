const express = require('express');

const scheduleController = require('../controllers/scheduleController');
const authController = require('../controllers/authController');

const router = express.Router();

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
  .patch(
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
