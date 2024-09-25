const express = require(`express`);

const eventAttendeeController = require(`./../controllers/eventAttendeeController`);
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route(`/`)
  .post(
    authController.protect,
    eventAttendeeController.createEventAttendee
  );

router
  .route(`/:id`)
  .put(
    authController.protect,
    eventAttendeeController.updateEventAttendee
  )
  .delete(
    authController.protect,
    eventAttendeeController.deleteEventAttendee
  );

router
  .route('/thisEventAttendee/:id')
  .put(authController.protect, eventAttendeeController.updateThisEventAttendee)
  .delete(authController.protect, eventAttendeeController.deleteThisEventAttendee);

router
  .route('/thisAndFollowingEventAttendees/:id')
  .put(authController.protect, eventAttendeeController.updateThisAndFollowingEventAttendees)
  .delete(authController.protect, eventAttendeeController.deleteThisAndFollowingEventAttendees);

router
  .route('/allEventAttendees/:id')
  .put(authController.protect, eventAttendeeController.updateAllEventAttendees)
  .delete(authController.protect, eventAttendeeController.deleteAllEventAttendees);

module.exports = router;
