const express = require('express');

const iCalController = require('../controllers/iCalController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    iCalController.getSchedules
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
