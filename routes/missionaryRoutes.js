const express = require('express');

const missionaryController = require('../controllers/missionaryController');
const authController = require('../controllers/authController');

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
  .route('/')
  .get(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    missionaryController.getMissionaries
  )
  .post(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    missionaryController.createMissionary
  );

router
  .route('/:id')
  .get(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    missionaryController.getMissionary
  )
  .patch(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    missionaryController.updateMissionary
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin', 'leader'),
    missionaryController.deleteMissionary
  );

module.exports = router;
