const express = require('express');

const eventTemplateController = require('../controllers/eventTemplateController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/schedule/:id')
  .get(authController.protect, eventTemplateController.aliasCombineSchedules);

router
  .route('/')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    eventTemplateController.getEventTemplates
  )
  .post(
    authController.protect,
    //authController.restrictTo('admin'),
    eventTemplateController.createEventTemplate
  );

router
  .route('/:id')
  .get(
    authController.protect,
    //authController.restrictTo('admin'),
    eventTemplateController.getEventTemplate
  )
  .put(
    authController.protect,
    //authController.restrictTo('admin'),
    eventTemplateController.updateEventTemplate
  )
  .delete(
    authController.protect,
    //authController.restrictTo('admin'),
    eventTemplateController.deleteEventTemplate
  );

module.exports = router;
