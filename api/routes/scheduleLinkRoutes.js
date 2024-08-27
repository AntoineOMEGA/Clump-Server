const express = require('express');

const scheduleLinkController = require('../controllers/scheduleLinkController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route(`/exportSchedule/:id`)
  .get(authController.protect, scheduleLinkController.generateICal);

router
  .route('/')
  .get(
    authController.protect,
    scheduleLinkController.getScheduleLinks
  )
  .post(
    authController.protect,
    scheduleLinkController.createScheduleLink
  );

router
  .route('/:id')
  .get(
    authController.protect,
    scheduleLinkController.getScheduleLink
  )
  .put(
    authController.protect,
    scheduleLinkController.updateScheduleLink
  )
  .delete(
    authController.protect,
    scheduleLinkController.deleteScheduleLink
  );

module.exports = router;
