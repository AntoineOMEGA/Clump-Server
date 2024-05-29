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
    eventTemplateController.getEventTemplates
  )
  .post(
    authController.protect,
    eventTemplateController.createEventTemplate
  );

router
  .route('/:id')
  .get(
    authController.protect,
    eventTemplateController.getEventTemplate
  )
  .put(
    authController.protect,
    eventTemplateController.updateEventTemplate
  )
  .delete(
    authController.protect,
    eventTemplateController.deleteEventTemplate
  );

module.exports = router;
