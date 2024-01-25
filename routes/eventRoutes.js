const express = require(`express`);

const eventController = require(`./../controllers/eventController`);
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route(`/`)
  .get(authController.protect, eventController.getEvents)
  .post(
    authController.protect,
    //authController.restrictTo('admin'),
    eventController.createEvent
  );

router
  .route(`/:id`)
  .get(authController.protect, eventController.getEvent)
  .patch(
    authController.protect,
    //authController.restrictTo('admin'),
    eventController.updateEvent
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin'),
    eventController.deleteEvent
  );

module.exports = router;
