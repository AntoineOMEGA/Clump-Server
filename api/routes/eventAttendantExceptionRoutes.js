const express = require(`express`);

const eventAttendantExceptionController = require(`./../controllers/eventAttendantExceptionController`);
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route(`/`)
  .get(authController.protect, eventAttendantExceptionController.getEventAttendantExceptions)
  .post(
    authController.protect,
    //authController.restrictTo('admin'),
    eventAttendantExceptionController.createEventAttendantException
  );

router
  .route(`/:id`)
  .get(authController.protect, eventAttendantExceptionController.getEventAttendantException)
  .put(
    authController.protect,
    //authController.restrictTo('admin'),
    eventAttendantExceptionController.updateEventAttendantException
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin'),
    eventAttendantExceptionController.deleteEventAttendantException
  );

module.exports = router;
