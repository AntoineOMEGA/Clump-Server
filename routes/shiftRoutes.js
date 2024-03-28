const express = require('express');

const shiftController = require('../controllers/shiftController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    shiftController.getShifts
  )
  .post(
    authController.protect,
    //authController.restrictTo('admin'),
    shiftController.createShift
  );

router
  .route('/:id')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    shiftController.getShift
  )
  .put(
    authController.protect,
    //authController.restrictTo('admin'),
    shiftController.updateShift
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin'),
    shiftController.deleteShift
  );

module.exports = router;
