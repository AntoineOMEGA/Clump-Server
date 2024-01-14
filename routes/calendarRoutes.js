const express = require(`express`);

const calendarController = require(`./../controllers/calendarController`);
const authController = require('./../controllers/authController');

const router = express.Router();

/*
router
  .route('/missionaries')
  .get(
    authController.protect, 
    calendarController.aliasMissionaryCalendars,
    calendarController.getCalendars
  );
  */

router
  .route(`/`)
  .get(authController.protect, authController.restrictTo('admin', 'leader'), calendarController.getCalendars)
  .post(authController.protect, authController.restrictTo('admin', 'leader'), calendarController.createCalendar);

router
  .route(`/:id`)
  .get(authController.protect, authController.restrictTo('admin', 'leader'), calendarController.getCalendar)
  .patch(authController.protect, authController.restrictTo('admin', 'leader'), calendarController.updateCalendar)
  .delete(authController.protect, authController.restrictTo('admin', 'leader'), calendarController.deleteCalendar);

module.exports = router;
