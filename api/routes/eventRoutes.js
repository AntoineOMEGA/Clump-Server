const express = require(`express`);

const eventController = require(`./../controllers/eventController`);
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

module.exports = router;
