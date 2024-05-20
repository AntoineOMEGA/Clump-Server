const express = require(`express`);

const eventExceptionController = require(`./../controllers/eventExceptionController`);
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route(`/`)
  .get(authController.protect, eventExceptionController.getEventExceptions)
  .post(
    authController.protect,
    //authController.restrictTo('admin'),
    eventExceptionController.createEventException
  );

router
  .route(`/:id`)
  .get(authController.protect, eventExceptionController.getEventException)
  .put(
    authController.protect,
    //authController.restrictTo('admin'),
    eventExceptionController.updateEventException
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin'),
    eventExceptionController.deleteEventException
  );

module.exports = router;
