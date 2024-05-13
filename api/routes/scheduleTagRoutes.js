const express = require('express');

const scheduleTagController = require('../controllers/scheduleTagController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleTagController.getScheduleTags
  )
  .post(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleTagController.createScheduleTag
  );

router
  .route('/:id')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleTagController.getScheduleTag
  )
  .put(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleTagController.updateScheduleTag
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleTagController.deleteScheduleTag
  );

module.exports = router;
