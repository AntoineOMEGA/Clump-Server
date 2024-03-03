const express = require('express');

const scheduleCategoryController = require('../controllers/scheduleCategoryController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleCategoryController.getScheduleCategorys
  )
  .post(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleCategoryController.createScheduleCategory
  );

router
  .route('/:id')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleCategoryController.getScheduleCategory
  )
  .patch(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleCategoryController.updateScheduleCategory
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin'),
    scheduleCategoryController.deleteScheduleCategory
  );

module.exports = router;
