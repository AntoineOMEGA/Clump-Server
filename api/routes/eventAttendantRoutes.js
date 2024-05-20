const express = require(`express`);

const eventAttendantController = require(`./../controllers/eventAttendantController`);
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route(`/`)
  .get(authController.protect, eventAttendantController.getEventAttendants)
  .post(
    authController.protect,
    //authController.restrictTo('admin'),
    eventAttendantController.createEventAttendant
  );

router
  .route(`/:id`)
  .get(authController.protect, eventAttendantController.getEventAttendant)
  .put(
    authController.protect,
    //authController.restrictTo('admin'),
    eventAttendantController.updateEventAttendant
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin'),
    eventAttendantController.deleteEventAttendant
  );

module.exports = router;
