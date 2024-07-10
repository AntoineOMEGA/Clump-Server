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

  router
  .route('/thisEvent/:id')
  .put(authController.protect, eventController.updateThisEvent)
  .delete(authController.protect, eventController.deleteThisEvent);

  router
  .route('/thisAndFollowingEvents/:id')
  .put(authController.protect, eventController.updateThisAndFollowingEvents)
  .delete(authController.protect, eventController.deleteThisAndFollowingEvents);

  router
  .route('/allEvents/:id')
  .put(authController.protect, eventController.updateAllEvents)
  .delete(authController.protect, eventController.deleteAllEvents);

module.exports = router;
