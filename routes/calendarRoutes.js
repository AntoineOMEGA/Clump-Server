const express = require(`express`);

const calendarController = require(`./../controllers/calendarController`);
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/missionaries')
  .get(
    authController.protect, 
    calendarController.aliasMissionaryCalendars,
    calendarController.getCalendars
  );

router
  .route(`/`)
  .get(authController.protect, calendarController.getCalendars)
  .post(authController.protect, calendarController.createCalendar);

router
  .route(`/:id`)
  .get(authController.protect, calendarController.getCalendar)
  .patch(authController.protect, calendarController.updateCalendar)
  .delete(authController.protect, authController.restrictTo('admin', 'site'), calendarController.deleteCalendar);

module.exports = router;
