const express = require(`express`);

const calendarController = require(`./../controllers/calendarController`);

const router = express.Router();

router
  .route('/missionaries')
  .get(
    calendarController.aliasMissionaryCalendars,
    calendarController.getCalendars
  );

router
  .route(`/`)
  .get(calendarController.getCalendars)
  .post(calendarController.createCalendar);

router
  .route(`/:id`)
  .get(calendarController.getCalendar)
  .patch(calendarController.updateCalendar)
  .delete(calendarController.deleteCalendar);

module.exports = router;
