const express = require(`express`);

const eventController = require(`./../controllers/eventController`);
const eventAttendantController = require(`./../controllers/eventAttendantController`);
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route(`/`)
  .get(authController.protect, eventController.getEvents)
  .post(
    authController.protect,
    eventController.createEvent
  );

router
  .route(`/:id`)
  .get(authController.protect, eventController.getEvent)
  .put(
    authController.protect,
    eventController.updateEvent
  )
  .delete(
    authController.protect,
    eventController.deleteEvent
  );

router
  .route(`/attendant/`)
  .post(
    authController.protect,
    eventAttendantController.createEventAttendant
  );

router
  .route(`/attendant/:id`)
  .put(
    authController.protect,
    eventAttendantController.updateEventAttendant
  )
  .delete(
    authController.protect,
    eventAttendantController.deleteEventAttendant
  );

module.exports = router;
